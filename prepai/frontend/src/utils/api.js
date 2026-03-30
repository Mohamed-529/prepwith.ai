import axios from "axios";

const api = axios.create({
  baseURL:"https://prepai-project.onrender.com",
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

export const registerUser  = (data) => api.post("/auth/register", data);
export const loginUser     = (data) => api.post("/auth/login", data);
export const getMe         = ()     => api.get("/auth/me");
export const getQuestions  = ()     => api.get("/questions");
export const submitAnswers = (data) => api.post("/submit", data);
export const getProgress   = ()     => api.get("/progress");

export default api;
