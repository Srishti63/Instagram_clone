import { createContext, useContext, useEffect, useState } from "react";
import API from "../Api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkCurrentUser = async () => {
            try {
                // Determine if a session exists by hitting the getCurrentUser endpoint
                const response = await API.get("/users/current-user");
                if (response.data?.success) {
                    setUser(response.data.data);
                    // We also save a copy of userId to localStorage for the socket to read on hard refreshes
                    localStorage.setItem("userId", response.data.data._id);
                }
            } catch (error) {
                console.log("No active user session.");
                setUser(null);
                localStorage.removeItem("userId");
            } finally {
                setLoading(false);
            }
        };

        checkCurrentUser();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await API.post("/users/login", credentials);
            setUser(response.data.data.user);
            localStorage.setItem("userId", response.data.data.user._id);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await API.post("/users/register", userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const response = await API.post("/users/verify-email-otp", { email, otp });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const resendOtp = async (email) => {
        try {
            const response = await API.post("/users/resend-email-otp", { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await API.post("/users/logout");
            setUser(null);
            localStorage.removeItem("userId");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyOtp, resendOtp, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
