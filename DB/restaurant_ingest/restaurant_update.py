import time
import pymysql
import math
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

API_KEY = "6ac973f6f1586ff7c12f5f87f7cd28e6"
headers = {"Authorization": f"KakaoAK {API_KEY}"}
url = "https://dapi.kakao.com/v2/local/search/keyword.json"

# DB 연결
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='5242',
    db='FFS',
    charset='utf8mb4'
)
cursor = conn.cursor()

# Selenium 설정
options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)

# 정문/후문 기준 좌표
MAIN_GATE = (37.549048, 127.075217)
BACK_GATE = (37.552936, 127.072474)
DIST_STD = 400  # 미터

# 위치 판별 함수
def get_location_tag(lat, lon):
    def haversine(lat1, lon1, lat2, lon2):
        R = 6371e3
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    dist_main = haversine(lat, lon, *MAIN_GATE)
    dist_back = haversine(lat, lon, *BACK_GATE)
    if dist_main <= DIST_STD:
        return "정문"
    elif dist_back <= DIST_STD:
        return "후문"
    return "기타"

# DB에서 업데이트 필요한 행만 추출
cursor.execute("""
    SELECT id, name, kakao_id, rating, location_tag FROM restaurant
    WHERE rating = 0.0 OR location_tag = '기타'
""")
rows = cursor.fetchall()

for id_, name, kakao_id, existing_rating, existing_tag in rows:
    try:
        update_fields, update_values = [], []

        # 좌표를 얻기 위한 키워드 API 호출
        params = {"query": name, "page": 1, "size": 1}
        response = requests.get(url, headers=headers, params=params)
        documents = response.json().get("documents", [])

        if documents:
            doc = documents[0]
            x = float(doc['x'])
            y = float(doc['y'])
            location_tag = get_location_tag(y, x)

            if existing_tag == '기타' and location_tag != '기타':
                update_fields.append("location_tag = %s")
                update_values.append(location_tag)

        # 별점 파싱
        if existing_rating == 0.0:
            driver.get(f"https://place.map.kakao.com/{kakao_id}")
            time.sleep(2)
            try:
                rating_elem = driver.find_element(By.CSS_SELECTOR, 'span.starred_grade > span.num_star')
                rating_text = rating_elem.text.strip()
                rating = float(rating_text) if rating_text.replace('.', '', 1).isdigit() else None
                if rating is not None:
                    update_fields.append("rating = %s")
                    update_values.append(rating)
            except:
                pass

        if update_fields:
            update_values.append(kakao_id)
            cursor.execute(f"""
                UPDATE restaurant SET {', '.join(update_fields)}
                WHERE kakao_id = %s
            """, tuple(update_values))
            conn.commit()
            print(f"🔄 ID {id_} ({name}) 정보 업데이트 완료")
        else:
            print(f"⏩ ID {id_} ({name}) 건너뜀 (업데이트 없음)")

    except Exception as e:
        print(f"❌ ID {id_} ({name}) 처리 실패: {e}")

driver.quit()
conn.close()
