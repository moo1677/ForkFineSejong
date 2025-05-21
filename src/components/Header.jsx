import { Link } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import MainBanner from "./MainBanner";
const Header = ({
  inputText,
  setInputText,
  setSearchText,
  resetAllFilters,
}) => {
  /** input 테그에 타이핑 시 바로 타이핑 된 값이 렌더링됩니다 */
  const onChangeContent = (e) => {
    setInputText(e.target.value);
  };
  /** 엔터 입력시 searchText의 state가 바뀝니다 */
  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      setSearchText(inputText);
    }
  };

  return (
    <header>
      {/* 좌측 로고 */}
      <Link to="/" onClick={resetAllFilters}>
        페이지로고
      </Link>
      {/* 중앙 검색창 */}
      <div>
        <input
          type="text"
          placeholder="음식점 이름 입력"
          value={inputText}
          onChange={onChangeContent}
          onKeyDown={onKeyDown}
        />
        {/* 돋보기 아이콘 */}
        <CiSearch />
      </div>
      <MainBanner />
    </header>
  );
};
export default Header;
