import "./App.css";
import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import CategoryFilter from "./components/CategoryFilter.jsx";
import RestaurantDetail from "./components/RestaurantDetail.jsx";
import RestaurantList from "./components/RestaurantList.jsx";
import { Routes, Route } from "react-router-dom";

// 1. "/" 메인 홈 페이지
// 2. "/Card" 음식점 상세 페이지
function App() {
  /** 카테고리를 바꾸는 useState */
  const [selectedCategory, setSelectedCategory] = useState("전체");
  /** 검색어를 바꾸는 useState */
  const [searchText, setSearchText] = useState("");
  /** 검색창의 검색어를 바꾸는 useState */
  const [inputText, setInputText] = useState("");
  return (
    <>
      <Header
        inputText={inputText}
        setInputText={setInputText}
        setSearchText={setSearchText}
      />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <CategoryFilter
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
              <RestaurantList
                selectedCategory={selectedCategory}
                searchText={searchText}
              />
            </>
          }
        />
        <Route path="/restaurant/:name" element={<RestaurantDetail />} />
      </Routes>
    </>
  );
}
export default App;
