import RestaurantCard from "./RestaurantCard";
import Hangul from "hangul-js";
const mockData = [
  {
    id: 1,
    name: "명동칼국수",
    category: "한식",
    desc: "칼칼하고 따뜻한 국물 맛!",
  },
  { id: 2, name: "버거킹", category: "양식", desc: "든든한 햄버거 세트" },
  { id: 3, name: "교촌치킨", category: "한식", desc: "달콤짭짤 간장치킨" },
  { id: 4, name: "도쿄스시", category: "일식", desc: "신선한 초밥과 회" },
  {
    id: 5,
    name: "홍콩반점",
    category: "중식",
    desc: "짜장, 짬뽕, 탕수육 전문",
  },
  { id: 6, name: "내내치킨", category: "한식", desc: "중독적인 스노윙치킨" },
];
//실행 확인을 위한 더미 데이터

const RestaurantList = ({ selectedCategory, searchText }) => {
  const filtered_Cate =
    selectedCategory === "전체"
      ? mockData
      : mockData.filter((r) => r.category === selectedCategory);
  //카테고리 검색 후 맞는 카테고리 음식점만 저장
  const filtered_Name = mockData.filter(
    (restaurant) => Hangul.search(restaurant.name, searchText) > -1
  );
  return (
    <div className="restaurantList">
      {searchText === "" ? (
        filtered_Cate.length === 0 ? (
          <p>해당 음식점을 찾을 수 없습니다</p>
        ) : (
          filtered_Cate.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))
        )
      ) : (
        filtered_Name.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))
      )}
    </div>
  );
};

export default RestaurantList;
