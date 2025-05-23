import time
import pymysql
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException

API_KEY = "6ac973f6f1586ff7c12f5f87f7cd28e6"
headers = {"Authorization": f"KakaoAK {API_KEY}"}

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
url = "https://dapi.kakao.com/v2/local/search/keyword.json"


# 검색할 음식점 리스트 입력
# ([name], [category], is_new)
restaurant_list = [
    ("멘츠루","일식", False),
    ("포템템","아시안", True),
    ("무한정","한식"),
    ("모락","한식"),
]

# 정문/후문 태그 저장 함수
import math

def get_location_tag(y, x):
    def haversine(lat1, lon1, lat2, lon2):
        R = 6371e3  # 지구 반지름 (미터)
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    # 기준 좌표
    main_gate = (37.549048, 127.075217)
    back_gate = (37.552936, 127.072474)
    dist_std = 400

    dist_main = haversine(y, x, *main_gate)
    dist_back = haversine(y, x, *back_gate)

    if dist_main <= dist_std:
        return "정문"
    elif dist_back <= dist_std:
        return "후문"
    else:
        return "기타"

# API 검색 및 정보 수집
for name, category, is_new in restaurant_list:
    params = {
        "query": name,
        "x": 127.073651,
        "y": 37.550978,
        "radius": 1000,
        "sort": "accuracy",
        "size": 1
    }
    response = requests.get(url, headers=headers, params=params)
    documents = response.json().get("documents", [])

    if not documents:
        print(f"❌ 검색 결과 없음: {name}")
        continue

    doc = documents[0]
    for doc in documents:
        try:
            kakao_id = doc['id']
            cursor.execute("SELECT COUNT(*) FROM restaurant WHERE kakao_id = %s", (kakao_id,))
            if cursor.fetchone()[0]:
                print(f"⚠️ {doc['place_name']} 이미 존재함, 건너뜀")
                continue

            kakao_url = f"https://place.map.kakao.com/{kakao_id}"
            driver.get(kakao_url)
            time.sleep(2)

            # 별점
            try:
                rating_element = driver.find_element(By.CSS_SELECTOR, 'span.starred_grade > span.num_star')
                rating_text = rating_element.text.strip()
                rating = float(rating_text) if rating_text and rating_text.replace('.', '', 1).isdigit() else None
            except:
                rating = None

            if rating is not None and rating < 3.5:
                print(f"⚠️ {doc['place_name']} 별점 {rating}점으로 제외됨")
                continue

            # 오픈 시간
            open_time = None
            try:
                btn = driver.find_element(By.CSS_SELECTOR, 'button[aria-controls="foldDetail2"]')
                driver.execute_script("arguments[0].click();", btn)
                time.sleep(1)
                spans = driver.find_elements(By.CSS_SELECTOR, '#foldDetail2 .txt_detail')
                for span in spans:
                    text = span.text.strip()
                    if '휴무' not in text and '~' in text:
                        open_time = text.replace(' ', '')
                        break
            except:
                pass

            # 이미지
            try:
                main_img = driver.find_element(
                    By.CSS_SELECTOR, 'div.board_photo.only_pc div.inner_board div.col a.link_photo img')
                main_image_url = main_img.get_attribute('src')
            except NoSuchElementException:
                main_image_url = None

            address = doc.get('road_address_name') or doc.get('address_name')
            phone = doc.get('phone')

            if not all([doc['place_name'], address, phone, main_image_url]):
                continue

            # 정문/후문 정보 저장(기본값 기타)
            x = float(doc['x'])
            y = float(doc['y'])
            location_tag = get_location_tag(y, x)

            cursor.execute("""
                INSERT IGNORE INTO restaurant (
                    name, category, description, address, phone, open_time,
                    main_image_url, kakao_id, kakao_url, rating, location_tag, is_new
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                doc['place_name'],
                category,  # 직접 입력으로 분류할 수 없는 경우
                None,
                address,
                phone,
                open_time,
                main_image_url,
                kakao_id,
                kakao_url,
                rating,
                location_tag,
                is_new
            ))
            conn.commit()
            print(f"✅ {doc['place_name']} 저장 완료")

        except Exception as e:
            print(f"❌ {doc.get('place_name', '?')} 처리 실패: {e}")

# 종료
driver.quit()
conn.close()
