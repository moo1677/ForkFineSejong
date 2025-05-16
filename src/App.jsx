import "./App.css";
import { useState } from "react";
import Header from "./components/Header.jsx";
import CategoryFilter from "./components/CategoryFilter.jsx";
function App() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  return (
    <>
      <Header onSearch={(text) => console.log("검색어:", text)} />
      <CategoryFilter
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </>
  );
}
export default App;
