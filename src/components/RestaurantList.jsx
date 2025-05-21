import RestaurantCard from "./RestaurantCard";
import Hangul from "hangul-js";

const RestaurantList = ({ restaurants, selectedCategory, searchText }) => {
  const filtered = restaurants.filter((restaurant) => {
    const isCategoryMatch =
      selectedCategory === "전체" || restaurant.category === selectedCategory;

    const isNameMatch =
      searchText === "" || Hangul.search(restaurant.name, searchText) > -1;

    return isCategoryMatch && isNameMatch;
  });

  return (
    <div className="restaurantList">
      {filtered.length === 0 ? (
        <p>해당 음식점을 찾을 수 없습니다</p>
      ) : (
        filtered.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))
      )}
    </div>
  );
};

export default RestaurantList;
