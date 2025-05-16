import { useParams } from "react-router-dom";
const RestaurantDetail = () => {
  const { id } = useParams();
  return (
    <div>
      <h2>음식점</h2>
      <p>음식점 ID : {id}</p>
    </div>
  );
};

export default RestaurantDetail;
