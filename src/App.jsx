import "./App.css";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import CategoryFilter from "./components/CategoryFilter.jsx";
import RestaurantDetail from "./components/RestaurantDetail.jsx";
import RestaurantList from "./components/RestaurantList.jsx";
import MainBanner from "./components/MainBanner";
import FindMap from "./components/FindMap.jsx";

import { Routes, Route } from "react-router-dom";

function App() {
  const [restaurantData, setRestaurantData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchText, setSearchText] = useState("");
  const [inputText, setInputText] = useState("");
  const location = useLocation();
  const isFindMap = location.pathname === "/find";

  const resetAllFilters = () => {
    setSelectedCategory("전체");
    setSearchText("");
    setInputText("");
  };
  useEffect(() => {
    const dummyData = [
      {
        id: 1,
        name: "맘스터치",
        category: "분식",
        desc: "맛있는 버거와 후라이드치킨",
        image: "",
        rating: 4.3,
        menu: [
          {
            name: "싸이순살버거",
            price: 4500,
            desc: "대표 메뉴",
            image: "",
          },
          { name: "감자튀김", price: 2000, desc: "사이드 메뉴", image: "" },
          {
            name: "싸이순살버거",
            price: 4500,
            desc: "대표 메뉴",
            image: "",
          },
          { name: "감자튀김", price: 2000, desc: "사이드 메뉴", image: "" },
          {
            name: "싸이순살버거",
            price: 4500,
            desc: "대표 메뉴",
            image: "",
          },
          { name: "감자튀김", price: 2000, desc: "사이드 메뉴", image: "" },
          {
            name: "싸이순살버거",
            price: 4500,
            desc: "대표 메뉴",
            image: "",
          },
          { name: "감자튀김", price: 2000, desc: "사이드 메뉴", image: "" },
          {
            name: "싸이순살버거",
            price: 4500,
            desc: "대표 메뉴",
            image: "",
          },
          { name: "감자튀김", price: 2000, desc: "사이드 메뉴", image: "" },
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
        address: "서울특별시 광진구 능동로 209",
      },
      {
        id: 2,
        name: "홍콩반점",
        category: "중식",
        desc: "짜장면과 탕수육의 명가",
        image: "",
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
        image: "",
        rating: 4.7,
      },
      {
        id: 4,
        name: "몸스터치",
        category: "분식",
        desc: "맛있는 버거와 후라이드치킨",
        image: "",
        rating: 4.3,
        address: "충청남도 예산군 예산읍 아리랑로 93-10",
      },
      {
        id: 5,
        name: "홍콩반점",
        category: "중식",
        desc: "짜장면과 탕수육의 명가",
        image: "",
        rating: 4.0,
      },
      {
        id: 6,
        name: "이자카야 하나",
        category: "일식",
        desc: "사케와 함께하는 스시",
        image: "",
        rating: 4.7,
      },
      {
        id: 7,
        name: "맘스터치",
        category: "분식",
        desc: "맛있는 버거와 후라이드치킨",
        image: "",
        rating: 4.3,
      },
      {
        id: 8,
        name: "홍콩반점",
        category: "중식",
        desc: "짜장면과 탕수육의 명가",
        image: "",
        rating: 4.0,
      },
      {
        id: 9,
        name: "이자카야 하나",
        category: "일식",
        desc: "사케와 함께하는 스시",
        image: "",
        rating: 4.7,
      },
      {
        id: 10,
        name: "맘스터치",
        category: "분식",
        desc: "맛있는 버거와 후라이드치킨",
        image: "",
        rating: 4.3,
      },
      {
        id: 11,
        name: "홍콩반점",
        category: "중식",
        desc: "짜장면과 탕수육의 명가",
        image: "",
        rating: 4.0,
      },
      {
        id: 12,
        name: "이자카야 하나",
        category: "일식",
        desc: "사케와 함께하는 스시",
        image: "",
        rating: 4.7,
      },
      {
        id: 13,
        name: "맘스터치",
        category: "분식",
        desc: "맛있는 버거와 후라이드치킨",
        image: "",
        rating: 4.3,
      },
      {
        id: 14,
        name: "홍콩반점",
        category: "중식",
        desc: "짜장면과 탕수육의 명가",
        image: "",
        rating: 4.0,
      },
      {
        id: 15,
        name: "이자카야 하나",
        category: "일식",
        desc: "사케와 함께하는 스시",
        image: "",
        rating: 4.7,
      },
    ];

    setRestaurantData(dummyData);
  }, []);

  return (
    <div className={isFindMap ? "App no-scroll" : "App"}>
      <Header
        inputText={inputText}
        setInputText={setInputText}
        setSearchText={setSearchText}
        resetAllFilters={resetAllFilters}
        restaurantData={restaurantData}
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
          path="/restaurant/:id"
          element={<RestaurantDetail restaurants={restaurantData} />}
        />
        <Route
          path="/find"
          element={<FindMap restaurants={restaurantData} />}
        />
      </Routes>
    </div>
  );
}

export default App;
