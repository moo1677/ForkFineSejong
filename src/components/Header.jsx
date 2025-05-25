import "./Header.css";
import { Link } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
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
  const [isFocused, setIsFocused] = useState(false);
  const searchBoxRef = useRef(null);
  const lastOpened = useRef("");

  // 문자열 포함 여부 확인
  const includesQuery = (text, query) => {
    if (!text || !query) return false;
    return text.toLowerCase().includes(query.toLowerCase());
  };

  // 최근 검색어 저장
  const saveKeyword = (item) => {
    let saved = JSON.parse(localStorage.getItem("recentKeywords")) || [];
    const isSame =
      typeof item === "string"
        ? (k) => k === item
        : (k) => typeof k === "object" && k.id === item.id;

    saved = [item, ...saved.filter((k) => !isSame(k))].slice(0, 5);
    localStorage.setItem("recentKeywords", JSON.stringify(saved));
    setRecentKeywords(saved);
  };

  // 검색 실행 및 중복 방지
  const triggerSearch = () => {
    if (!inputText.trim()) return;

    const encoded = encodeURIComponent(inputText.trim());
    if (lastOpened.current === encoded) return;
    lastOpened.current = encoded;

    setSearchText(inputText);
    saveKeyword(inputText);
    window.open(`/find?query=${encoded}`);
  };

  // Enter 키 입력 시 검색
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerSearch();
    }
  };

  // 추천 음식점 클릭 시 이동
  const handleSuggestionClick = (restaurant) => {
    saveKeyword(restaurant);
    window.open(`/restaurant/${restaurant.id}`);
    setSuggestions([]);
  };

  // 검색창 입력 시 상태 및 추천어 업데이트
  const onChangeContent = (e) => {
    const keyword = e.target.value;
    setInputText(keyword);

    if (keyword.trim() === "") {
      const saved = JSON.parse(localStorage.getItem("recentKeywords")) || [];
      setRecentKeywords(saved);
      setSuggestions([]);
      return;
    }

    const filtered = restaurantData.filter((r) =>
      includesQuery(r.name, keyword)
    );
    setSuggestions(filtered);
  };

  // 검색창 포커스 시 최근 검색어 불러오기
  const handleInputFocus = () => {
    setIsFocused(true);
    const saved = JSON.parse(localStorage.getItem("recentKeywords")) || [];
    setRecentKeywords(saved);

    if (inputText.trim() === "") {
      setSuggestions([]);
    }
  };

  // 검색창 포커스 해제 시 포커스 상태 false 처리
  // 검색창 포커스 해제 시 포커스 상태 false 처리 (제거됨)
  const handleInputBlur = (e) => {
    // blur 후 suggestions 유지
  };

  // 최근 검색어 삭제
  const deleteKeyword = (target, e) => {
    e.preventDefault();
    e.stopPropagation();
    const isText = typeof target === "string";
    const updated = recentKeywords.filter((k) =>
      isText ? k !== target : typeof k === "string" || k.id !== target.id
    );
    localStorage.setItem("recentKeywords", JSON.stringify(updated));
    setRecentKeywords(updated);
  };

  // 검색창 외부 클릭 시 추천어 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showRecent = isFocused && suggestions.length === 0;

  return (
    <>
      {(showRecent || suggestions.length > 0) && (
        <div
          className="search-overlay"
          onClick={() => {
            setInputText("");
            setSuggestions([]);
          }}
        />
      )}

      <header className="app-header">
        <div className="header-inner">
          <div className="header-left">
            <Link className="logo" to="/" onClick={resetAllFilters}>
              로고
            </Link>
            <span className="brand">F&FS</span>
          </div>

          <div className="header-center">
            <div
              ref={searchBoxRef}
              className={`search-box ${
                showRecent || suggestions.length > 0 ? "has-suggestions" : ""
              }`}
            >
              <input
                className="search-bar"
                type="text"
                placeholder="음식점 이름 입력"
                value={inputText}
                onChange={onChangeContent}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="search-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  triggerSearch();
                }}
              >
                <CiSearch className="search-icon" />
              </button>

              {showRecent && (
                <div className="suggestion-list">
                  <div className="suggestion-header">
                    <span>최근 검색</span>
                  </div>
                  {recentKeywords.length > 0 ? (
                    <ul>
                      {recentKeywords.map((item, index) => {
                        const isText = typeof item === "string";
                        const name = isText ? item : item.name;
                        const address = isText ? null : item.address;
                        const icon = isText ? (
                          <FaSearch className="left-icon" />
                        ) : (
                          <FaMapMarkerAlt className="left-icon" />
                        );
                        return (
                          <li key={index}>
                            <span
                              className="keyword-name"
                              onClick={() =>
                                isText
                                  ? window.open(
                                      `/find?query=${encodeURIComponent(item)}`
                                    )
                                  : window.open(`/restaurant/${item.id}`)
                              }
                            >
                              {icon}
                              {name}
                            </span>
                            {address && <p className="addr">{address}</p>}
                            <button
                              className="delete-keyword"
                              tabIndex={-1}
                              onClick={(e) => deleteKeyword(item, e)}
                            >
                              x
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="no-recent">최근 검색어가 없습니다.</div>
                  )}
                </div>
              )}

              {suggestions.length > 0 && (
                <div className="suggestion-list">
                  <ul>
                    {suggestions.map((item, index) => (
                      <li key={index}>
                        <span
                          className="keyword-name"
                          onClick={() => handleSuggestionClick(item)}
                        >
                          <FaMapMarkerAlt className="left-icon" />
                          {item.name}
                        </span>
                        {item.address && <p className="addr">{item.address}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <nav className="header-nav">메뉴</nav>
        </div>
      </header>
    </>
  );
};

export default Header;
