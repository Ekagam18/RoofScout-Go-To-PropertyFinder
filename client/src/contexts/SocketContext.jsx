import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const newSocket = io(socketUrl, {
      auth: { token, userId },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("🔌 Socket connected:", newSocket.id);
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Listen for notifications
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data) => {
      console.log("📢 Notification received:", data);
      const notification = {
        id: Date.now(),
        ...data,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
    };

    // Property events
    socket.on("propertyAdded", handleNotification);
    socket.on("propertyUpdated", handleNotification);
    socket.on("propertyDeleted", handleNotification);
    
    // Tour request events
    socket.on("tourRequestCreated", handleNotification);
    socket.on("tourRequestUpdated", handleNotification);
    socket.on("tourRequestStatusChanged", handleNotification);
    
    // Message events
    socket.on("newMessage", handleNotification);
    socket.on("messageReceived", handleNotification);
    
    // Admin notifications
    socket.on("adminNotification", handleNotification);

    return () => {
      socket.off("propertyAdded", handleNotification);
      socket.off("propertyUpdated", handleNotification);
      socket.off("propertyDeleted", handleNotification);
      socket.off("tourRequestCreated", handleNotification);
      socket.off("tourRequestUpdated", handleNotification);
      socket.off("tourRequestStatusChanged", handleNotification);
      socket.off("newMessage", handleNotification);
      socket.off("messageReceived", handleNotification);
      socket.off("adminNotification", handleNotification);
    };
  }, [socket]);

  const emit = useCallback(
    (event, data) => {
      if (socket && connected) {
        socket.emit(event, data);
        return true;
      }
      console.warn("Socket not connected, cannot emit:", event);
      return false;
    },
    [socket, connected]
  );

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = {
    socket,
    connected,
    notifications,
    unreadCount,
    emit,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
