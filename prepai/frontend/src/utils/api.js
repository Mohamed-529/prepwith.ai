import axios from "axios";

const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("prepai_user");
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
    } catch {}
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("prepai_user");
    }
    return Promise.reject(error);
  }
);

export const registerUser  = (data) => api.post("/api/auth/register", data);
export const loginUser     = (data) => api.post("/api/auth/login", data);
export const getMe         = ()     => api.get("/api/auth/me");
export const getQuestions  = (category) => api.get("/api/questions", { params: category && category !== "All" ? { category } : {} });
export const submitAnswers = (data) => api.post("/api/submit", data);
export const getProgress   = ()     => api.get("/api/progress");
export const getCacheStats = ()     => api.get("/api/cache/stats");

export default api;
