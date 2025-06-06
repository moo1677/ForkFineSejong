# Fork&Fine

세종대학교 주변 음식점 정보를 기반으로 한 맛집 추천 플랫폼입니다.  
사용자 맞춤형 추천 및 리뷰 기반 정렬 기능을 제공합니다.

## 프로젝트 개요

- **프로젝트명**: Fork&FineSejong
- **목표**: 세종대 주변 음식점 정보를 수집하고, 리뷰 및 평점을 기반으로 사용자 맞춤형 추천 제공
- **기간**: 2025.05.07 ~ 2025.06.11 (5주)
- **팀원 역할 분담**
  - 프론트엔드: React
  - 백엔드: Spring Boot + MariaDB
  - 데이터 수집: Kakao맵 API + Selenium 기반 웹 크롤러

## 주요 기능

- 음식점 목록 및 상세 페이지 UI 구성
- KakaoMap 기반 크롤링 데이터 연동
  - 음식점 이름, 카테고리, 위치 정보, 메뉴, 영업시간 수집
- KakaoMap 기반 위치 시각화
- 음식점 검색 기능
- 상세 페이지에서 메뉴, 리뷰, 위치 확인
- 정문/후문/기타 위치 기반 태그 자동 분류

## 기술 스택

| 분야         | 기술                      |
| ------------ | ------------------------- |
| 프론트엔드   | React, Axios              |
| 백엔드       | Spring Boot, Spring JPA   |
| 데이터베이스 | MariaDB                   |
| 크롤링       | Python, Selenium          |
| 기타         | GitHub, Sourcetree, Figma |

## 프로젝트 구조

```bash
ForkFineSejong/
├── frontend/               # React 프로젝트
│   ├── src/                # 소스 코드 루트
│   │   ├── asset/              # 로고, 썸네일 등 정적 이미지 리소스
│   │   ├── components/         # 주요 UI 컴포넌트 모음
│   │   ├── App.jsx             # 라우팅 및 전체 페이지 구성
│   │   └── …
│   └── …                    # Vite 설정 파일 등 기타 프론트엔드 자원
├── backend/              # Spring Boot 프로젝트
│   ├── src/main/java/com/sejong/ffs/
│   └── …
├── db/                   # DB 스키마 및 초기 데이터
│   ├── crawler/          # 데이터 수집용 파이썬 코드
│   │   ├── restaurant.py
│   │   ├── menu.py
│   │   └── …
│   ├── schema.sql
│   └── …
└── README.md             # 프로젝트 설명 파일
```

## 백엔드 실행 방법

아래 단계만 따라 하면 백엔드 서버를 바로 실행할 수 있습니다. 모든 명령은 프로젝트 루트 폴더의 `Spring/FFS` 디렉터리에서 실행하세요.

---

### 1. MariaDB 설치 및 데이터베이스 생성

1. **MariaDB 설치**

   - **macOS (Homebrew)**
     ```bash
     brew update
     brew install mariadb
     ```
   - **Windows**
     1. <https://mariadb.org/download/> 에서 MSI 인스톨러 다운로드
     2. 설치 중 ‘Add MariaDB to PATH’ 옵션 선택
     3. 서비스(Services)에서 “MariaDB” 자동 시작으로 설정

2. **MariaDB 서비스 시작**

   - macOS:
     ```bash
     brew services start mariadb
     ```
   - Windows:
     - 시작 → Services → “MariaDB” 우클릭 → Start

3. **MariaDB 클라이언트 접속**

   ```bash
   mysql -u root -p
   ```

   > 설치 시 설정한 `root` 비밀번호 입력

4. **데이터베이스 및 사용자 생성**

   ```sql
   -- 1) 애플리케이션용 데이터베이스 생성
   CREATE DATABASE ffs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

   -- 2) 전용 사용자 생성 및 비밀번호 설정
   CREATE USER 'ffs_user'@'localhost' IDENTIFIED BY 'secure_password';

   -- 3) 권한 부여 및 변경사항 반영
   GRANT ALL PRIVILEGES ON ffs.* TO 'ffs_user'@'localhost';
   FLUSH PRIVILEGES;

   EXIT;
   ```

