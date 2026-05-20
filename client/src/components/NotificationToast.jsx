import { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { X, Bell, Home, Calendar, MessageSquare, Trash2, Edit3, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const icons = {
  propertyAdded: Plus,
  propertyUpdated: Edit3,
  propertyDeleted: Trash2,
  tourRequestCreated: Calendar,
  tourRequestUpdated: Calendar,
  tourRequestStatusChanged: Calendar,
  newMessage: MessageSquare,
  messageReceived: MessageSquare,
  adminNotification: Bell,
  default: Bell,
};

const colors = {
  propertyAdded: "bg-green-500",
  propertyUpdated: "bg-blue-500",
  propertyDeleted: "bg-red-500",
  tourRequestCreated: "bg-purple-500",
  tourRequestUpdated: "bg-purple-500",
  tourRequestStatusChanged: "bg-yellow-500",
  newMessage: "bg-cyan-500",
  messageReceived: "bg-cyan-500",
  adminNotification: "bg-orange-500",
  default: "bg-gray-500",
};

function NotificationToast() {
  const { notifications, markAsRead, markAllAsRead, clearNotifications, unreadCount } = useSocket();
  const [showPanel, setShowPanel] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Show toast for new notifications
  useEffect(() => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length > 0) {
      const latest = unreadNotifications[0];
      const toastId = Date.now();
      
      setToasts((prev) => [
        { id: toastId, notification: latest },
        ...prev.slice(0, 2), // Keep only last 3 toasts
      ]);

      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 5000);
    }
  }, [notifications]);

  const handleDismissToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const getIcon = (type) => {
    const IconComponent = icons[type] || icons.default;
    return <IconComponent size={18} />;
  };

  const getColor = (type) => {
    return colors[type] || colors.default;
  };

  const getMessage = (notification) => {
    if (notification.message) return notification.message;
    if (notification.title) return notification.title;
    
    switch (notification.type) {
      case "propertyAdded":
        return `New property added: ${notification.property?.title || "Unknown"}`;
      case "propertyUpdated":
        return `Property updated: ${notification.property?.title || "Unknown"}`;
      case "propertyDeleted":
        return `Property deleted: ${notification.property?.title || "Unknown"}`;
      case "tourRequestCreated":
        return `New tour request from ${notification.tourRequest?.buyerName || "Unknown"}`;
      case "tourRequestStatusChanged":
        return `Tour request ${notification.tourRequest?.status || "updated"}`;
      case "newMessage":
        return `New message from ${notification.message?.sender || "Unknown"}`;
      default:
        return "New notification";
    }
  };

  return (
    <>
      {/* Floating Notification Bell */}
      <div className="fixed top-24 right-6 z-50">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="relative p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg transition-all"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-24 right-6 w-80 max-h-96 bg-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden border border-gray-700 mt-2"
          >
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-white font-semibold">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-teal-400 hover:text-teal-300"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-72">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors ${
                      !notification.read ? "bg-gray-700/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full text-white ${getColor(
                          notification.type
                        )}`}
                      >
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {getMessage(notification)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-700 text-center">
                <button
                  onClick={clearNotifications}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${getColor(
                toast.notification.type
              )}`}
            >
              {getIcon(toast.notification.type)}
              <span className="text-sm max-w-xs truncate">
                {getMessage(toast.notification)}
              </span>
              <button
                onClick={() => handleDismissToast(toast.id)}
                className="ml-2 text-white/70 hover:text-white"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

export default NotificationToast;
