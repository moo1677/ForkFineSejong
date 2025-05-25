import { useRef } from "react";
import RestaurantCard from "./RestaurantCard";
import "./LocationFilter.css";

const LocationFilter = ({ restaurants = [], locationFilter }) => {
  const containerRef = useRef();

  const filtered = restaurants.filter((r) => r.locationTag === locationFilter);

  const scrollLeft = () => {
    containerRef.current.scrollBy({ left: -240, behavior: "smooth" });
  };

  const scrollRight = () => {
    containerRef.current.scrollBy({ left: 240, behavior: "smooth" });
  };

  return (
    <section className="location-section">
      <h3>{locationFilter}</h3>

      <div className="scroll-wrapper">
        <button className="scroll-btn left" onClick={scrollLeft}>
          &lt;
        </button>

        <div className="card-row" ref={containerRef}>
          {filtered.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>

        <button className="scroll-btn right" onClick={scrollRight}>
          &gt;
        </button>
      </div>
    </section>
  );
};

export default LocationFilter;
