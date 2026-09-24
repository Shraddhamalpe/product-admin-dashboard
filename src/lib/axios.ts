import axios from "axios";

const api = axios.create({
  baseURL: "https://dummyjson.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add authentication token to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Central API error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (typeof window !== "undefined") {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        if (
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
        }
      }
    }

    console.error(
      "API Error:",
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default api;