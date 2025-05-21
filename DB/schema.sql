-- restaurant
-- CREATE TABLE IF NOT EXISTS restaurant (
--   id INT PRIMARY KEY AUTO_INCREMENT,                    -- 음식점 고유 ID (자동 증가)
--   name VARCHAR(100) NOT NULL,                           -- 음식점 이름
--   category VARCHAR(50) NOT NULL,                        -- 음식점 카테고리 (예: 한식, 중식 등)
--   description TEXT,                                     -- 음식점 설명 (사용 안함 또는 향후 확장 가능)
--   address VARCHAR(255) NOT NULL,                        -- 도로명 주소 또는 지번 주소
--   phone VARCHAR(30) NOT NULL,                           -- 전화번호
--   open_time VARCHAR(100) NOT NULL,                      -- 영업시간 (예: 11:00~21:30)
--   main_image_url VARCHAR(255),                          -- 대표 이미지 URL (없으면 NULL)
--   kakao_id VARCHAR(50) NOT NULL UNIQUE,                 -- Kakao 고유 장소 ID (중복 방지 키)
--   kakao_url VARCHAR(255) NOT NULL,                       -- Kakao 상세 페이지 URL
--   rating DECIMAL(2,1) DEFAULT 0.0                        -- 별점 정보 0.0
-- );

/*
CREATE TABLE IF NOT EXISTS restaurant (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  open_time VARCHAR(100) NOT NULL,
  main_image_url VARCHAR(255),
  kakao_id VARCHAR(50) NOT NULL UNIQUE,
  kakao_url VARCHAR(255) NOT NULL
  rating DECIMAL(2,1) DEFAULT 0.0
);
*/

-- menu
-- restaurant_id는 restaurant 테이블과의 외래키 관계
/*
CREATE TABLE IF NOT EXISTS menu (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT NOT NULL,
  name VARCHAR(100),
  price INT,
  description TEXT,
  image_url VARCHAR(255),
  FOREIGN KEY (restaurant_id) REFERENCES restaurant(id) ON DELETE CASCADE
);
*/

-- review
-- CREATE TABLE IF NOT EXISTS review (
--   id INT PRIMARY KEY AUTO_INCREMENT,               -- 각 리뷰 고유 ID (자동 증가)
--   restaurant_id INT NOT NULL,                      -- 참조하는 음식점 ID (restaurant 테이블과 연결)
--   rating INT NOT NULL,                             -- 별점 (1~5)
--   comment TEXT NOT NULL,                           -- 리뷰 내용
--   created_at DATE NOT NULL,                        -- 리뷰 작성일
--   FOREIGN KEY (restaurant_id) REFERENCES restaurant(id) 
--     ON DELETE CASCADE,                             -- 음식점 삭제 시 해당 리뷰도 함께 삭제
--   UNIQUE (restaurant_id, comment, created_at)      -- 동일한 날 같은 코멘트는 중복 저장 방지
-- );

/*
CREATE TABLE IF NOT EXISTS review (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT NOT NULL,
  created_at DATE NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurant(id) ON DELETE CASCADE,
  UNIQUE (restaurant_id, comment, created_at)
);
*/