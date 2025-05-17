import { useEffect } from "react";
const { kakao } = window;
const KakaoMap = () => {
  useEffect(() => {
    const container = document.getElementById("map"); //지도를 담을 영역의 DOM 레퍼런스
    const option = {
      center: new kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표
      level: 3,
    };
    const map = new kakao.maps.Map(container, option); //지도 생성 및 객체 리턴
  }, []);

  return (
    <div
      id="map"
      style={{
        width: "500px",
        height: "400px",
      }}
    ></div>
  );
};
export default KakaoMap;
