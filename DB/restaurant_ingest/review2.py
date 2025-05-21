import time
import pymysql
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datetime import datetime

# DB 연결
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='5242',
    db='restaurant_db',
    charset='utf8mb4'
)
cursor = conn.cursor()

# Selenium 설정
options = Options()
options.add_argument('--headless')  # 브라우저 창 없이 실행
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)

# restaurant 테이블에서 일부 음식점만 테스트
cursor.execute("SELECT id, kakao_id FROM restaurant")
restaurants = cursor.fetchall()[:3]  # 테스트용 3개

for restaurant_id, kakao_id in restaurants:
    print(f"▶️ {kakao_id} 접속 시도")
    try:
        url = f"https://place.map.kakao.com/{kakao_id}"
        driver.get(url)
        time.sleep(3)
        print("1️⃣ 페이지 접속 완료")

        # 후기 탭 클릭
        try:
            review_tab = driver.find_element(By.XPATH, "//a[contains(text(), '후기')]")
            print("2️⃣ 후기 탭 발견됨, 클릭 시도")
            driver.execute_script("arguments[0].click();", review_tab)
            time.sleep(2)
        except NoSuchElementException:
            print(f"{kakao_id} - 후기 탭 없음")
            continue

        print("3️⃣ 후기 리스트 로딩 대기 중...")
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "ul.list_review > li"))
            )
            print("✅ 후기 리스트 로딩됨")
        except TimeoutException:
            print("❌ 리뷰 로딩 실패")
            continue

        # 리뷰 가져오기
        reviews = driver.find_elements(By.CSS_SELECTOR, "ul.list_review > li")
        print(f"4️⃣ 수집된 리뷰 수: {len(reviews)}")

        # 리뷰 구조 디버그 (처음 하나만 출력)
        if reviews:
            print("--- [DEBUG] 리뷰 1 HTML 구조 ---")
            print(reviews[0].get_attribute("outerHTML"))

        parsed_reviews = []
        for idx, r in enumerate(reviews[:5]):  # 최대 5개까지
            print(f"--- 리뷰 {idx + 1} 파싱 ---")
            try:
                # 별점 추출 (두 번째 screen_out을 찾음)
                try:
                    score_elements = r.find_elements(By.CSS_SELECTOR, ".info_grade .starred_grade .screen_out")
                    if len(score_elements) >= 2:
                        rating_text = score_elements[1].text.strip()
                        rating = float(rating_text)
                    else:
                        raise ValueError("screen_out 요소 부족")
                except Exception as e:
                    print(f"🚫 별점 추출 실패: {e}")
                    continue


                # 댓글
                try:
                    comment = r.find_element(By.CSS_SELECTOR, "p.desc_review").text.strip()
                except NoSuchElementException:
                    comment = None

                # 날짜
                try:
                    date_text = r.find_element(By.CSS_SELECTOR, "span.txt_date").text.strip()
                    created_at = datetime.strptime(date_text, "%Y.%m.%d.")
                except Exception as e:
                    print(f"🚫 날짜 파싱 실패: {e}")
                    continue

                parsed_reviews.append((rating, comment, created_at))

            except Exception as e:
                print(f"❌ 리뷰 파싱 오류: {e}")
                continue

        # DB 저장
        for rating, comment, created_at in parsed_reviews:
            cursor.execute("""
                SELECT COUNT(*) FROM review 
                WHERE restaurant_id = %s AND comment = %s AND created_at = %s
            """, (restaurant_id, comment, created_at))
            exists = cursor.fetchone()[0]
            if exists:
                print("🚫 리뷰 중복, 건너뜀")
                continue

            cursor.execute("""
                INSERT INTO review (restaurant_id, rating, comment, created_at)
                VALUES (%s, %s, %s, %s)
            """, (restaurant_id, rating, comment, created_at))

        conn.commit()
        print(f"🏁 {kakao_id} 리뷰 크롤링 완료")

    except Exception as e:
        print(f"{kakao_id} - 전체 오류: {e}")
        continue

driver.quit()
conn.close()
