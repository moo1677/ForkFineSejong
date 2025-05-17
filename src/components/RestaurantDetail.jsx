import { useParams } from "react-router-dom";
const RestaurantDetail = () => {
  const { name } = useParams();
  return (
    <div>
      <h2>음식점</h2>
      <p>음식점 이름 : {name}</p>
    </div>
  );
};

export default RestaurantDetail;
