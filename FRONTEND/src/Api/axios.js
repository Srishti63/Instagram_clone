import axios from "axios";

// Our backend is mapped to /api/v1 as per app.js
const API = axios.create({
    baseURL: "http://localhost:8000/api/v1",
    withCredentials: true // Extremely important for sending/receiving Cookies
});

// Response interceptor to handle 401 token expiry automatically
API.interceptors.response.use(
    (response) => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 (Unauthorized) and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token. 
                // Since `withCredentials` is true, the browser will automatically send the `refreshToken` cookie.
                await axios.post("http://localhost:8000/api/v1/users/refresh-token", {}, {
                    withCredentials: true 
                });

                // If successful, the backend attached a new accessToken cookie. 
                // Now retry the original queued request.
                return API(originalRequest);
            } catch (refreshError) {
                // If the refresh token is ALSO expired or invalid, log the user out
                console.error("Session expired. Please log in again.", refreshError);
                // Optionally redirect to login page or clear local state
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default API;