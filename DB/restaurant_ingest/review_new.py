import pymysql
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datetime import datetime
import time

# DB 연결
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='5242',
    db='FFS',
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)
cursor = conn.cursor()

# Selenium 설정
options = Options()
# options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 10)

# 리뷰 부족한 식당 조회
cursor.execute("""
    SELECT r.id, r.kakao_url 
    FROM restaurant r
    LEFT JOIN (
        SELECT restaurant_id, COUNT(*) AS cnt
        FROM review
        GROUP BY restaurant_id
    ) rv ON r.id = rv.restaurant_id
    WHERE IFNULL(rv.cnt, 0) < 5
""")
restaurants = cursor.fetchall()

for restaurant in restaurants:
    restaurant_id = restaurant['id']
    url = restaurant['kakao_url']
    print(f"\n🔍 {restaurant_id}: {url}")

    try:
        driver.get(url)
        time.sleep(2)

        # 후기 탭 클릭
        try:
            review_tab = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, 'a.link_tab[href="#comment"]'))
            )
            review_tab.click()
            print("후기 탭 클릭")
            time.sleep(1.5)
        except:
            print("❌ 후기 탭 없음, 스킵")
            continue

        # 후기 리스트 로딩 대기
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div.group_review ul.list_review > li')))
        review_elements = driver.find_elements(By.CSS_SELECTOR, 'div.group_review ul.list_review > li')[:5]

        for li in review_elements:
            print("[TEST 1]")
            try:
                print("[TEST 2]")
                # 별점 추출 (항상 두 번째 screen_out이 숫자)
                spans = li.find_elements(By.CSS_SELECTOR, 'div.info_grade > span.screen_out')
                if len(spans) < 2:
                    continue
                rating = float(spans[1].text)
                if rating < 3:
                    continue

                # 작성일
                date_text = li.find_element(By.CSS_SELECTOR, 'span.txt_date').text.strip()
                created_at = datetime.strptime(date_text, '%Y.%m.%d.').date()

                # 댓글
                comment = li.find_element(By.CSS_SELECTOR, 'p.desc_review').text.strip()

                # DB 삽입
                cursor.execute("""
                    INSERT INTO review (restaurant_id, rating, comment, created_at)
                    VALUES (%s, %s, %s, %s)
                """, (restaurant_id, rating, comment, created_at))
                conn.commit()
                print(f"✅ 저장됨: {rating}점 - {created_at}")

            except pymysql.err.IntegrityError:
                print("[TEST 3]")
                print("⚠️ 중복 리뷰 - 건너뜀")
            except Exception as e:
                print("⚠️ 리뷰 파싱 오류:", e)

    except Exception as e:
        print("[TEST 4]")
        print("⚠️ 페이지 접근 오류:", e)
    print("[TEST 5]")

# 마무리
driver.quit()
conn.close()
