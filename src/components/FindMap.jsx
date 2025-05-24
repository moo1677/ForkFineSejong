import "./FindMap.css";
import KakaoMapList from "./KakaoMapList";
import { useLocation } from "react-router-dom";
import good from "../asset/default_thumb.png";

const FindMap = ({ restaurants }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchText = queryParams.get("query") || "";

  const filtered = searchText
    ? restaurants.filter((r) => r.name.includes(searchText))
    : [];

  // 검색 결과가 없을 때 대체 주소 (세종대)
  const fallbackAddress = ["서울특별시 광진구 능동로 209"];

  return (
    <div className="find-map-container">
      <div className="restaurant-list-wrapper">
        <div className="restaurant-list">
          {filtered.length === 0 ? (
            <div className="no-result">
              <p>
                <strong>"{searchText}"</strong> 에 대한 검색 결과가 없어요.
              </p>
            </div>
          ) : (
            filtered.map((restaurant) => (
              <div
                onClick={() => {
                  const url = `${window.location.origin}/restaurant/${restaurant.id}`;
                  window.open(url, "_blank");
                }}
                className="restaurant-item"
                key={restaurant.id}
              >
                <div className="restaurant-header">
                  <h3 className="restaurant-name">{restaurant.name}</h3>
                  <div className="rating-score">
                    <strong>{restaurant.rating}</strong>점 · ⭐{" "}
                    <span className="review-count">
                      ({restaurant.reviews?.length || 0}명)
                    </span>
                  </div>
                </div>

                <div className="tags">
                  {restaurant.menu?.slice(0, 3).map((m, idx) => (
                    <span key={idx} className="tag">
                      {m.name}
                    </span>
                  ))}
                </div>

                <p className="address">📍 {restaurant.address}</p>

                <div className="image-list">
                  {(() => {
                    const images =
                      restaurant.menu?.filter(
                        (m) => m.image && m.image !== ""
                      ) || [];

                    return images.length > 0 ? (
                      images
                        .slice(0, 3)
                        .map((m, idx) => (
                          <img
                            key={idx}
                            src={m.image}
                            alt={`${restaurant.name} 메뉴 ${idx + 1}`}
                          />
                        ))
                    ) : (
                      <img src={good} /> // 혹은 <div>good</div> 원하면
                    );
                  })()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="map-area">
        <KakaoMapList
          addresses={
            filtered.length > 0
              ? filtered.map((r) => r.address)
              : fallbackAddress
          }
        />
      </div>
    </div>
  );
};

export default FindMap;
