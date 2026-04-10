import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refreshToken");
      if (!refresh) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refresh,
        });
        localStorage.setItem("accessToken", response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (payload) => api.post("/api/auth/login", payload),
  register: (payload) => api.post("/api/auth/register", payload),
  profile: () => api.get("/api/auth/profile"),
  updateProfile: (payload) => api.patch("/api/auth/profile", payload),
};

export const dashboardApi = {
  analytics: () => api.get("/api/analytics/dashboard"),
  networth: () => api.get("/api/analytics/networth"),
  health: () => api.get("/api/analytics/financial-health"),
};

export const investmentApi = {
  list: () => api.get("/api/investments/"),
  create: (payload) => api.post("/api/investments/add", payload),
  update: (id, payload) => api.patch(`/api/investments/${id}`, payload),
  remove: (id) => api.delete(`/api/investments/${id}`),
  summary: () => api.get("/api/investments/summary"),
  suggestions: () => api.get("/api/investments/suggestions"),
};

export const transactionApi = {
  list: () => api.get("/api/transactions/"),
  create: (payload) => api.post("/api/transactions/manual", payload),
  summary: () => api.get("/api/transactions/monthly-summary"),
};

export const loanApi = {
  providers: () => api.get("/api/loans/providers"),
  recommendations: () => api.get("/api/loans/recommendations"),
  emi: (payload) => api.post("/api/loans/emi-calculate", payload),
};

export const notificationApi = {
  list: () => api.get("/api/notifications/"),
  monthly: () => api.post("/api/notifications/send-monthly-summary"),
  profitLoss: () => api.post("/api/notifications/send-profit-loss"),
  loanWarning: () => api.post("/api/notifications/send-loan-warning"),
};

export default api;
