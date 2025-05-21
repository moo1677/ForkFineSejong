import os
import pymysql
import requests
from urllib.parse import urlparse

# DB 연결
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='5242',
    db='new_rest',
    charset='utf8mb4'
)
cursor = conn.cursor()

# 이미지 저장 루트 디렉토리
root_dir = 'downloaded_images'
os.makedirs(root_dir, exist_ok=True)

# 이미지 URL 가져오기
cursor.execute("SELECT id, restaurant_id, image_url FROM menu WHERE image_url IS NOT NULL")
rows = cursor.fetchall()

for menu_id, restaurant_id, image_url in rows:
    try:
        # restaurant_id별 하위 폴더 생성
        restaurant_dir = os.path.join(root_dir, str(restaurant_id))
        os.makedirs(restaurant_dir, exist_ok=True)

        # 파일 확장자 추출
        parsed = urlparse(image_url)
        file_ext = os.path.splitext(parsed.path)[-1] or '.jpg'
        file_name = f"{menu_id}{file_ext}"
        file_path = os.path.join(restaurant_dir, file_name)

        # 이미지 다운로드
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()

        with open(file_path, 'wb') as f:
            f.write(response.content)

        print(f"[✓] {file_path} 저장 완료")

    except Exception as e:
        print(f"[✗] {menu_id}_{restaurant_id} 실패: {e}")

conn.close()
