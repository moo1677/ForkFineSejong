import { useEffect } from "react";
const { kakao } = window;
const KakaoMap = ({ address }) => {
  useEffect(() => {
    const container = document.getElementById("map"); //지도를 담을 영역의 DOM 레퍼런스
    const option = {
      center: new kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표
      level: 3,
    };
    const map = new kakao.maps.Map(container, option); //지도 생성 및 객체 리턴
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, function (result, status) {
      if (status === kakao.maps.services.Status.OK) {
        // 3. 성공적으로 검색된 경우
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

        // 4. 지도 중심 이동
        map.setCenter(coords);

        // 5. 마커 생성 및 표시
        const marker = new kakao.maps.Marker({
          map: map,
          position: coords,
        });
      } else {
        console.log("❌ 주소 검색 실패:", status);
      }
    });
  }, [address]);

  return (
    <div
      id="map"
      style={{
        width: "720px",
        height: "400px",
      }}
    ></div>
  );
};
export default KakaoMap;
//https://apis.map.kakao.com/web/sample/addr2coord/
