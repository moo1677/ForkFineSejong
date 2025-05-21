import time
import pymysql
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException, WebDriverException
from datetime import datetime

# -----------------------------
# DB 연결
# -----------------------------
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='5242',
    db='new_rest',
    charset='utf8mb4'
)
cursor = conn.cursor()

# -----------------------------
# Selenium 설정
# -----------------------------
options = Options()
# options.add_argument('--headless')  # 필요 시 사용
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)

# -----------------------------
# restaurant 테이블에서 kakao_id와 id 가져오기
# -----------------------------
cursor.execute("SELECT id, kakao_id FROM restaurant")
restaurants = cursor.fetchall()

# -----------------------------
# 각 음식점에 대해 리뷰 수집
# -----------------------------
for restaurant_id, kakao_id in restaurants:
    try:
        url = f"https://place.map.kakao.com/{kakao_id}"
        driver.get(url)
        time.sleep(3)

        # 후기 탭 클릭
        try:
            review_tab = driver.find_element(By.XPATH, "//a[contains(text(), '후기')]")
            driver.execute_script("arguments[0].click();", review_tab)
            time.sleep(2)
        except NoSuchElementException:
            print(f"{kakao_id} - 후기 탭 없음")
            continue

        # 평점 높은 순 정렬
        try:
            sort_btn = driver.find_element(By.CSS_SELECTOR, "div.sort_box a[data-sort='rating']")
            sort_btn.click()
            time.sleep(2)
        except NoSuchElementException:
            pass  # 기본 정렬이면 무시

        # 리뷰 최대 5개까지 수집
        reviews = driver.find_elements(By.CSS_SELECTOR, "ul.list_review > li")[:5]
        print(f"{kakao_id} - 리뷰 개수 감지됨: {len(reviews)}")

        for review in reviews:
            try:
                rating = len(review.find_elements(By.CSS_SELECTOR, "span.ico_star.full"))
                comment = review.find_element(By.CSS_SELECTOR, "p.txt_comment").text.strip()
                date_text = review.find_element(By.CSS_SELECTOR, "span.txt_date").text.strip()
                created_at = datetime.strptime(date_text, "%Y.%m.%d").date()

                # 중복 여부 확인
                cursor.execute("""
                    SELECT COUNT(*) FROM review 
                    WHERE restaurant_id = %s AND comment = %s AND created_at = %s
                """, (restaurant_id, comment, created_at))
                if cursor.fetchone()[0] > 0:
                    print(f"⚠️ 중복 리뷰 건너뜀")
                    continue

                # 삽입
                cursor.execute("""
                    INSERT INTO review (restaurant_id, rating, comment, created_at)
                    VALUES (%s, %s, %s, %s)
                """, (restaurant_id, rating, comment, created_at))

            except NoSuchElementException:
                print(f"⚠️ 리뷰 항목 파싱 실패 - 건너뜀")
                continue

        conn.commit()
        print(f"✅ {kakao_id} 리뷰 저장 완료")

    except WebDriverException as e:
        print(f"❌ {kakao_id} 오류 발생: {e}")
        continue

# -----------------------------
# 종료 처리
# -----------------------------
driver.quit()
conn.close()
