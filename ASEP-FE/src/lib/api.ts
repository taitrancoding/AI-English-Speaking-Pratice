import axios from "axios";

const LOCAL_AUTH_KEY = "asep_auth";

function getToken(): string | null {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.token || null;
  } catch (e) {
    return null;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("[apiClient] No token found in localStorage");
  }
  console.log("[apiClient] Request:", config.method?.toUpperCase(), config.url, "Token:", token ? "Present" : "Missing");
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log("[apiClient] Response:", response.config.method?.toUpperCase(), response.config.url, "Status:", response.status);
    console.log("[apiClient] Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("[apiClient] Error:", error.config?.method?.toUpperCase(), error.config?.url, "Status:", error.response?.status);
    console.error("[apiClient] Error data:", error.response?.data);
    // Do not automatically clear tokens on 401. Some endpoints may legitimately
    // return 401 for role-based access without invalidating the session.
    // Let calling components decide how to react (show error, redirect, etc.).
    return Promise.reject(error);
  }
);

export default apiClient;
