import { useRef } from "react";
import RestaurantCard from "./RestaurantCard";
import "./LocationFilter.css";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

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
          <HiOutlineChevronLeft size={24} />
        </button>

        <div className="card-row" ref={containerRef}>
          {filtered.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>

        <button className="scroll-btn right" onClick={scrollRight}>
          <HiOutlineChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default LocationFilter;
