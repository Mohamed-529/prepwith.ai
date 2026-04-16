import axios from "axios";

const api = axios.create({
  baseURL: "https://prepai-project.onrender.com",
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

export const registerUser  = (data) => api.post("/api/auth/register", data);
export const loginUser     = (data) => api.post("/api/auth/login", data);
export const getMe         = ()     => api.get("/api/auth/me");
export const getQuestions  = ()     => api.get("/api/questions");
export const submitAnswers = (data) => api.post("/api/submit", data);
export const getProgress   = ()     => api.get("/api/progress");

export default api;
