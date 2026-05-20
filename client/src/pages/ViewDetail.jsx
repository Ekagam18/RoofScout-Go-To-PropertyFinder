// src/pages/ViewDetail.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config";

/**
 * ViewDetail.jsx
 * - Self-contained, defensive, and robust version of your original ViewDetail page.
 * - Removed external dependencies that sometimes cause runtime issues (localAuth, useTheme).
 * - Uses localStorage for a simple "logged user" check so auth-dependent flows still work.
 * - Calls backend endpoint: GET /api/properties/:id/view
 * - Keeps your UI/UX intact (structure, classes, markup) while preventing render crashes.
 *
 * Replace your existing file with this one and restart the dev server.
 */

const getStoredJSON = (key, defaultVal = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (error) {
    console.error(`Error parsing JSON from localStorage key "${key}":`, error);
    return defaultVal;
  }
};

export default function ViewDetail() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();

  const [propertyData, setPropertyData] = useState({
    title: "",
    priceText: "",
    desc: "",
    address: "",
    location: "",
    type: "",
    area: "",
    beds: "",
    baths: "",
    garages: "",
    images: [],
    houseId: "",
    owner: "Unknown",
    ownerEmail: "",
    userId: "",
    status: "available",
    buyerName: ""
  });

  const [ownerStats, setOwnerStats] = useState({ totalProperties: 0, localities: [], address: "" });
  const [loggedUser, setLoggedUser] = useState("");
  const [emailVisible, setEmailVisible] = useState(false);

  const [formData, setFormData] = useState({
    userType: "individual",
    reasonToBuy: "",
    name: "",
    message: "",
    countryCode: "+91",
    email: ""
  });

  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Select Date");
  const [selectedTime, setSelectedTime] = useState("Select Time");

  const DATE_OPTIONS = ["Today", "Tomorrow", "Fri, Nov 21", "Sat, Nov 22", "Sun, Nov 23"];
  const TIME_OPTIONS = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"];

  // Simple "is logged in" check using localStorage (keeps flows working without supabase)
  useEffect(() => {
    const stored = getStoredJSON("userProfile", null);
    if (stored && stored.name) {
      setLoggedUser(stored.name);
      setFormData(f => ({ ...f, name: stored.name, email: stored.email || f.email }));
    } else {
      const sessionUser = sessionStorage.getItem("loggedUser");
      if (sessionUser) {
        setLoggedUser(sessionUser);
        setFormData(f => ({ ...f, name: sessionUser }));
      }
    }
  }, []);

  const isUserLoggedIn = () => {
    // If you use token-based auth, check localStorage token here
    const token = localStorage.getItem("token");
    const sessionUser = sessionStorage.getItem("loggedUser");
    const profile = getStoredJSON("userProfile", null);
    return !!token || !!sessionUser || !!profile;
  };

  // Fetch property data (supports both /viewdetail/:id and /viewdetail?houseId=...)
  useEffect(() => {
    const fetchPropertyData = async () => {
      const pathId = params?.id;
      const houseIdFromQuery = searchParams.get("houseId");
      const houseId = houseIdFromQuery || pathId;

      // If we got some basic info from the link click, show it immediately
      const q = {
        title: searchParams.get("title"),
        desc: searchParams.get("desc"),
        address: searchParams.get("address"),
        priceText: searchParams.get("priceText"),
        images: searchParams.get("image") ? [searchParams.get("image")] : [],
        owner: searchParams.get("owner"),
        location: searchParams.get("location") || searchParams.get("district"),
        type: searchParams.get("type"),
        area: searchParams.get("area"),
        beds: searchParams.get("beds"),
        baths: searchParams.get("baths"),
        garages: searchParams.get("garages")
      };

      if (q.title) {
        setPropertyData(prev => ({ ...prev, ...q, houseId }));
      }

      if (!houseId) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/properties/${houseId}/view`);
        const data = await res.json();

        if (res.ok && data && data.success) {
          const prop = data.property || {};

          setPropertyData(prev => ({
            ...prev,
            houseId: prop._id || prop.id || prev.houseId,
            title: prop.title || prev.title,
            priceText: prop.priceText || prev.priceText || (prop.price ? `₹${prop.price}` : prev.priceText),
            desc: prop.description || prop.desc || prev.desc,
            address: prop.address || prop.location || prev.address,
            location: prop.state || prop.location || prev.location,
            type: prop.type || prev.type,
            area: prop.area ? `${prop.area} sqft` : prev.area,
            beds: prop.bedrooms ?? prop.beds ?? prev.beds,
            baths: prop.bathrooms ?? prop.baths ?? prev.baths,
            garages: prop.garages ?? prev.garages ?? prev.garages,
            images: prop.images || (prop.image ? [prop.image] : prev.images),
            owner: prop.user?.name || prop.ownerName || prev.owner,
            ownerEmail: prop.user?.email || prop.ownerEmail || prev.ownerEmail,
            userId: prop.user?._id || prop.user || prop.userId || prev.userId,
            status: prop.status || "available",
            buyerName: prop.buyerName || ""
          }));
        } else {
          console.warn("Property fetch returned no data or success=false:", data);
        }
      } catch (error) {
        console.error("Failed to fetch property details:", error);
      }
    };

    fetchPropertyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, params]);

  // Owner stats derived from localStorage "allProperties" (non-blocking)
  useEffect(() => {
    if (!propertyData.owner) return;
    let allProps = getStoredJSON("allProperties", []);
    // avoid mutating stored array permanently
    const snapshot = [...allProps, { owner: propertyData.owner, location: propertyData.location, address: propertyData.address }];
    const owned = snapshot.filter(p => (p.owner || "").toLowerCase() === (propertyData.owner || "").toLowerCase());
    const loc = [...new Set(owned.map(p => p.location).filter(Boolean))];
    setOwnerStats({ totalProperties: owned.length, localities: loc, address: owned[0]?.address || propertyData.address });
  }, [propertyData.owner, propertyData.location, propertyData.address]);

  // Send inquiry
  const handleSendEmail = async (e) => {
    e.preventDefault();

    if (!isUserLoggedIn()) {
      alert("Please login first to send a message to the owner.");
      navigate("/login");
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert("Please fill in your name, email and message first!");
      return;
    }

    const requestPayload = {
      propertyId: propertyData.houseId,
      userId: localStorage.getItem("userId") || null,
      name: formData.name,
      email: formData.email,
      mobile: formData.countryCode || "+91 9876543210",
      requestType: "Inquiry",
      message: formData.message,
      date: new Date().toISOString().split("T")[0],
      time: "N/A"
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload)
      });
      const result = await response.json();

      if (response.ok && result.success) {
        alert("Application Sent! Owner will contact you soon.");
        setFormData({ userType: "individual", reasonToBuy: "", name: "", message: "", countryCode: "+91", email: "" });
      } else {
        alert(`Error: ${result.message || "Failed to send application."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error saving application. Please check your connection.");
    }
  };

  // Request tour
  const handleRequestTour = async () => {
    if (!isUserLoggedIn()) {
      alert("Please login first to schedule a tour.");
      navigate("/login");
      return;
    }

    if (selectedDate === "Select Date" || selectedTime === "Select Time") {
      alert("Please select both a date and a time slot.");
      return;
    }
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Please fill in your name and email in the form above first!");
      return;
    }

    const requestPayload = {
      propertyId: propertyData.houseId,
      userId: localStorage.getItem("userId") || null,
      name: formData.name || loggedUser || "Anonymous",
      email: formData.email || "user@example.com",
      mobile: "+91 9876543210",
      requestType: "Tour",
      message: formData.message || "I would like to schedule a tour.",
      date: selectedDate,
      time: selectedTime
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload)
      });
      const result = await response.json();

      if (response.ok && result.success) {
        alert(`Tour Request Sent for ${selectedDate} at ${selectedTime}! Owner will contact you.`);
        setSelectedDate("Select Date");
        setSelectedTime("Select Time");
        setShowDateMenu(false);
        setShowTimeMenu(false);
        setFormData(f => ({ ...f, name: "", message: "", email: "" }));
      } else {
        alert(`Error: ${result.message || "Failed to schedule tour."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error saving tour request. Please check your connection.");
    }
  };

  const propertyStatus = (propertyData.priceText || "").toLowerCase().includes("/month") || (propertyData.priceText || "").toLowerCase().includes("month") ? "Rent" : "Sale";

  // Defensive render: ensure propertyData exists
  return (
    <div className={/* keep dark class handling minimal to avoid dependency */ ""}>
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 font-sans pb-16">
        <Navbar />

        {/* HERO */}
        <div className="relative w-full h-[50vh] min-h-[400px]">
          <img
            src={propertyData.images?.[0] || "/housescover_copy.jpg"}
            className="hero-image w-full h-full object-cover"
            alt={propertyData.title || "Property"}
            onError={(e) => { e.target.src = "/housescover_copy.jpg"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/40 to-black/60 dark:from-gray-950 dark:via-black/60 dark:to-black/80"></div>

          <div className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0 z-10">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg border border-white/20">
              <i className="ri-arrow-left-line"></i> Back
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { /* keep theme toggle no-op to avoid missing hook */ }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all shadow-lg border border-white/20"
                title="Toggle Theme"
              >
                🌙
              </button>
              <button className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-lg border border-white/20">
                <i className="ri-share-forward-line"></i>
              </button>
              <button className="w-10 h-10 rounded-xl bg-white/10 hover:bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-lg border border-white/20">
                <i className="ri-heart-3-line"></i>
              </button>
            </div>
          </div>

          {/* Image Gallery */}
          {propertyData.images && propertyData.images.length > 1 && (
            <div className="absolute bottom-0 w-full max-w-7xl mx-auto left-0 right-0 p-6 md:p-10 translate-y-6 md:translate-y-12 z-10">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {propertyData.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Property image ${index + 1}`}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                      index === 0 ? 'border-white' : 'border-white/30 hover:border-white'
                    }`}
                    onClick={() => {
                      // Simple click to view (could be enhanced with a modal)
                      const heroImg = document.querySelector('.hero-image');
                      if (heroImg) heroImg.src = img;
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className={`absolute bottom-0 w-full max-w-7xl mx-auto left-0 right-0 p-6 md:p-10 translate-y-6 md:translate-y-12 z-10 ${propertyData.images?.length > 1 ? 'md:translate-y-32' : ''}`}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-600/90 text-white backdrop-blur shadow-sm border border-blue-500/50">
                    For {propertyStatus}
                  </span>
                  {propertyData.status === "sold" ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-red-600 text-white backdrop-blur shadow-lg border border-red-500 flex items-center gap-1 animate-pulse">
                      <i className="ri-checkbox-circle-fill"></i> SOLD
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-white/20 text-white backdrop-blur shadow-sm border border-white/30 truncate max-w-[150px]">
                      {propertyData.type || "Property"}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2">{propertyData.title || "Untitled Property"}</h1>
                <p className="text-gray-200 text-sm md:text-base flex items-center gap-2 drop-shadow">
                  <i className="ri-map-pin-2-fill text-red-500"></i> {propertyData.address || propertyData.location || "Location unavailable"}
                </p>
              </div>
              <div className="md:text-right">
                <p className="text-gray-300 text-sm font-semibold uppercase tracking-wider mb-1">Asking Price</p>
                <div className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
                  <span className="text-green-400">₹</span>{propertyData.priceText ? propertyData.priceText.replace("₹", "") : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24 pb-20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT */}
            <div className="lg:w-2/3 space-y-8">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <i className="ri-dashboard-2-line text-blue-500"></i> Property Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: "ri-hotel-bed-line", label: "Bedrooms", value: propertyData.beds || "N/A", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
                    { icon: "ri-showers-line", label: "Bathrooms", value: propertyData.baths || "N/A", color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
                    { icon: "ri-car-line", label: "Garages", value: propertyData.garages || "N/A", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
                    { icon: "ri-shape-line", label: "Area", value: propertyData.area || "N/A", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" }
                  ].map((stat, idx) => (
                    <div key={idx} className={`flex flex-col p-4 rounded-2xl ${stat.bg} border border-${stat.color.replace("text-", "")}/10`}>
                      <i className={`${stat.icon} ${stat.color} text-2xl mb-2`}></i>
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                      <span className="text-gray-900 dark:text-white font-bold text-lg">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <i className="ri-file-text-line text-blue-500"></i> Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{propertyData.desc || "No detailed description available for this property."}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-indigo-400 dark:from-blue-700 dark:to-indigo-600 rounded-3xl p-6 md:p-8 shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                  <i className="ri-user-star-line text-yellow-400"></i> Meet the Owner
                </h3>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                  <div className="relative">
                    <img src="/image.png" className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-lg" alt="Owner" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-indigo-600 rounded-full"></div>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-2xl font-bold text-white mb-1">{propertyData.owner}</h4>
                    <p className="text-blue-200 dark:text-blue-200 text-sm mb-4">Property Owner · {ownerStats.totalProperties} Listings</p>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                        <div className="w-10 h-10 rounded-full bg-blue-500/50 dark:bg-blue-500/50 flex items-center justify-center">
                          <i className="ri-mail-send-line text-xl"></i>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-xs text-blue-200 dark:text-blue-200 uppercase tracking-widest font-semibold">Email Address</p>
                          {!emailVisible ? (
                            <button onClick={() => setEmailVisible(true)} className="text-sm font-bold text-white hover:text-blue-200 dark:hover:text-blue-200 transition-colors">Click to reveal</button>
                          ) : (
                            <span className="text-sm font-bold text-white whitespace-normal break-all">{propertyData.ownerEmail || "Email not provided"}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-blue-100 dark:text-blue-100">
                        <span className="bg-black/20 px-3 py-1.5 rounded-full"><i className="ri-map-pin-line"></i> {ownerStats.address || "Location not provided"}</span>
                        <span className="bg-black/20 px-3 py-1.5 rounded-full"><i className="ri-building-line"></i> Active in {ownerStats.localities.length || 1} localities</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:w-1/3">
              <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Interested?</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Proceed to payment or send a direct message.</p>
                </div>

                <div className="mb-8">
                  {propertyData.status === "sold" ? (
                    <div className="w-full bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
                      <i className="ri-error-warning-line text-4xl text-gray-400 mb-2 block"></i>
                      <p className="text-gray-900 dark:text-white font-bold text-lg">Listing No Longer Available</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        This property has been sold to {propertyData.buyerName || "another user"}.
                      </p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          if (!isUserLoggedIn()) {
                            alert("Please login first to proceed with the transaction.");
                            navigate("/login");
                            return;
                          }

                          const currentUserId = localStorage.getItem("userId");
                          const storedUser = getStoredJSON("user", null);
                          const currentEmail = storedUser?.email || "";

                          // Only check ownership if we have the property's owner data from the backend
                          if (!propertyData.userId && !propertyData.ownerEmail) {
                             // Data might still be loading or fetch failed
                             console.warn("Owner data not yet loaded, skipping strict check");
                          } else {
                            // Strict ownership check
                            const isOwner =
                              (propertyData.userId && currentUserId && String(propertyData.userId) === String(currentUserId)) ||
                              (propertyData.ownerEmail && currentEmail && String(propertyData.ownerEmail).toLowerCase() === String(currentEmail).toLowerCase());

                            if (isOwner) {
                              alert("Hold on! You are the owner of this property. You cannot buy or rent your own listing.");
                              return;
                            }
                          }

                          navigate(`/property-payment/${propertyData.houseId}`, { state: { propertyData } });
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <i className="ri-secure-payment-line text-2xl"></i>
                        {propertyStatus === "Rent" ? "Rent Now" : "Buy Now"}
                      </button>
                      <p className="text-center text-xs text-gray-400 mt-2 font-medium">Secure Checkout • EMI Available</p>
                    </>
                  )}
                </div>

                <div className="relative flex items-center py-2 mb-6">
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">OR CONTACT OWNER</span>
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                </div>

                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div className="flex justify-center bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                    {["individual", "dealer"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: type })}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all capitalize ${formData.userType === type ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <input type="text" placeholder="Your Full Name *" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white outline-none transition-all" />
                    <input type="email" placeholder="Your Email Address *" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white outline-none transition-all" />
                    <textarea placeholder="I am interested in this property..." required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full h-28 resize-none bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white outline-none transition-all"></textarea>
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
                    <i className="ri-send-plane-fill"></i> Send Message
                  </button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">OR SCHEDULE</span>
                    <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                  </div>

                  <div className="flex gap-2 relative">
                    <div className="relative flex-1">
                      <button type="button" onClick={() => setShowDateMenu(!showDateMenu)} className={`w-full flex items-center justify-between px-3 py-3 rounded-xl border text-sm transition-all text-left ${selectedDate === "Select Date" ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500" : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 font-semibold"}`}>
                        <span className="truncate">{selectedDate}</span>
                        <i className={`ri-arrow-down-s-line transition-transform ${showDateMenu ? "rotate-180" : ""}`}></i>
                      </button>

                      {showDateMenu && (
                        <div className="absolute top-full mt-2 left-0 w-full z-20 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1">
                          {DATE_OPTIONS.map((opt) => (
                            <div key={opt} onClick={() => { setSelectedDate(opt); setShowDateMenu(false); setSelectedTime("Select Time"); }} className="px-4 py-2 text-sm hover:bg-green-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200">
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative flex-1">
                      <button type="button" onClick={() => selectedDate !== "Select Date" && setShowTimeMenu(!showTimeMenu)} disabled={selectedDate === "Select Date"} className={`w-full flex items-center justify-between px-3 py-3 rounded-xl border text-sm transition-all text-left ${selectedDate === "Select Date" ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400" : selectedTime === "Select Time" ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500" : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 font-semibold"}`}>
                        <span className="truncate">{selectedTime}</span>
                        <i className={`ri-arrow-down-s-line transition-transform ${showTimeMenu ? "rotate-180" : ""}`}></i>
                      </button>

                      {showTimeMenu && selectedDate !== "Select Date" && (
                        <div className="absolute top-full mt-2 left-0 w-full z-20 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1">
                          {TIME_OPTIONS.map((opt) => (
                            <div key={opt} onClick={() => { setSelectedTime(opt); setShowTimeMenu(false); }} className="px-4 py-2 text-sm hover:bg-green-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200">
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedDate !== "Select Date" && selectedTime !== "Select Time" && (
                    <button type="button" onClick={handleRequestTour} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2 animate-fade-in-up">
                      <i className="ri-calendar-event-fill"></i> Confirm Tour Request
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
