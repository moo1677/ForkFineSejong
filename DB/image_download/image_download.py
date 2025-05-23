import os
import requests
import pymysql

# DB 연결
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='5242',
    db='FFS',
    charset='utf8mb4'
)
cursor = conn.cursor()

# ✅ 범위 지정
RESTAURANT_ID_START = 1
RESTAURANT_ID_END = 40

# 저장 경로
restaurant_dir = 'image/restaurant'
menu_base_dir = 'image/menu'

# 디렉토리 생성
os.makedirs(restaurant_dir, exist_ok=True)
os.makedirs(menu_base_dir, exist_ok=True)

# 레스토랑 메인 이미지 저장
cursor.execute("SELECT id, main_image_url FROM restaurant WHERE id BETWEEN %s AND %s", (RESTAURANT_ID_START, RESTAURANT_ID_END))
for restaurant_id, url in cursor.fetchall():
    if not url:
        continue
    try:
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            path = os.path.join(restaurant_dir, f"{restaurant_id}.jpg")
            with open(path, 'wb') as f:
                f.write(res.content)
            print(f"✅ 레스토랑 이미지 저장 완료 - ID {restaurant_id}")
    except Exception as e:
        print(f"❌ 레스토랑 이미지 저장 실패 - ID {restaurant_id}: {e}")

# 메뉴 이미지 저장
cursor.execute("""
    SELECT m.id, m.restaurant_id, m.image_url 
    FROM menu m 
    WHERE m.restaurant_id BETWEEN %s AND %s
""", (RESTAURANT_ID_START, RESTAURANT_ID_END))

for menu_id, restaurant_id, url in cursor.fetchall():
    if not url:
        continue
    try:
        dir_path = os.path.join(menu_base_dir, str(restaurant_id))
        os.makedirs(dir_path, exist_ok=True)
        path = os.path.join(dir_path, f"{menu_id}.jpg")

        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            with open(path, 'wb') as f:
                f.write(res.content)
            print(f"✅ 메뉴 이미지 저장 완료 - 식당 {restaurant_id}, 메뉴 ID {menu_id}")
    except Exception as e:
        print(f"❌ 메뉴 이미지 저장 실패 - 식당 {restaurant_id}, 메뉴 ID {menu_id}: {e}")


conn.close()
