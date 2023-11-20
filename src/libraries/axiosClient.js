import axios from "axios";

const axiosClient = axios.create({
  // baseURL: 'http://localhost:8000',
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export default axiosClient;
