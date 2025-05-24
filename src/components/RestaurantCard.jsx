import "./RestaurantCard.css";
import good from "../asset/default_thumb.png";
const RestaurantCard = ({ restaurant }) => {
  const handleClick = () => {
    const url = `${window.location.origin}/restaurant/${restaurant.id}`;
    window.open(url, "_blank");
  };

  return (
    <button className="card" onClick={handleClick}>
      <img
        className="card-img"
        src={restaurant.image ? restaurant.image : good}
        alt={restaurant.name}
      />
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
