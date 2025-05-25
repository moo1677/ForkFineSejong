import "./RestaurantList.css";
import RestaurantCard from "./RestaurantCard";

const RestaurantList = ({ restaurants = [], selectedCategory = "전체" }) => {
  const filtered = restaurants.filter(
    (r) => selectedCategory === "전체" || r.category === selectedCategory
  );

  if (filtered.length === 0) {
    return (
      <section className="grid-section">
        <p>해당 음식점을 찾을 수 없습니다</p>
      </section>
    );
  }

  return (
    <section className="grid-section">
      <div className="card-grid">
        {filtered.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </section>
  );
};

export default RestaurantList;
