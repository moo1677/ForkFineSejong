const categories = [
  "전체",
  "한식",
  "양식",
  "중식",
  "일식",
  "분식",
  "아시안",
  "카페",
];

const CategoryFilter = ({ selectedCategory, setSelectedCategory }) => {
  //props로 App.jsx 로 부터 필터링 상태값을 받아옴
  // selectedCategory : 현재 선택된 카테고리
  // setSelectedCategory : 선택된 카테고리를 바꾸는 함수
  return (
    <div className="category-container">
      {categories.map((category) => (
        <button
          key={category}
          className={selectedCategory === category ? "selected" : ""}
          //카테고리가 선택되면 버튼의 모양이 바뀜 classname은 "selected"
          onClick={() => setSelectedCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
