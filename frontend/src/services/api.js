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
        if (response.data.refresh) {
          localStorage.setItem("refreshToken", response.data.refresh);
        }
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
  projection: (payload) => api.post("/api/analytics/projection", payload),
};

export const investmentApi = {
  list: (params = {}) => api.get("/api/investments/", { params }),
  create: (payload) => api.post("/api/investments/add", payload),
  update: (id, payload) => api.patch(`/api/investments/${id}`, payload),
  remove: (id) => api.delete(`/api/investments/${id}`),
  summary: () => api.get("/api/investments/summary"),
  suggestions: () => api.get("/api/investments/suggestions"),
};

export const transactionApi = {
  list: (params = {}) => api.get("/api/transactions/", { params }),
  summary: () => api.get("/api/transactions/monthly-summary"),
};

export const marketApi = {
  snapshots: (params = {}) => api.get("/api/market-data/snapshots", { params }),
  refresh: () => api.post("/api/market-data/refresh"),
};

export const recommendationApi = {
  list: () => api.get("/api/recommendations/"),
  marketTiming: () => api.get("/api/recommendations/market-timing"),
};

export const loanApi = {
  providers: () => api.get("/api/loans/providers"),
  providerDashboard: () => api.get("/api/loans/provider/dashboard"),
  createProviderOffer: (payload) => api.post("/api/loans/provider/dashboard", payload),
  applications: () => api.get("/api/loans/applications"),
  apply: (payload) => api.post("/api/loans/applications", payload),
  updateApplicationStatus: (id, payload) => api.post(`/api/loans/applications/${id}/status`, payload),
  recommendations: () => api.get("/api/loans/recommendations"),
  advice: () => api.get("/api/loans/advice"),
  emi: (payload) => api.post("/api/loans/emi-calculate", payload),
};

export const paymentApi = {
  checkoutSession: (payload) => api.post("/api/payments/checkout-session", payload),
  confirmSession: (payload) => api.post("/api/payments/confirm-session", payload),
  paymentLink: (payload) => api.post("/api/payments/payment-link", payload),
};

export const notificationApi = {
  list: () => api.get("/api/notifications/"),
  monthly: () => api.post("/api/notifications/send-monthly-summary"),
  profitLoss: () => api.post("/api/notifications/send-profit-loss"),
  loanWarning: () => api.post("/api/notifications/send-loan-warning"),
};

export default api;
