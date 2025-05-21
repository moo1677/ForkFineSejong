import pymysql

# DB 연결
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='5242',
    db='restaurant_db',
    charset='utf8mb4'
)
cursor = conn.cursor()

# 각 카테고리별 시작 ID 번호
prefix_map = {
    '한식': 0,
    '중식': 100,
    '일식': 200,
    '양식': 300,
    '분식': 400,
    '아시안': 500,
    '카페': 600,
}

# 기존 레스토랑 정보 가져오기
cursor.execute("SELECT id, category FROM restaurant ORDER BY id")
rows = cursor.fetchall()

# id 재배정 매핑
new_id_map = {}
category_counter = {cat: 0 for cat in prefix_map}

for old_id, category in rows:
    base = prefix_map.get(category, prefix_map['기타'])
    count = category_counter[category]
    new_id = base + count + 1
    new_id_map[old_id] = new_id
    category_counter[category] += 1

# 메뉴/리뷰 등 외래키 업데이트용 외래 테이블 먼저 수정
for old_id, new_id in new_id_map.items():
    cursor.execute("UPDATE menu SET restaurant_id = %s WHERE restaurant_id = %s", (new_id, old_id))
    cursor.execute("UPDATE review SET restaurant_id = %s WHERE restaurant_id = %s", (new_id, old_id))

# restaurant 테이블의 ID 업데이트
for old_id, new_id in new_id_map.items():
    cursor.execute("UPDATE restaurant SET id = %s WHERE id = %s", (new_id, old_id))

conn.commit()
conn.close()

print("모든 restaurant ID 재할당 완료.")
