import "./App.css";
import { useState, useEffect } from "react";
import { useLocation, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import CategoryFilter from "./components/CategoryFilter.jsx";
import RestaurantDetail from "./components/RestaurantDetail.jsx";
import RestaurantList from "./components/RestaurantList.jsx";
import MainBanner from "./components/MainBanner";
import FindMap from "./components/FindMap.jsx";
import LocationFilter from "./components/LocationFilter.jsx";
import axios from "axios";

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
    axios
      .get("http://49.168.153.165:8080/restaurants") // ✅ 올바른 백엔드 주소
      .then((res) => {
        setRestaurantData(res.data); // ✅ 성공 시 데이터 세팅
      })
      .catch((err) => {
        console.error("음식점 데이터를 불러오는데 실패했습니다", err);
      });
  }, []);
  console.log(restaurantData);

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
              <LocationFilter
                restaurants={restaurantData}
                locationFilter="정문"
              />
              <LocationFilter
                restaurants={restaurantData}
                locationFilter="후문"
              />
              <LocationFilter
                restaurants={restaurantData}
                locationFilter="기타"
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
