import "./Header.css";
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
    <>
      <header className="app-header">
        <div className="header-inner">
          {/* 왼쪽: 로고 */}
          <div className="header-left">
            <Link className="logo" to="/" onClick={resetAllFilters}>
              로고
            </Link>
            <span className="brand">F&FS</span>
          </div>

          {/* 중앙: 검색창 */}
          <div className="header-center">
            <div className="search-box">
              <input
                className="search-bar"
                type="text"
                placeholder="음식점 이름 입력"
                value={inputText}
                onChange={onChangeContent}
                onKeyDown={onKeyDown}
              />
              <button className="search-btn" onClick={onChangeContent}>
                <CiSearch className="search-icon" />
              </button>
            </div>
          </div>

          {/* 오른쪽: 메뉴 */}
          <nav className="header-nav">메뉴</nav>
        </div>
      </header>

      <MainBanner />
    </>
  );
};
export default Header;
