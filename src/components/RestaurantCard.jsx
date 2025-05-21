import "./RestaurantCard.css";
import { useNavigate } from "react-router-dom";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const encodedName = encodeURIComponent(restaurant.name);
    navigate(`/restaurant/${encodedName}`);
  };

  return (
    <button className="card" onClick={handleClick}>
      <img className="card-img" src />
      <h3 className="card-title">
        {restaurant.name}
        {restaurant.rating && (
          <span className="card-rating">⭐ {restaurant.rating}</span>
        )}
      </h3>
      <p className="card-desc">{restaurant.desc}</p>
    </button>
  );
};

export default RestaurantCard;
