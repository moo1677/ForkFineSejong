import { useNavigate } from "react-router-dom";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const encodedName = encodeURIComponent(restaurant.name);
    const url = `${window.location.origin}/restaurant/${encodedName}`;
    window.open(url, "_blank");
  };

  return (
    <div
      className="restaurantCard"
      onClick={handleClick}
      //style={{ cursor: "pointer", border: "1px solid #ccc", padding: "1rem", margin: "1rem" }}
    >
      <img src />
      <h3>{restaurant.name}</h3>
      <p>{restaurant.desc}</p>
    </div>
  );
};

export default RestaurantCard;
