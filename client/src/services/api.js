import axios from "axios";

// Central Axios instance. All API calls go through this so the base URL
// and auth header only need to be configured in one place.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach JWT token (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Pulls a safe, user-friendly message out of an Axios error. Falls back to
// a generic message so we never leak raw stack traces or network details.
export const getErrorMessage = (err) => {
  return err?.response?.data?.message || "Something went wrong. Please try again.";
};

export default api;
