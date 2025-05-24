import { Link } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { useState, useRef, useEffect } from "react";
const Header = ({
  inputText,
  setInputText,
  setSearchText,
  resetAllFilters,
  restaurantData,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [recentKeywords, setRecentKeywords] = useState([]);
  const [isShowingRecent, setIsShowingRecent] = useState(false);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setInputText("");
        setSuggestions([]);
        setIsShowingRecent(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onChangeContent = (e) => {
    const keyword = e.target.value;
    setInputText(keyword);
    const saved = JSON.parse(localStorage.getItem("recentKeywords")) || [];

    if (keyword.trim() === "") {
      setRecentKeywords(saved);
      setSuggestions(saved.map((k) => ({ name: k, address: "" })));
      setIsShowingRecent(true);
      return;
    }

    const filtered = restaurantData.filter((r) =>
      r.name.toLowerCase().includes(keyword.toLowerCase())
    );

    if (filtered.length === 0) {
      setRecentKeywords(saved);
      setSuggestions(saved.map((k) => ({ name: k, address: "" })));
      setIsShowingRecent(true);
    } else {
      setSuggestions(filtered);
      setIsShowingRecent(false);
    }
  };

  const saveKeyword = (keyword) => {
    if (!keyword) return;
    let saved = JSON.parse(localStorage.getItem("recentKeywords")) || [];
    saved = [keyword, ...saved.filter((k) => k !== keyword)].slice(0, 5);
    localStorage.setItem("recentKeywords", JSON.stringify(saved));
    setRecentKeywords(saved);
  };

  const handleSuggestionClick = (name) => {
    saveKeyword(name);
    const url = `${window.location.origin}/restaurant/${encodeURIComponent(
      name
    )}`;
    window.open(url, "_blank");
    setSuggestions([]);
  };

  const handleInputFocus = () => {
    const saved = JSON.parse(localStorage.getItem("recentKeywords")) || [];
    setRecentKeywords(saved);
    setSuggestions(saved.map((k) => ({ name: k, address: "" })));
    setIsShowingRecent(true);
  };

  const clearAllRecentKeywords = () => {
    localStorage.removeItem("recentKeywords");
    setRecentKeywords([]);
    setSuggestions([]);
  };

  const deleteKeyword = (keyword) => {
    const updated = recentKeywords.filter((k) => k !== keyword);
    localStorage.setItem("recentKeywords", JSON.stringify(updated));
    setRecentKeywords(updated);
    setSuggestions(updated.map((k) => ({ name: k, address: "" })));
  };

  return (
    <>
      {(isShowingRecent || suggestions.length > 0) && (
        <div
          className="search-overlay"
          onClick={() => {
            setInputText("");
            setSuggestions([]);
            setIsShowingRecent(false);
          }}
        />
      )}

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
            <div
              ref={searchBoxRef}
              className={`search-box ${
                suggestions.length > 0 || isShowingRecent
                  ? "has-suggestions"
                  : ""
              }`}
            >
              <input
                className="search-bar"
                type="text"
                placeholder="음식점 이름 입력"
                value={inputText}
                onChange={onChangeContent}
                onFocus={handleInputFocus}
              />
              <button className="search-btn">
                <CiSearch className="search-icon" />
              </button>

              {(isShowingRecent || suggestions.length > 0) && (
                <div className="suggestion-list">
                  {isShowingRecent ? (
                    recentKeywords.length > 0 ? (
                      <>
                        <div className="suggestion-header">
                          <span>최근 검색어</span>
                          <span
                            className="clear-all"
                            onClick={clearAllRecentKeywords}
                          >
                            모두 지우기
                          </span>
                        </div>
                        <ul>
                          {recentKeywords.map((keyword, index) => (
                            <li key={index}>
                              <span
                                className="keyword-name"
                                onClick={() => handleSuggestionClick(keyword)}
                              >
                                {keyword}
                              </span>
                              <span
                                className="delete-keyword"
                                onClick={() => deleteKeyword(keyword)}
                              >
                                x
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <div className="no-recent">최근 검색어가 없습니다.</div>
                    )
                  ) : (
                    <ul>
                      {suggestions.map((item, index) => (
                        <li key={index}>
                          <span
                            className="keyword-name"
                            onClick={() => handleSuggestionClick(item.name)}
                          >
                            {item.name}
                          </span>
                          {item.address && (
                            <p className="addr">{item.address}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 메뉴 */}
          <nav className="header-nav">메뉴</nav>
        </div>
      </header>
    </>
  );
};

export default Header;
