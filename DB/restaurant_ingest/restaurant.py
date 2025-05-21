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
    db='new_rest',
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
n = 5  # 카테고리별 최대 수

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
                # 중복 여부 확인
                cursor.execute("SELECT COUNT(*) FROM restaurant WHERE kakao_id = %s", (kakao_id,))
                exists = cursor.fetchone()[0]

                if exists:
                    print(f"⚠️ {doc['place_name']} 이미 존재함, 건너뜀")
                    continue  # 다음 음식점으로 넘어감

                kakao_url = f"https://place.map.kakao.com/{kakao_id}"
                driver.get(kakao_url.replace("place.map.kakao.com", "place.map.kakao.com/m"))
                time.sleep(2)

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
                    main_img = driver.find_element(By.CSS_SELECTOR, 'div.board_photo.only_pc div.inner_board div.col a.link_photo img')
                    main_image_url = main_img.get_attribute('src')
                except NoSuchElementException:
                    main_image_url = None

                # 주소와 전화번호
                address = doc.get('road_address_name') or doc.get('address_name')
                phone = doc.get('phone')

                if not all([doc['place_name'], address, phone, main_image_url]):
                    continue  # 필수 값 누락 시 건너뜀

                cursor.execute("""
                    INSERT IGNORE INTO restaurant (
                        name, category, description, address, phone, open_time,
                        main_image_url, kakao_id, kakao_url
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    doc['place_name'],
                    category,  # 상위 카테고리로 고정
                    None,
                    address,
                    phone,
                    open_time,
                    main_image_url,
                    kakao_id,
                    kakao_url
                ))
                conn.commit()
                collected += 1
                print(f"✅ {doc['place_name']} 저장 완료")

                if collected >= n:
                    break

            except Exception as e:
                print(f"❌ {doc.get('place_name', '?')} 처리 실패: {e}")

        page += 1

# 종료
driver.quit()
conn.close()
