import "./FindMap.css";
import KakaoMapList from "./KakaoMapList";
import { useLocation } from "react-router-dom";
import good from "../asset/default_thumb.png";
import { useEffect, useState } from "react";
import axios from "axios";

const FindMap = ({ restaurants }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchText = queryParams.get("query") || "";

  const filtered = searchText
    ? restaurants.filter((r) => r.name.includes(searchText))
    : [];

  const [detailsMap, setDetailsMap] = useState({}); // name → 상세 데이터 매핑

  useEffect(() => {
    // 검색된 음식점들의 상세정보 불러오기
    filtered.forEach((r) => {
      if (detailsMap[r.name]) return; // 이미 있으면 skip

      axios
        .get(
          `http://49.168.153.165:8080/restaurant/${encodeURIComponent(r.name)}`
        )
        .then((res) => {
          setDetailsMap((prev) => ({
            ...prev,
            [r.name]: res.data,
          }));
        })
        .catch((err) => {
          console.error(`❌ ${r.name} 상세정보 불러오기 실패`, err);
        });
    });
  }, [filtered]);

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
            filtered.map((restaurant) => {
              const detail = detailsMap[restaurant.name];
              const menus = detail?.menus || [];
              const reviews = detail?.reviews || [];

              return (
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
                      <span className="review-count">({reviews.length}명)</span>
                    </div>
                  </div>

                  <div className="restaurant-desc">{restaurant.desc}</div>

                  <div className="tags">
                    {menus.slice(0, 3).map((m, idx) => (
                      <span key={idx} className="tag">
                        {m.name}
                      </span>
                    ))}
                  </div>

                  <p className="address">📍 {restaurant.address}</p>

                  <div className="image-list">
                    {(() => {
                      const images = menus.filter(
                        (m) => m.imageUrl && m.imageUrl !== ""
                      );

                      if (images.length > 0) {
                        return images.slice(0, 3).map((m, idx) => (
                          <img
                            key={idx}
                            src={m.imageUrl}
                            alt={`${restaurant.name} 메뉴 ${idx + 1}`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = good;
                            }}
                          />
                        ));
                      } else if (
                        restaurant.main_image_url &&
                        restaurant.main_image_url.trim() !== ""
                      ) {
                        return (
                          <img
                            src={restaurant.main_image_url}
                            alt={`${restaurant.name} 대표 이미지`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = good;
                            }}
                          />
                        );
                      } else {
                        return <img src={good} alt="기본 이미지" />;
                      }
                    })()}
                  </div>

                  <div className="review_comment">
                    {reviews.length > 0 ? (
                      <>"{reviews[0].comment}"</>
                    ) : (
                      "리뷰가 없어요.."
                    )}
                  </div>
                </div>
              );
            })
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
