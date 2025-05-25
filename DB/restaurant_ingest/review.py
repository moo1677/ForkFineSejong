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
    db='FFS',
    charset='utf8mb4'
)
cursor = conn.cursor()

# Selenium 설정
options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 10)

# DB에서 음식점 목록 가져오기 (id 순 정렬)
cursor.execute("SELECT id, kakao_id FROM restaurant ORDER BY id ASC")
restaurants = cursor.fetchall()

for restaurant_id, kakao_id in restaurants:
    # ✅ 기존 리뷰가 존재하면 건너뜀
    cursor.execute("SELECT COUNT(*) FROM review WHERE restaurant_id = %s", (restaurant_id,))
    if cursor.fetchone()[0] > 0:
        print(f"⏩ 리뷰 이미 존재함 (restaurant_id={restaurant_id})")
        continue

    try:
        url = f"https://place.map.kakao.com/{kakao_id}"
        driver.get(url)
        time.sleep(2)

        # 후기 탭 클릭
        try:
            review_tab = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, 'a.link_tab[href="#comment"]'))
            )
            review_tab.click()
            time.sleep(1.5)
        except:
            continue

        reviews = driver.find_elements(By.CSS_SELECTOR, "ul.list_review > li")
        stored_count = 0
        reserved_4s = []

        for review in reviews:
            if stored_count >= 5:
                break

            try:
                # 별점
                rating_elem = review.find_element(By.CSS_SELECTOR, "span.starred_grade span.screen_out:nth-of-type(2)")
                rating_text = rating_elem.get_attribute("textContent").strip()
                if not rating_text:
                    continue
                rating = float(rating_text)

                # 작성일
                date_elem = review.find_element(By.CSS_SELECTOR, "span.txt_date")
                created_at = date_elem.text.strip().replace(".", "-")[:-1]

                # 후기 내용
                try:
                    # 더보기 클릭
                    try:
                        more_btn = review.find_element(By.CSS_SELECTOR, "p.desc_review .btn_more")
                        driver.execute_script("arguments[0].click();", more_btn)
                        time.sleep(0.3)
                    except NoSuchElementException:
                        pass

                    comment_elem = review.find_element(By.CSS_SELECTOR, "p.desc_review")
                    comment = comment_elem.text.strip().replace("접기", "").strip()
                    if not comment:
                        continue
                except NoSuchElementException:
                    continue


                if rating == 5.0:
                    cursor.execute("""
                        INSERT IGNORE INTO review (restaurant_id, rating, comment, created_at)
                        VALUES (%s, %s, %s, %s)
                    """, (restaurant_id, rating, comment, created_at))
                    conn.commit()
                    stored_count += 1

                elif rating == 4.0:
                    reserved_4s.append((restaurant_id, rating, comment, created_at))

            except Exception as e:
                print(f"❌ 리뷰 파싱 실패 (kakao_id {kakao_id}): {e}")
            

        # 5개 미만이면 4.0으로 보충
        for entry in reserved_4s:
            if stored_count >= 5:
                break
            cursor.execute("""
                INSERT IGNORE INTO review (restaurant_id, rating, comment, created_at)
                VALUES (%s, %s, %s, %s)
            """, entry)
            conn.commit()
            stored_count += 1
            print(f"➕ 보충 저장 (restaurant_id={entry[0]}, 날짜={entry[3]})")
        print(f"✅ 리뷰 저장 완료 (restaurant_id={restaurant_id})")
    except Exception as e:
        print(f"❌ 가게 접근 실패 (kakao_id {kakao_id}): {e}")

# 마무리
driver.quit()
conn.close()
