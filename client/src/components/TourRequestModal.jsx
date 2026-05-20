import { useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { X, Calendar, Clock, User, MessageSquare } from "lucide-react";

function TourRequestModal({ property, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    tourDate: "",
    tourTime: "",
    message: "",
    buyerName: localStorage.getItem("name") || "",
    buyerEmail: "",
    buyerPhone: "",
  });
  const [loading, setLoading] = useState(false);
  const { emit, connected } = useSocket();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Emit tour request via socket for real-time notification
      if (connected) {
        emit("tourRequest", {
          propertyId: property._id || property.id,
          propertyTitle: property.title,
          ownerId: property.user?._id || property.user,
          buyerId: localStorage.getItem("userId"),
          buyerName: formData.buyerName,
          buyerEmail: formData.buyerEmail,
          buyerPhone: formData.buyerPhone,
          tourDate: formData.tourDate,
          tourTime: formData.tourTime,
          message: formData.message,
          status: "Pending",
          createdAt: new Date().toISOString(),
        });
      }

      // Also save to localStorage for demo purposes
      const tourRequests = JSON.parse(localStorage.getItem("tourRequests") || "[]");
      tourRequests.push({
        id: Date.now(),
        propertyId: property._id || property.id,
        propertyTitle: property.title,
        ...formData,
        status: "Pending",
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("tourRequests", JSON.stringify(tourRequests));

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Tour request error:", err);
      alert("Failed to send tour request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Request Property Tour
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Property</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {property.title}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {property.location}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar size={14} className="inline mr-1" />
                Tour Date
              </label>
              <input
                type="date"
                required
                value={formData.tourDate}
                onChange={(e) =>
                  setFormData({ ...formData, tourDate: e.target.value })
                }
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Clock size={14} className="inline mr-1" />
                Tour Time
              </label>
              <input
                type="time"
                required
                value={formData.tourTime}
                onChange={(e) =>
                  setFormData({ ...formData, tourTime: e.target.value })
                }
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <User size={14} className="inline mr-1" />
              Your Name
            </label>
            <input
              type="text"
              required
              value={formData.buyerName}
              onChange={(e) =>
                setFormData({ ...formData, buyerName: e.target.value })
              }
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.buyerEmail}
              onChange={(e) =>
                setFormData({ ...formData, buyerEmail: e.target.value })
              }
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.buyerPhone}
              onChange={(e) =>
                setFormData({ ...formData, buyerPhone: e.target.value })
              }
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <MessageSquare size={14} className="inline mr-1" />
              Message (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Any specific requirements or questions..."
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !connected}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading
                ? "Sending..."
                : connected
                ? "Request Tour"
                : "Connecting..."}
            </button>
          </div>

          {!connected && (
            <p className="text-xs text-amber-600 text-center">
              Waiting for real-time connection...
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default TourRequestModal;
