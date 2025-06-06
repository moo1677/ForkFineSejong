// src/api/axiosInstance.js

import axios from "axios";

// 로컬이 아니라 항상 이 주소를 사용하도록 하드코딩
const baseURL = "http://3.35.234.131:8080";

const api = axios.create({
  baseURL,
  // 필요한 헤더가 있으면 여기 추가
  // headers: { "Content-Type": "application/json" },
});

export default api;
