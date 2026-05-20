import { createContext, useContext, useEffect, useState, useCallback } from "react";
import API from "../utils/axiosConfig";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      // Set initial state from storage
      setToken(storedToken);
      setRole(storedRole);
      setIsAuthenticated(true);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
      
      // Validate token by making a test API call
      API.get("/properties", { headers: { Authorization: `Bearer ${storedToken}` } })
        .catch((err) => {
          // If token is invalid (401), clear auth state
          if (err.response?.status === 401) {
            console.log("Token expired or invalid, clearing auth state");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user");
            localStorage.removeItem("userId");
            localStorage.removeItem("name");
            setToken(null);
            setRole(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        });
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await API.post("/auth/login", { email, password });
      
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user._id || data.user.id);
        localStorage.setItem("name", data.user.name);
        
        setToken(data.token);
        setRole(data.user.role);
        setUser(data.user);
        setIsAuthenticated(true);
        
        return { success: true, user: data.user, role: data.user.role };
      }
      return { success: false, message: "Invalid response from server" };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      return { success: false, message };
    }
  }, []);

  const signup = useCallback(async (userData) => {
    try {
      const { data } = await API.post("/auth/signup", userData);
      
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user._id || data.user.id);
        localStorage.setItem("name", data.user.name);
        
        setToken(data.token);
        setRole(data.user.role);
        setUser(data.user);
        setIsAuthenticated(true);
        
        return { success: true, user: data.user, role: data.user.role };
      }
      return { success: false, message: "Invalid response from server" };
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed";
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    
    setToken(null);
    setRole(null);
    setUser(null);
    setIsAuthenticated(false);
    
    window.dispatchEvent(new Event("authStateChanged"));
  }, []);

  const isAdmin = useCallback(() => {
    return role === "admin";
  }, [role]);

  const isUser = useCallback(() => {
    return role === "user";
  }, [role]);

  const hasRole = useCallback((requiredRole) => {
    if (requiredRole === "admin") return role === "admin";
    if (requiredRole === "user") return role === "user";
    return false;
  }, [role]);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    token,
    role,
    isAuthenticated,
    isAdmin,
    isUser,
    hasRole,
    login,
    signup,
    logout,
    updateUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
