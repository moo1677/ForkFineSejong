import { useParams } from "react-router-dom";

const RestaurantDetail = ({ restaurants }) => {
  const { name } = useParams();

  // name과 정확히 일치하는 음식점 찾기
  const restaurant = restaurants.find((r) => r.name === name);

  if (!restaurant) {
    return <div>음식점 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div>
      <h2>{restaurant.name}</h2>
      <p>카테고리: {restaurant.category}</p>
      <p>설명: {restaurant.desc}</p>
      {/* 필요시 이미지, 위치, 평점 등 추가 가능 */}
    </div>
  );
};

export default RestaurantDetail;
