import time
import pymysql
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from datetime import datetime

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
options.add_argument('--headless')  # 필요 시 주석 처리
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)

# restaurant 테이블에서 kakao_id와 id 가져오기 (테스트용 5개 제한)
cursor.execute("SELECT id, kakao_id FROM restaurant LIMIT 5")
restaurants = cursor.fetchall()

for restaurant_id, kakao_id in restaurants:
    try:
        url = f"https://place.map.kakao.com/{kakao_id}"
        driver.get(url)
        time.sleep(2)

        # '후기' 탭 클릭
        try:
            review_tab = driver.find_element(By.XPATH, "//a[contains(text(), '후기')]")
            driver.execute_script("arguments[0].click();", review_tab)
        except NoSuchElementException:
            print(f"{kakao_id} - 후기 탭 없음")
            continue

        # 리뷰 요소가 로드될 때까지 대기
        try:
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "ul.list_review > li"))
            )
        except TimeoutException:
            print(f"{kakao_id} - 리뷰 로딩 실패 (timeout)")
            continue

        # 리뷰 5개 수집
        reviews = driver.find_elements(By.CSS_SELECTOR, "ul.list_review > li")[:5]
        print(f"{kakao_id} - 리뷰 수집 시도: {len(reviews)}")

        for r in reviews:
            try:
                # 별점
                stars = r.find_elements(By.CSS_SELECTOR, ".info_grade .starred_grade .screen_out")
                rating_texts = [s.text for s in stars if s.text.replace('.', '').isdigit()]
                if not rating_texts:
                    continue
                rating = float(rating_texts[0])

                # 코멘트
                try:
                    comment = r.find_element(By.CSS_SELECTOR, "p.desc_review").text.strip()
                except NoSuchElementException:
                    comment = None

                # 날짜
                date_text = r.find_element(By.CSS_SELECTOR, "span.txt_date").text.strip()
                created_at = datetime.strptime(date_text, "%Y.%m.%d.")

                # 중복 확인
                cursor.execute("""
                    SELECT COUNT(*) FROM review
                    WHERE restaurant_id = %s AND comment = %s AND created_at = %s
                """, (restaurant_id, comment, created_at))
                if cursor.fetchone()[0]:
                    print(f"{kakao_id} - 리뷰 이미 존재")
                    continue

                # DB 삽입
                cursor.execute("""
                    INSERT INTO review (restaurant_id, rating, comment, created_at)
                    VALUES (%s, %s, %s, %s)
                """, (restaurant_id, rating, comment, created_at))

            except Exception as e:
                print(f"{kakao_id} - 리뷰 파싱 오류: {e}")
                continue

        conn.commit()
        print(f"{kakao_id} - 리뷰 저장 완료")

    except Exception as e:
        print(f"{kakao_id} - 전체 오류: {e}")
        continue

driver.quit()
conn.close()
