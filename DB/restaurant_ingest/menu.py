import time
import pymysql
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException, WebDriverException
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
options.add_argument('--headless')  # 필요시 활성화
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)

# restaurant 테이블에서 음식점 목록 가져오기
cursor.execute("SELECT id, kakao_id FROM restaurant ORDER BY id ASC")
restaurants = cursor.fetchall()

# 각 음식점에 대해 메뉴 크롤링 시작
for restaurant_id, kakao_id in restaurants:
    try:
        url = f"https://place.map.kakao.com/m/{kakao_id}"
        driver.get(url)
        time.sleep(3)

        # 메뉴/배달 탭 클릭 및 더보기 버튼 처리
        try:
            tabs = driver.find_elements(By.CSS_SELECTOR, 'a[role="tab"]')
            menu_tab, delivery_tab = None, None

            for tab in tabs:
                if '메뉴' in tab.text:
                    menu_tab = tab
                elif '배달' in tab.text:
                    delivery_tab = tab

            def extract_count(text):
                match = re.search(r'\d+', text)
                return int(match.group()) if match else 0

            menu_count = extract_count(menu_tab.text) if menu_tab else 0
            delivery_count = extract_count(delivery_tab.text) if delivery_tab else 0

            if delivery_tab and delivery_count > menu_count:
                driver.execute_script("arguments[0].click();", delivery_tab)
                active_tab = '배달'
            elif menu_tab:
                driver.execute_script("arguments[0].click();", menu_tab)
                active_tab = '메뉴'
            else:
                continue  # 탭 없음

            time.sleep(2)

            # 더보기 버튼 클릭
            try:
                more_buttons = driver.find_elements(By.CSS_SELECTOR, 'a.link_more')
                for btn in more_buttons:
                    if active_tab in btn.text:
                        driver.execute_script("arguments[0].click();", btn)
                        time.sleep(2)
                        break
            except NoSuchElementException:
                pass  # 더보기 없음

        except Exception as e:
            print(f"{kakao_id} 탭 처리 오류: {e}")

        # 메뉴 항목 파싱
        menus = driver.find_elements(By.CSS_SELECTOR, 'ul.list_goods > li')
        print(f"{kakao_id} 메뉴 개수: {len(menus)}")

        for menu in menus:
            try:
                # 이름
                name = menu.find_element(By.CSS_SELECTOR, 'strong.tit_item').text.strip()
                if not name:
                    print("⚠️ 이름 없는 메뉴 건너뜀")
                    continue

                # 중복 확인
                cursor.execute("SELECT COUNT(*) FROM menu WHERE restaurant_id = %s AND name = %s", (restaurant_id, name))
                if cursor.fetchone()[0] > 0:
                    print(f"⚠️ 중복 메뉴: {name} - 건너뜀")
                    continue

                # 가격
                try:
                    price_raw = menu.find_element(By.CSS_SELECTOR, 'p.desc_item').text.strip()
                    match = re.search(r'\d[\d,]*', price_raw)
                    price = int(match.group().replace(',', '')) if match else None
                except NoSuchElementException:
                    price = None

                # 설명
                try:
                    desc = menu.find_element(By.CSS_SELECTOR, 'p.desc_item2').text.strip()
                except NoSuchElementException:
                    desc = None

                # 이미지
                try:
                    img = menu.find_element(By.CSS_SELECTOR, 'img').get_attribute('src')
                    img = img[:255] if img else None
                except NoSuchElementException:
                    img = None

                # INSERT 수행
                try:
                    cursor.execute("""
                        INSERT INTO menu (restaurant_id, name, price, description, image_url)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (restaurant_id, name, price, desc, img))
                except Exception as e:
                    print(f"❌ 삽입 실패 - {name}: {e}")

            except Exception as e:
                print(f"❌ 메뉴 파싱 오류: {e}")
                continue

        conn.commit()
        print(f"✅ {kakao_id} 처리 완료.")

    except WebDriverException as e:
        print(f"❌ {kakao_id} 페이지 로딩 실패: {e}")
        continue

driver.quit()
conn.close()