5. **데이터베이스 데이터 적재**

   restaurant.sql 파일 참고

```sql
CREATE TABLE IF NOT EXISTS restaurant (
  id INT PRIMARY KEY AUTO_INCREMENT,                      -- 음식점 고유 ID (자동 증가)
  name VARCHAR(100) NOT NULL,                             -- 음식점 이름
  category VARCHAR(50) NOT NULL,                          -- 음식점 카테고리 (예: 한식, 중식, 양식 등)
  description TEXT,                                       -- 음식점 설명 (필요 시 사용)
  address VARCHAR(255) NOT NULL,                          -- 도로명 주소 또는 지번 주소
  phone VARCHAR(30) NOT NULL,                             -- 전화번호
  open_time VARCHAR(100) NOT NULL,                        -- 영업시간 (예: 11:00~21:30)
  main_image_url VARCHAR(255),                            -- 대표 이미지 URL (없으면 NULL)
  kakao_id VARCHAR(50) NOT NULL UNIQUE,                   -- Kakao 고유 장소 ID (중복 방지 키)
  rating DECIMAL(2,1) DEFAULT 0.0,                        -- 평균 별점 정보 (예: 3.5)
  location_tag ENUM('정문', '후문', '기타') DEFAULT '기타', -- 음식점 위치 태그 (정문/후문/기타)
  is_new BOOLEAN DEFAULT FALSE                            -- 신규 개장 여부 (TRUE/FALSE)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

```sql
CREATE TABLE IF NOT EXISTS menu (
id INT PRIMARY KEY AUTO_INCREMENT,              -- 메뉴 고유 ID (자동 증가)
restaurant_id INT NOT NULL,                     -- 참조할 음식점 ID (FK)
name VARCHAR(100) NOT NULL,                     -- 메뉴 이름
price INT NOT NULL,                              -- 가격 (원 단위)
description TEXT,                                -- 메뉴 설명 (옵션)
image_url VARCHAR(255),                          -- 메뉴 이미지 URL (옵션)
FOREIGN KEY (restaurant_id)
 REFERENCES restaurant(id)
 ON DELETE CASCADE                              -- 음식점 삭제 시 해당 메뉴도 함께 삭제
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
```

```sql
CREATE TABLE IF NOT EXISTS review (
id INT PRIMARY KEY AUTO_INCREMENT,                -- 리뷰 고유 ID (자동 증가)
restaurant_id INT NOT NULL,                       -- 참조할 음식점 ID (FK)
rating DECIMAL(2,1) DEFAULT 0.0,                  -- 별점 (1.0 ~ 5.0), 소수 첫째 자리까지
comment TEXT NOT NULL,                            -- 리뷰 내용
created_at DATE NOT NULL,                         -- 리뷰 작성일 (YYYY-MM-DD)
FOREIGN KEY (restaurant_id)
 REFERENCES restaurant(id)
 ON DELETE CASCADE,                              -- 음식점 삭제 시 리뷰도 함께 삭제
UNIQUE KEY uk_review (restaurant_id, comment, created_at)
 -- 같은 음식점에 동일한 날짜, 동일한 내용(comment)이 중복 저장되는 것을 방지
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
```

---

### 2. `application.yml` (또는 `application.properties`) 설정

설정 파일: `Spring/FFS/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    driver-class-name: org.mariadb.jdbc.Driver
    url: jdbc:mariadb://localhost:3306/ffs?useSSL=false&serverTimezone=UTC
    username: ffs_user # 위에서 생성한 사용자
    password: secure_password

  jpa:
    hibernate:
      ddl-auto: update # 개발: update, 운영: validate 또는 none
    show-sql: true # SQL 로그 출력

server:
  port: 8080 # 기본 포트
```

> **properties 방식**
>
> ```properties
> spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
> spring.datasource.url=jdbc:mariadb://localhost:3306/ffs?useSSL=false&serverTimezone=UTC
> spring.datasource.username=ffs_user
> spring.datasource.password=secure_password
>
> spring.jpa.hibernate.ddl-auto=update
> spring.jpa.show-sql=true
> server.port=8080
> ```

---

### 3. Spring Boot 애플리케이션 실행

1. **프로젝트 루트 이동**

   ```bash
   cd Spring/FFS
   ```

2. **의존성 설치 및 빌드**

   ```bash
   # macOS/Linux
   ./mvnw clean package

   # Windows (PowerShell)
   .\mvnw.cmd clean package
   ```

3. **개발 모드 실행**

   ```bash
   ./mvnw spring-boot:run
   ```

   - Spring DevTools가 있으면 코드 변경 시 자동 리로딩

4. **JAR 파일로 실행**

   ```bash
   java -jar target/ffs-0.0.1-SNAPSHOT.jar
   ```

5. **실행 확인**
   - 콘솔에 `Started FfsApplication` 메시지 출력
   - 브라우저 또는 Postman에서 `http://localhost:8080/health` (또는 구현된 엔드포인트) 호출
   - MariaDB에 테이블이 생성되었는지 확인:
     ```bash
     mysql -u ffs_user -p ffs -e "SHOW TABLES;"
     ```

---

## 프론트엔드 실행 방법

Fork&FineSejong의 프론트엔드는 `frontend/` 디렉토리 하위에 구성되어 있으며, **React + Vite** 기반으로 개발되었습니다.  
Spring Boot 백엔드 서버(`localhost:8080`)와 연동하여 음식점 정보를 제공합니다.

---

### 1. Node.js 및 npm 설치

- **macOS (Homebrew)**

  ```bash
  brew install node
  ```

- **Windows/기타 OS**

  공식 사이트에서 Node.js LTS 버전 다운로드
  < https://nodejs.org>

---

### 2. 의존성 설치 및 개발 서버 실행

```bash
cd frontend
npm install
npm run dev
```

- Vite 개발 서버가 기본적으로 `http://localhost:5173` 에서 작동합니다.
- 백엔드 서버(`localhost:8080`)가 먼저 실행 중이어야 정상 작동합니다.

---

### 3. 주요 명령어 요약

| 명령어            | 설명                      |
| ----------------- | ------------------------- |
| `npm install`     | 패키지 의존성 설치        |
| `npm run dev`     | 개발 모드 실행 (Vite)     |
| `npm run build`   | 프로덕션 빌드             |
| `npm run preview` | 빌드된 정적 파일 미리보기 |

---

### 4. 프론트엔드 컴포넌트 목록

| 컴포넌트명         | 설명                                              |
| ------------------ | ------------------------------------------------- |
| `Header`           | 상단 로고, 검색창, 자동완성/최근검색 기능 포함    |
| `MainBanner`       | 메인 페이지 최상단 배너 UI                        |
| `CategoryFilter`   | 카테고리별 음식점 필터 (예: 한식, 중식, 양식 등)  |
| `LocationFilter`   | 정문/후문/기타 위치 기반 음식점 필터 스크롤 UI    |
| `RestaurantCard`   | 음식점 정보를 카드 형태로 보여주는 컴포넌트       |
| `RestaurantList`   | 음식점 카드들을 리스트로 나열                     |
| `RestaurantDetail` | 특정 음식점의 상세정보 페이지 (메뉴, 리뷰 포함)   |
| `FindMap`          | 검색 결과 음식점 목록과 지도를 함께 보여주는 화면 |
| `KakaoMapList`     | 여러 음식점의 주소를 기반으로 마커를 표시         |
| `KakaoMapSingle`   | 단일 음식점의 위치를 지도에 표시                  |

- 각 컴포넌트에 대응하는 .css 파일도 함께 존재하여, 모듈 단위로 UI 및 로직을 분리한 구조
