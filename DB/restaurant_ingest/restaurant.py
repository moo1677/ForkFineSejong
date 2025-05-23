import time
import pymysql
import requests
import math
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

categories = {
    "한식": "한식",
    "중식": "중식",
    "일식": "일식",
    "양식": "양식"
}

url = "https://dapi.kakao.com/v2/local/search/keyword.json"
n = 10

# 정문/후문 기준 좌표 상수화
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

for category, keyword in categories.items():
    collected = 0
    page = 1
    while collected < n:
        params = {
            "query": keyword,
            "x": 127.073651,
            "y": 37.550978,
            "radius": 1000,
            "sort": "accuracy",
            "size": 15,
            "page": page
        }
        response = requests.get(url, headers=headers, params=params)
        documents = response.json().get("documents", [])
        if not documents:
            break

        for doc in documents:
            try:
                kakao_id = doc['id']
                cursor.execute("SELECT rating, location_tag FROM restaurant WHERE kakao_id = %s", (kakao_id,))
                existing = cursor.fetchone()

                if existing:
                    update_fields, update_values = [], []

                    # 위치 정보 계산 (X,Y는 항상 필요)
                    x = float(doc['x'])
                    y = float(doc['y'])
                    location_tag = get_location_tag(y, x)

                    # rating/location_tag 확인 후 필요한 경우에만 파싱 수행
                    update_required = False
                    if existing[0] == 0.0 or (existing[1] == '기타' and location_tag != '기타'):
                        driver.get(f"https://place.map.kakao.com/{kakao_id}")
                        time.sleep(2)

                        if existing[0] == 0.0:
                            try:
                                rating_elem = driver.find_element(By.CSS_SELECTOR, 'span.starred_grade > span.num_star')
                                rating_text = rating_elem.text.strip()
                                rating = float(rating_text) if rating_text.replace('.', '', 1).isdigit() else None
                                if rating is not None:
                                    update_fields.append("rating = %s")
                                    update_values.append(rating)
                                    update_required = True
                            except Exception as e:
                                print(f"[DEBUG] 별점 파싱 실패: {e}")

                        if existing[1] == '기타' and location_tag != '기타':
                            update_fields.append("location_tag = %s")
                            update_values.append(location_tag)
                            update_required = True

                        if update_required:
                            update_values.append(kakao_id)
                            cursor.execute(f"""
                                UPDATE restaurant SET {', '.join(update_fields)}
                                WHERE kakao_id = %s
                            """, tuple(update_values))
                            conn.commit()
                            print(f"🔄 {doc['place_name']} 정보 업데이트 완료")
                        else:
                            print(f"⚠️ {doc['place_name']} 이미 존재함, 건너뜀")
                    else:
                        print(f"⚠️ {doc['place_name']} 이미 존재함, 건너뜀")
                    continue

                # 신규 음식점 전체 정보 수집
                driver.get(f"https://place.map.kakao.com/{kakao_id}")
                time.sleep(2)
                
                # 후기 탭 확인 후 없으면 저장 스킵
                try:
                    driver.find_element(By.CSS_SELECTOR, 'a.link_tab[href="#comment"]')
                except NoSuchElementException:
                    print(f"❌ 후기 탭 없음, {doc['place_name']} 저장 스킵")
                    continue

                try:
                    rating_elem = driver.find_element(By.CSS_SELECTOR, 'span.starred_grade > span.num_star')
                    rating_text = rating_elem.text.strip()
                    rating = float(rating_text) if rating_text.replace('.', '', 1).isdigit() else None
                except:
                    rating = None

                if rating is not None and rating < 3.5:
                    print(f"⚠️ {doc['place_name']} 별점 {rating}점으로 제외됨")
                    continue

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

                x = float(doc['x'])
                y = float(doc['y'])
                location_tag = get_location_tag(y, x)

                cursor.execute("""
                    INSERT IGNORE INTO restaurant (
                        name, category, description, address, phone, open_time,
                        main_image_url, kakao_id, kakao_url, rating, location_tag, is_new
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    doc['place_name'], category, None, address, phone, open_time,
                    main_image_url, kakao_id, f"https://place.map.kakao.com/{kakao_id}",
                    rating, location_tag, False
                ))
                conn.commit()
                collected += 1
                print(f"✅ {doc['place_name']} 저장 완료")

                if collected >= n:
                    break

            except Exception as e:
                print(f"❌ {doc.get('place_name', '?')} 처리 실패: {e}")

        page += 1

driver.quit()
conn.close()
