import "./App.css";
import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import CategoryFilter from "./components/CategoryFilter.jsx";
import RestaurantDetail from "./components/RestaurantDetail.jsx";
import RestaurantList from "./components/RestaurantList.jsx";
import MainBanner from "./components/MainBanner";

import { Routes, Route } from "react-router-dom";
// 1. "/" 메인 홈 페이지
// 2. "/Card" 음식점 상세 페이지
function App() {
  /**음식점 데이터 상태 */
  const [restaurantData, setRestaurantData] = useState([]);

  /** 카테고리를 바꾸는 useState */
  const [selectedCategory, setSelectedCategory] = useState("전체");
  /** 검색어를 바꾸는 useState */
  const [searchText, setSearchText] = useState("");
  /** 검색창의 검색어를 바꾸는 useState */
  const [inputText, setInputText] = useState("");

  /** 페이지의 상태를 모두 초기화 하는 함수 */
  const resetAllFilters = () => {
    setSelectedCategory("전체");
    setSearchText("");
    setInputText("");
  };

  /** 음식점 데이터 API 호출 */
  // useEffect(() => {
  //   fetch("http://localhost:8080/api/restaurants")
  //     .then((res) => res.json())
  //     .then((data) => setRestaurantData(data))
  //     .catch((err) => {
  //       console.error("음식점 데이터를 가져오는 데 실패했습니다:", err);
  //     });
  // }, []);
  useEffect(() => {
    // 더미 데이터
    const dummyData = [
      {
        id: 1,
        name: "맘스터치",
        category: "분식",
        desc: "맛있는 버거와 후라이드치킨",
        image: "https://via.placeholder.com/150", // 임시 이미지
        rating: 4.3,
        menu: [
          {
            name: "싸이순살버거",
            price: 4500,
            desc: "대표 메뉴",
            image: "...",
          },
          { name: "감자튀김", price: 2000, desc: "사이드 메뉴", image: "..." },
          {
            name: "싸이순살버거",
            price: 4500,
            desc: "대표 메뉴",
            image: "...",
          },
          { name: "감자튀김", price: 2000, desc: "사이드 메뉴", image: "..." },
          {
            name: "싸이순살버거",
            price: 4500,
            desc: "대표 메뉴",
            image: "...",
          },
          { name: "감자튀김", price: 2000, desc: "사이드 메뉴", image: "..." },
          {
            name: "싸이순살버거",
            price: 4500,
            desc: "대표 메뉴",
            image: "...",
          },
          { name: "감자튀김", price: 2000, desc: "사이드 메뉴", image: "..." },
          {
            name: "싸이순살버거",
            price: 4500,
            desc: "대표 메뉴",
            image: "...",
          },
          { name: "감자튀김", price: 2000, desc: "사이드 메뉴", image: "..." },
        ],
        reviews: [
          { user: "철수", comment: "맛있어요!" },
          { user: "영희", comment: "조금 짜요" },
          { user: "철수", comment: "맛있어요!" },
          { user: "영희", comment: "조금 짜요" },
          { user: "철수", comment: "맛있어요!" },
          { user: "영희", comment: "조금 짜요" },
          { user: "철수", comment: "맛있어요!" },
          { user: "영희", comment: "조금 짜요" },
          { user: "철수", comment: "맛있어요!" },
          { user: "영희", comment: "조금 짜요" },
          { user: "철수", comment: "맛있어요!" },
          { user: "영희", comment: "조금 짜요" },
        ],
      },
      {
        id: 2,
        name: "홍콩반점",
        category: "중식",
        desc: "짜장면과 탕수육의 명가",
        image: "https://via.placeholder.com/150",
        rating: 4.0,
        reviews: [
          { user: "철수", comment: "맛있어요!" },
          { user: "영희", comment: "조금 짜요" },
          { user: "철수", comment: "맛있어요!" },
          { user: "영희", comment: "조금 짜요" },
          { user: "철수", comment: "맛있어요!" },
          { user: "영희", comment: "조금 짜요" },
        ],
      },
      {
        id: 3,
        name: "이자카야 하나",
        category: "일식",
        desc: "사케와 함께하는 스시",
        image: "https://via.placeholder.com/150",
        rating: 4.7,
      },
      {
        id: 4,
        name: "맘스터치",
        category: "분식",
        desc: "맛있는 버거와 후라이드치킨",
        image: "https://via.placeholder.com/150", // 임시 이미지
        rating: 4.3,
      },
      {
        id: 5,
        name: "홍콩반점",
        category: "중식",
        desc: "짜장면과 탕수육의 명가",
        image: "https://via.placeholder.com/150",
        rating: 4.0,
      },
      {
        id: 6,
        name: "이자카야 하나",
        category: "일식",
        desc: "사케와 함께하는 스시",
        image: "https://via.placeholder.com/150",
        rating: 4.7,
      },
      {
        id: 7,
        name: "맘스터치",
        category: "분식",
        desc: "맛있는 버거와 후라이드치킨",
        image: "https://via.placeholder.com/150", // 임시 이미지
        rating: 4.3,
      },
      {
        id: 8,
        name: "홍콩반점",
        category: "중식",
        desc: "짜장면과 탕수육의 명가",
        image: "https://via.placeholder.com/150",
        rating: 4.0,
      },
      {
        id: 9,
        name: "이자카야 하나",
        category: "일식",
        desc: "사케와 함께하는 스시",
        image: "https://via.placeholder.com/150",
        rating: 4.7,
      },
      {
        id: 10,
        name: "맘스터치",
        category: "분식",
        desc: "맛있는 버거와 후라이드치킨",
        image: "https://via.placeholder.com/150", // 임시 이미지
        rating: 4.3,
      },
      {
        id: 11,
        name: "홍콩반점",
        category: "중식",
        desc: "짜장면과 탕수육의 명가",
        image: "https://via.placeholder.com/150",
        rating: 4.0,
      },
      {
        id: 12,
        name: "이자카야 하나",
        category: "일식",
        desc: "사케와 함께하는 스시",
        image: "https://via.placeholder.com/150",
        rating: 4.7,
      },
      {
        id: 13,
        name: "맘스터치",
        category: "분식",
        desc: "맛있는 버거와 후라이드치킨",
        image: "https://via.placeholder.com/150", // 임시 이미지
        rating: 4.3,
      },
      {
        id: 14,
        name: "홍콩반점",
        category: "중식",
        desc: "짜장면과 탕수육의 명가",
        image: "https://via.placeholder.com/150",
        rating: 4.0,
      },
      {
        id: 15,
        name: "이자카야 하나",
        category: "일식",
        desc: "사케와 함께하는 스시",
        image: "https://via.placeholder.com/150",
        rating: 4.7,
      },
    ];

    // 백엔드 없이 더미 데이터만 바로 넣음
    setRestaurantData(dummyData);
  }, []);
  return (
    <div className="App">
      <Header
        inputText={inputText}
        setInputText={setInputText}
        setSearchText={setSearchText}
        resetAllFilters={resetAllFilters}
      />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <MainBanner />
              <CategoryFilter
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
              <RestaurantList
                restaurants={restaurantData}
                selectedCategory={selectedCategory}
                searchText={searchText}
              />
            </>
          }
        />
        <Route
          path="/restaurant/:name"
          element={
            <>
              <RestaurantDetail restaurants={restaurantData} />
            </>
          }
        />
      </Routes>
    </div>
  );
}
export default App;
