import { useNavigate } from "react-router-dom";
const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();
  return (
    <div
      className="restaurantCard"
      onClick={() => navigate(`/restaurant/${restaurant.name}`)}
      style={{ cursor: "pointer" }}
    >
      <img src />

      <h3>{restaurant.name}</h3>
    </div>
    //이미지 주소 넣기
    //레스토랑 이름 리턴
  );
};
export default RestaurantCard;
