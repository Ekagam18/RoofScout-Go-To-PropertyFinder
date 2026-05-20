import axios from "axios";

const API = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api",
});

// 🔑 Attach token automatically if present
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ================== AUTH ==================
export const signup = (formData) => API.post("/auth/signup", formData);
export const login = async (formData) => {
  const res = await API.post("/auth/login", formData);
  if (res.data.success && res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.user.role);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("userId", res.data.user._id || res.data.user.id);
    localStorage.setItem("name", res.data.user.name);
  }
  return res;
};

// ================== PROPERTIES ==================
export const addProperty = (propertyData) => API.post("/properties/add", propertyData);
export const getProperties = () => API.get("/properties");
export const getPropertyById = (id) => API.get(`/properties/${id}/view`);
export const getUserProperties = () => API.get("/properties/user");
export const updateProperty = (id, propertyData) => API.put(`/properties/${id}`, propertyData);
export const deleteProperty = (id) => API.delete(`/properties/${id}`);

// ================== ADMIN ==================
export const getAdminStats = () => API.get("/admin/stats");

export default API;
