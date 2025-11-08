import axios from "axios";

// Get base URL from environment variable with fallback
const getBaseURL = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  if (!apiUrl) {
    console.error("REACT_APP_API_URL is not set. Please configure it in your environment variables.");
    // Return empty string to use relative URLs as fallback
    return "";
  }
  // Ensure baseURL doesn't end with a slash (axios handles it)
  return apiUrl.replace(/\/$/, "");
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add access token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and retry has not been done yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh token API
        const baseURL = getBaseURL();
        const refreshUrl = baseURL ? `${baseURL}/api/token/refresh/` : "/api/token/refresh/";
        const response = await axios.post(
          refreshUrl,
          { refresh: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const { access, refresh } = response.data;

        // Update tokens in localStorage
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);

        // Update Authorization header and retry original request
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Optional: logout user if refresh fails
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/sign-in";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
