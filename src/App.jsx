import "./App.css";
import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import CategoryFilter from "./components/CategoryFilter.jsx";
import RestaurantDetail from "./components/RestaurantDetail.jsx";
import RestaurantList from "./components/RestaurantList.jsx";
import KakaoMap from "./components/KakaoMap.jsx";
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
  useEffect(() => {
    fetch("http://localhost:8080/api/restaurants")
      .then((res) => res.json())
      .then((data) => setRestaurantData(data))
      .catch((err) => {
        console.error("음식점 데이터를 가져오는 데 실패했습니다:", err);
      });
  }, []);

  return (
    <>
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
              <KakaoMap />
            </>
          }
        />
      </Routes>
    </>
  );
}
export default App;
