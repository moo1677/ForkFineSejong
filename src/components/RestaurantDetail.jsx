import "./RestaurantDetail.css";
import githubImage from "../asset/github.svg";
import KakaoMap from "./KakaoMap.jsx";
import { useParams } from "react-router-dom";
import { useState } from "react";

const RestaurantDetail = ({ restaurants }) => {
  const { name } = useParams();

  // name과 정확히 일치하는 음식점 찾기
  const restaurant = restaurants.find((r) => r.name === name);

  const [visibleCount, setVisibleCount] = useState(3);
  const [visibleCountReview, setVisibleCountReview] = useState(5);
  if (!restaurant) {
    return <div>음식점 정보를 찾을 수 없습니다.</div>;
  }
  //리뷰를 visibleCount만큼 자르기,
  const reviewsToShow = restaurant.reviews?.slice(0, visibleCountReview) || [];
  const menuToShow = restaurant.menu?.slice(0, visibleCount) || [];
  return (
    <>
      <div className="app">
        <h2>{restaurant.name}</h2>
        <div className="store-intro">
          <h3>매장 소개</h3>
          <p>{restaurant.desc}</p>
        </div>
        <div className="store-info">
          <h3>카테고리</h3>
          <p>{restaurant.category}</p>
          <h3>평점</h3>
          <p>{restaurant.rating}</p>
        </div>
        {/* 메뉴판 */}
        <div className="menu-board">
          <h3>메뉴</h3>
          {menuToShow.length > 0 ? (
            menuToShow.map((item, index) => (
              <div key={index} className="menu-item">
                <img
                  src={item.image}
                  alt={item.name}
                  className="menu-item-image"
                />
                <div className="menu-item-content">
                  <div className="menu-title">
                    <span>{item.name}</span>
                    <span className="menu-price">{item.price}원</span>
                  </div>
                  <p className="menu-desc">{item.desc}</p>
                </div>
              </div>
            ))
          ) : (
            <p>등록된 메뉴가 없습니다.</p>
          )}

          {restaurant.menu?.length > visibleCount && (
            <div className="load-more-section.menu-load-more">
              <button
                className="load-more-btn"
                onClick={() => setVisibleCount((prev) => prev + 3)}
              >
                메뉴 더보기
              </button>
            </div>
          )}
        </div>

        {/* 리뷰 섹션 */}
        <div className="review-section">
          <h3>리뷰</h3>
          {reviewsToShow.length > 0 ? (
            reviewsToShow.map((review, index) => (
              <div key={index} className="review-card">
                <p>
                  <strong>{review.user}</strong> - {review.comment}
                </p>
              </div>
            ))
          ) : (
            <p>아직 리뷰가 없습니다.</p>
          )}

          {/* ✅ 리뷰 더보기 버튼 조건도 null-safe하게 수정 */}
          {restaurant.reviews?.length > visibleCountReview && (
            <div className="load-more-section review-load-more">
              <button
                className="load-more-btn"
                onClick={() => setVisibleCountReview((prev) => prev + 5)}
              >
                리뷰 더보기
              </button>
            </div>
          )}
          <KakaoMap address={restaurant.address} />
        </div>
      </div>
      {/* 푸터 */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-text">
            <h3>세종대 맛집 지도</h3>
            <p>Copyright &copy;2025 </p>
            <p> Fork&Find Team</p>
          </div>
          <div className="footer-icons">
            <button
              className="footer-icon"
              onClick={() =>
                window.open("https://github.com/der0zz/ForkFineSejong")
              }
            >
              <img src={githubImage} alt="로고" height="36" width="36" />
            </button>
            <div className="footer-icon">I</div>
            <div className="footer-icon">T</div>
          </div>
        </div>
      </footer>
      {/* 필요시 이미지, 위치, 평점 등 추가 가능 */}
    </>
  );
};

export default RestaurantDetail;
