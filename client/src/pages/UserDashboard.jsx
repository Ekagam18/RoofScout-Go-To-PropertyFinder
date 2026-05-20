// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Link } from 'react-router-dom';
// import { supabase } from "../supabase";
// import useDarkMode from "../hooks/useDarkMode";

// function UserDashboard() {
//   const [loggedUser, setLoggedUser] = useState('');
//   const [activeTab, setActiveTab] = useState('appliedHouses');
//   const [userProfile, setUserProfile] = useState(null);
//   const [tourRequests, setTourRequests] = useState([]);
//   const [properties, setProperties] = useState([]);
//   const [loadingProperties, setLoadingProperties] = useState(true);
//   const [userId, setUserId] = useState(null);

//   const navigate = useNavigate();
//   const { theme, toggleTheme } = useDarkMode(); // <-- fixed: use toggleTheme

//   const getStoredJSON = (key, defaultVal = null) => {
//     try {
//       const item = localStorage.getItem(key);
//       return item ? JSON.parse(item) : defaultVal;
//     } catch (error) {
//       console.error(`Error parsing JSON from localStorage key "${key}":`, error);
//       return defaultVal;
//     }
//   };

//   useEffect(() => {
//     async function loadUser() {
//       // 1️⃣ Get Supabase session
//       const { data: sessionData } = await supabase.auth.getSession();
//       const session = sessionData.session;

//       if (!session?.user) {
//         navigate("/login");
//         return;
//       }

//       const userId = session.user.id;
//       setUserId(userId);

//       // 2️⃣ Fetch username from Supabase username table
//       const { data: usernameData } = await supabase
//         .from("username")
//         .select("username")
//         .eq("id", userId)
//         .single();

//       const fetchedUsername = usernameData?.username || "";

//       // 3️⃣ Load profile from localstorage (your original logic)
//       const savedProfile = getStoredJSON("userProfile");
//       const savedImage = localStorage.getItem("userProfileImage");

//       if (savedProfile) {
//         setUserProfile({
//           ...savedProfile,
//           image: savedImage,
//           name: savedProfile.name || fetchedUsername,
//         });
//       } else {
//         setUserProfile({
//           name: fetchedUsername,
//           email: session.user.email,
//           phone: "",
//           address: "",
//           image: savedImage,
//         });
//       }

//       setLoggedUser(fetchedUsername);
//     }

//     loadUser();
//   }, [navigate]);

//   useEffect(() => {
//     async function fetchProperties() {
//       if (!userId) return; // <-- guard with userId

//       const { data, error } = await supabase
//         .from("properties")
//         .select("*")
//         .eq("owner_id", userId);

//       if (error) {
//         console.log("Error fetching properties:", error);
//         setProperties([]);
//       } else {
//         setProperties(data || []);
//       }

//       setLoadingProperties(false);
//     }

//     fetchProperties();
//   }, [userId]); // <-- depend on userId (not loggedUser)

//   const handleLogout = async () => {
//     try {
//       const { error } = await supabase.auth.signOut();

//       if (error) {
//         console.log("Logout error:", error.message);
//         return;
//       }

//       // 🔥 Notify Navbar to clear username
//       window.dispatchEvent(new Event("usernameUpdated"));

//       console.log("Logged out successfully");
//       navigate("/login", { replace: true });

//     } catch (err) {
//       console.log("Unexpected logout error:", err);
//     }
//   };

//   const handleTourRequestStatus = (requestId, newStatus) => {
//     const updatedRequests = tourRequests.map(req =>
//       req.id === requestId ? { ...req, status: newStatus } : req
//     );
//     setTourRequests(updatedRequests);
//     localStorage.setItem('allTourRequests', JSON.stringify(updatedRequests));
//   };

//   // --- OWNER VIEW (Properties I listed) ---
//   const displayUserProperties = () => {
//     if (loadingProperties) {
//       return (
//         <p className="text-center text-gray-500 mt-4">
//           Loading your properties...
//         </p>
//       );
//     }

//     if (!properties || properties.length === 0) {
//       return (
//         <div className="text-center py-12">
//           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 mb-4">
//             <i className="ri-home-3-line text-4xl text-blue-400"></i>
//           </div>
//           <p className="text-gray-500 text-lg">You haven't listed any properties yet.</p>
//           <p className="text-gray-400 text-sm mt-2">Start listing to manage your properties here</p>
//         </div>
//       );
//     }

//     return (
//       <div className="grid grid-cols-1 gap-6">
//         {properties.map(property => {
//           const iconClass =
//             property.type === "PG"
//               ? "ri-hotel-bed-line"
//               : property.type === "Rent"
//                 ? "ri-building-2-line"
//                 : "ri-home-sale-line";

//           return (
//             <div
//               key={property.id}
//               className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//             >
//               <div className="p-6">
//                 <div className="flex flex-col sm:flex-row gap-5 items-start">
//                   <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
//                     <i className={`${iconClass} text-4xl`}></i>
//                   </div>

//                   <div className="flex-grow">
//                     <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">{property.title}</h4>

//                     <p className="text-gray-600 dark:text-gray-300 mt-1">
//                       <strong>Type:</strong> {property.type}
//                     </p>

//                     <p className="text-gray-600 dark:text-gray-300 mt-1">
//                       <strong>Location:</strong> {property.location}
//                     </p>

//                     <p className="text-gray-700 dark:text-gray-200 font-semibold mt-2">
//                       Price: ₹{property.price}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     );
//   };


//   // --- BUYER VIEW (My Requests & Applications) ---
//   const displayAppliedProperties = () => {
//     const appliedProperties = getStoredJSON('appliedProperties', []);
//     const myTourRequests = tourRequests.filter(req => req.buyerName === loggedUser);

//     if (appliedProperties.length === 0 && myTourRequests.length === 0) {
//       return (
//         <div className="text-center py-12">
//           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 mb-4">
//             <i className="ri-building-line text-4xl text-purple-400"></i>
//           </div>
//           <p className="text-gray-500 text-lg">You haven't applied for any houses or requested tours yet.</p>
//           <p className="text-gray-400 text-sm mt-2">Start exploring properties to see them here</p>
//         </div>
//       );
//     }

//     return (
//       <div className="space-y-8">
//         {/* 1. Show My Tour Requests */}
//         {myTourRequests.length > 0 && (
//           <div>
//             <div className="flex items-center gap-3 mb-5">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
//                 <i className="ri-walk-line text-white text-xl"></i>
//               </div>
//               <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">My Tour Requests</h4>
//               <span className="ml-auto text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-3 py-1 rounded-full font-semibold">
//                 {myTourRequests.length} {myTourRequests.length === 1 ? 'Request' : 'Requests'}
//               </span>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {myTourRequests.map(req => (
//                 <div key={req.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
//                   <div className="flex gap-4 items-start">
//                     <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md">
//                       <i className="ri-calendar-event-line text-3xl"></i>
//                     </div>
//                     <div className="flex-grow">
//                       <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">Tour Scheduled</h4>
//                       <div className="space-y-2">
//                         <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
//                           <i className="ri-calendar-line text-purple-500"></i>
//                           <span className="font-semibold">{req.tourDate}</span>
//                         </p>
//                         <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
//                           <i className="ri-time-line text-pink-500"></i>
//                           <span className="font-semibold">{req.tourTime}</span>
//                         </p>
//                       </div>
//                       <div className="mt-3">
//                         <span className={`inline-block text-xs font-bold px-4 py-2 rounded-lg shadow-sm ${
//                           req.status === 'Approved' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
//                           req.status === 'Rejected' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
//                           'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
//                         }`}>
//                           {req.status}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* 2. Show My Payment Applications */}
//         {appliedProperties.length > 0 && (
//           <div>
//             {myTourRequests.length > 0 && (
//               <div className="flex items-center gap-3 mb-5 mt-8">
//                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
//                   <i className="ri-file-list-3-line text-white text-xl"></i>
//                 </div>
//                 <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">Rental Applications</h4>
//                 <span className="ml-auto text-sm text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-semibold">
//                   {appliedProperties.length} {appliedProperties.length === 1 ? 'Application' : 'Applications'}
//                 </span>
//               </div>
//             )}
//             <div className="grid grid-cols-1 gap-5">
//               {appliedProperties.map((application, index) => (
//                 <div key={application.id || index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
//                   <div className="p-6">
//                     <div className="flex flex-col sm:flex-row gap-5 items-start">
//                       <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg transform transition-transform duration-300 hover:scale-110 hover:rotate-3">
//                         <i className="ri-building-2-line text-4xl"></i>
//                       </div>
//                       <div className="flex-grow">
//                         <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">{application.title || 'Property Application'}</h4>
//                         <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-4">
//                           <i className="ri-calendar-check-line text-green-500"></i>
//                           Applied on: <span className="font-semibold">{application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}</span>
//                         </p>
//                         <div className="flex flex-wrap items-center gap-3">
//                           <span className={`text-xs font-bold px-4 py-2 rounded-lg shadow-sm ${
//                             application.status === 'Approved' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
//                             application.status === 'Paid' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white' :
//                             application.status === 'Rejected' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
//                             application.status === 'Viewed' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' :
//                             'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
//                           }`}>
//                             {application.status || 'Pending'}
//                           </span>
//                           {application.status === 'Approved' && (
//                             <Link 
//                               to={`/payment/${application.id}`} 
//                               className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
//                             >
//                               <i className="ri-secure-payment-line"></i>
//                               Pay Now
//                             </Link>
//                           )}
//                           {application.status === 'Paid' && (
//                             <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-2 rounded-xl border border-cyan-200">
//                               <i className="ri-checkbox-circle-fill text-cyan-600 text-lg"></i>
//                               <span className="text-sm font-bold text-cyan-700">Payment Complete</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className={theme === "dark" ? "dark" : ""}>
//       <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-sans min-h-screen dark:from-gray-900 dark:via-gray-950 dark:to-black">
//         <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
//           <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//             <div className="flex items-center text-xl font-bold">
//               <h1 className="font-extrabold text-3xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mr-1">
//                 <Link to="/">Roof</Link>
//               </h1>
//               <h1 className="font-extrabold text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 <Link to="/">Scout</Link>
//               </h1>
//             </div>
//             <div className="flex items-center space-x-4">

//               <button
//                 onClick={toggleTheme}
//                 className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl font-semibold transition"
//               >
//                 {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
//               </button>

//               <button
//                 type="button"
//                 onClick={handleLogout}
//                 className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl text-sm transition-all duration-200 font-bold hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
//               >
//                 <i className="ri-logout-box-r-line"></i>
//                 Logout
//               </button>

//             </div>
//           </nav>
//         </header>

//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           {/* User Profile Section */}
//           <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
//             <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
//               <div className="relative">
//                 <div className="w-36 h-36 md:w-52 md:h-52 rounded-2xl overflow-hidden border-4 border-white shadow-2xl flex-shrink-0 transition-transform duration-300 hover:scale-105 ring-4 ring-blue-100">
//                   <img
//                     src={userProfile?.image || `https://avatar.iran.liara.run/public/boy?username=${loggedUser}`}
//                     alt="User Profile"
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
//                   <i className="ri-check-line text-white text-2xl font-bold"></i>
//                 </div>
//               </div>
//               <div className="flex-grow text-center md:text-left">
//                 <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">{userProfile?.name || loggedUser || 'User Name'}</h2>
//                 <p className="text-gray-500 dark:text-gray-400 text-base mb-6 flex items-center justify-center md:justify-start gap-2">
//                   <i className="ri-map-pin-line text-red-500"></i>
//                   {userProfile?.address || 'Address details will appear here.'}
//                 </p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
//                   <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-phone-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Phone</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">{userProfile?.phone || 'Not Available'}</span>
//                   </div>
//                   <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-smartphone-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Mobile</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">{userProfile?.phone || 'Not Available'}</span>
//                   </div>
//                   <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-mail-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Email</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13 truncate">{userProfile?.email || 'Not Available'}</span>
//                   </div>
//                   <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-2xl border border-orange-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-lock-password-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Password</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">••••••••</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
//             <div className="flex flex-wrap bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
//               <button
//                 onClick={() => setActiveTab('appliedHouses')}
//                 className={`flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm ${
//                   activeTab === 'appliedHouses' 
//                     ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600' 
//                     : ''
//                 }`}
//               >
//                 <span className="flex items-center justify-center gap-2">
//                   <i className="ri-home-heart-line"></i>
//                   Applied Houses
//                 </span>
//               </button>
//               <button
//                 onClick={() => setActiveTab('properties')}
//                 className={`flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm ${
//                   activeTab === 'properties' 
//                     ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600' 
//                     : ''
//                 }`}
//               >
//                 <span className="flex items-center justify-center gap-2">
//                   <i className="ri-building-4-line"></i>
//                   My Properties
//                 </span>
//               </button>
//               <Link
//                 to="/user-profile"
//                 className="flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
//               >
//                 <i className="ri-user-settings-line"></i>
//                 Edit Profile
//               </Link>
//             </div>

//             <div className="p-6">
//               {activeTab === 'appliedHouses' && (
//                 <div>
//                   <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Dashboard</h3>
//                   {displayAppliedProperties()}
//                 </div>
//               )}
//               {activeTab === 'properties' && (
//                 <div>
//                   <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Listed Properties</h3>
//                   {displayUserProperties()}
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// export default UserDashboard;



// 2nd code
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Link } from 'react-router-dom';
// import { supabase } from "../supabase";
// import useDarkMode from "../hooks/useDarkMode";

// // Define possible tabs for clarity
// const TABS = {
//     APPLIED_HOUSES: 'appliedHouses', // Buyer's applications/requests
//     MY_PROPERTIES: 'properties',      // Owner's listed properties
//     TOUR_REQUESTS_RECEIVED: 'tourRequestsReceived', // Owner's received tour requests
//     EDIT_PROFILE: 'editProfile', // A virtual tab for navigation
// };

// function UserDashboard() {
//   const [loggedUser, setLoggedUser] = useState('');
//   // Initialize with a known tab constant
//   const [activeTab, setActiveTab] = useState(TABS.APPLIED_HOUSES); 
//   const [userProfile, setUserProfile] = useState(null);
//   // Separate state for owner's received requests vs. buyer's sent requests (using local storage as before)
//   const [receivedTourRequests, setReceivedTourRequests] = useState([]); 
//   const [properties, setProperties] = useState([]);
//   const [loadingProperties, setLoadingProperties] = useState(true);
//   const [loadingRequests, setLoadingRequests] = useState(false);
//   const [userId, setUserId] = useState(null);

//   const navigate = useNavigate();
//   const { theme, toggleTheme } = useDarkMode();

//   const getStoredJSON = (key, defaultVal = null) => {
//     try {
//       const item = localStorage.getItem(key);
//       return item ? JSON.parse(item) : defaultVal;
//     } catch (error) {
//       console.error(`Error parsing JSON from localStorage key "${key}":`, error);
//       return defaultVal;
//     }
//   };

//   // --- Initial User & Profile Load (Supabase + LocalStorage) ---
//   useEffect(() => {
//     async function loadUser() {
//       const { data: sessionData } = await supabase.auth.getSession();
//       const session = sessionData.session;

//       if (!session?.user) {
//         navigate("/login");
//         return;
//       }

//       const currentUserId = session.user.id;
//       setUserId(currentUserId);

//       const { data: usernameData } = await supabase
//         .from("username")
//         .select("username")
//         .eq("id", currentUserId)
//         .single();

//       const fetchedUsername = usernameData?.username || "";
//       const savedProfile = getStoredJSON("userProfile");
//       const savedImage = localStorage.getItem("userProfileImage");

//       const profileData = savedProfile ? {
//           ...savedProfile,
//           image: savedImage,
//           name: savedProfile.name || fetchedUsername,
//         } : {
//           name: fetchedUsername,
//           email: session.user.email,
//           phone: "",
//           address: "",
//           image: savedImage,
//         };

//       setUserProfile(profileData);
//       setLoggedUser(fetchedUsername);
//     }

//     loadUser();
//   }, [navigate]);

//   // --- Fetch Properties for Owner (Depends on userId) ---
//   useEffect(() => {
//     async function fetchProperties() {
//       if (!userId) return;

//       setLoadingProperties(true);
//       const { data, error } = await supabase
//         .from("properties")
//         .select("id, title, type, location, price, owner_id") // Ensure necessary fields are selected
//         .eq("owner_id", userId);

//       if (error) {
//         console.error("Error fetching properties:", error);
//         setProperties([]);
//       } else {
//         setProperties(data || []);
//       }

//       setLoadingProperties(false);
//     }

//     fetchProperties();
//   }, [userId]);

//   // --- Fetch Tour Requests RECEIVED for Owner (Depends on properties) ---
//   useEffect(() => {
//     async function fetchTourRequests() {
//       // Only fetch if properties are loaded and we are not loading.
//       if (!properties.length || loadingProperties) return; 

//       setLoadingRequests(true);

//       // Get IDs of all listed properties
//       const propertyIds = properties.map(p => p.id);

//       // Fetch tour requests where property_id is one of the user's property IDs
//       const { data, error } = await supabase
//         .from("tour_requests")
//         .select(`
//           id, 
//           tourDate, 
//           tourTime, 
//           status, 
//           buyerName, 
//           property_id,
//           properties(title) // Join to get property title
//         `)
//         .in("property_id", propertyIds); // Filter by the owner's property IDs

//       if (error) {
//         console.error("Error fetching tour requests:", error);
//         setReceivedTourRequests([]);
//       } else {
//         setReceivedTourRequests(data || []);
//       }
//       setLoadingRequests(false);
//     }

//     // Only run this when properties change and userId is available (which implies properties fetch is done)
//     if(userId) {
//         fetchTourRequests();
//     }
//   }, [properties, userId, loadingProperties]);


//   // --- Logout Handler ---
//   const handleLogout = async () => {
//     try {
//       const { error } = await supabase.auth.signOut();

//       if (error) {
//         console.error("Logout error:", error.message);
//         return;
//       }

//       // Notify Navbar to clear username/state
//       window.dispatchEvent(new Event("usernameUpdated"));

//       console.log("Logged out successfully");
//       navigate("/login", { replace: true });

//     } catch (err) {
//       console.error("Unexpected logout error:", err);
//     }
//   };

//   // --- Tour Request Status Handler (Now also updates Supabase for owner requests) ---
//   const handleTourRequestStatus = async (requestId, newStatus) => {
//     try {
//         // 1. Update Supabase
//         const { error } = await supabase
//             .from('tour_requests')
//             .update({ status: newStatus })
//             .eq('id', requestId);

//         if (error) {
//             console.error("Error updating tour request status:", error);
//             return;
//         }

//         // 2. Update local state
//         setReceivedTourRequests(prevRequests => 
//             prevRequests.map(req =>
//                 req.id === requestId ? { ...req, status: newStatus } : req
//             )
//         );

//         console.log(`Request ${requestId} status updated to ${newStatus}`);

//     } catch (err) {
//         console.error("Failed to update tour request status:", err);
//     }
//   };


//   // --- RENDER FUNCTIONS ---

//   // --- OWNER VIEW (Tour Requests I received) ---
//   const displayOwnerTourRequests = () => {
//     if (loadingRequests) {
//         return (
//             <p className="text-center text-gray-500 mt-4">
//                 Loading tour requests for your properties...
//             </p>
//         );
//     }

//     if (!receivedTourRequests || receivedTourRequests.length === 0) {
//         return (
//             <div className="text-center py-12">
//                 <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-50 mb-4">
//                     <i className="ri-calendar-todo-line text-4xl text-red-400"></i>
//                 </div>
//                 <p className="text-gray-500 text-lg">You have no pending or past tour requests for your properties.</p>
//                 <p className="text-gray-400 text-sm mt-2">Requests will appear here once buyers schedule a tour.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {receivedTourRequests.map(req => {
//                 const statusColor = 
//                     req.status === 'Approved' ? 'bg-green-500' :
//                     req.status === 'Rejected' ? 'bg-red-500' : 
//                     'bg-yellow-500';

//                 return (
//                     <div 
//                         key={req.id} 
//                         className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
//                     >
//                         <div className="flex justify-between items-start mb-3">
//                             <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
//                                 Tour for: {req.properties?.title || `Property ID: ${req.property_id}`}
//                             </h4>
//                             <span className={`px-3 py-1 text-xs font-bold text-white rounded-full ${statusColor}`}>
//                                 {req.status}
//                             </span>
//                         </div>
//                         <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
//                             Requested by: <span className="font-semibold text-gray-800 dark:text-gray-200">{req.buyerName}</span>
//                         </p>
//                         <div className="flex flex-wrap items-center gap-4 text-sm">
//                             <p className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
//                                 <i className="ri-calendar-line text-blue-500"></i>
//                                 {req.tourDate}
//                             </p>
//                             <p className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
//                                 <i className="ri-time-line text-purple-500"></i>
//                                 {req.tourTime}
//                             </p>
//                         </div>

//                         {/* Action Buttons */}
//                         {req.status === 'Pending' && (
//                             <div className="mt-4 flex gap-3">
//                                 <button
//                                     onClick={() => handleTourRequestStatus(req.id, 'Approved')}
//                                     className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
//                                 >
//                                     Approve
//                                 </button>
//                                 <button
//                                     onClick={() => handleTourRequestStatus(req.id, 'Rejected')}
//                                     className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
//                                 >
//                                     Reject
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 );
//             })}
//         </div>
//     );
//   };


//   // --- OWNER VIEW (Properties I listed) - No change to logic, just cleaner dependency removal ---
//   const displayUserProperties = () => {
//     if (loadingProperties) {
//       return (
//         <p className="text-center text-gray-500 mt-4">
//           Loading your properties...
//         </p>
//       );
//     }

//     if (!properties || properties.length === 0) {
//         return (
//             <div className="text-center py-12">
//                 <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 mb-4">
//                     <i className="ri-home-3-line text-4xl text-blue-400"></i>
//                 </div>
//                 <p className="text-gray-500 text-lg">You haven't listed any properties yet.</p>
//                 <p className="text-gray-400 text-sm mt-2">Start listing to manage your properties here</p>
//             </div>
//         );
//     }

//     return (
//       <div className="grid grid-cols-1 gap-6">
//         {properties.map(property => {
//           const iconClass =
//             property.type === "PG"
//               ? "ri-hotel-bed-line"
//               : property.type === "Rent"
//                 ? "ri-building-2-line"
//                 : "ri-home-sale-line";

//           return (
//             <div
//               key={property.id}
//               className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//             >
//               <div className="p-6">
//                 <div className="flex flex-col sm:flex-row gap-5 items-start">
//                   <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
//                     <i className={`${iconClass} text-4xl`}></i>
//                   </div>

//                   <div className="flex-grow">
//                     <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">{property.title}</h4>

//                     <p className="text-gray-600 dark:text-gray-300 mt-1">
//                       <strong>Type:</strong> {property.type}
//                     </p>

//                     <p className="text-gray-600 dark:text-gray-300 mt-1">
//                       <strong>Location:</strong> {property.location}
//                     </p>

//                     <p className="text-gray-700 dark:text-gray-200 font-semibold mt-2">
//                       Price: ₹{property.price}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     );
//   };


//   // --- BUYER VIEW (My Requests & Applications) - Using local storage 'allTourRequests' as per original code ---
//   const displayAppliedProperties = () => {
//     const appliedProperties = getStoredJSON('appliedProperties', []);
//     // Re-use the buyer's requests logic from the original implementation (still relying on localStorage)
//     const allTourRequests = getStoredJSON('allTourRequests', []); 
//     const myTourRequests = allTourRequests.filter(req => req.buyerName === loggedUser);

//     if (appliedProperties.length === 0 && myTourRequests.length === 0) {
//       return (
//         <div className="text-center py-12">
//           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 mb-4">
//             <i className="ri-building-line text-4xl text-purple-400"></i>
//           </div>
//           <p className="text-gray-500 text-lg">You haven't applied for any houses or requested tours yet.</p>
//           <p className="text-gray-400 text-sm mt-2">Start exploring properties to see them here</p>
//         </div>
//       );
//     }

//     return (
//       <div className="space-y-8">
//         {/* 1. Show My Tour Requests */}
//         {myTourRequests.length > 0 && (
//           <div>
//             <div className="flex items-center gap-3 mb-5">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
//                 <i className="ri-walk-line text-white text-xl"></i>
//               </div>
//               <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">My Tour Requests</h4>
//               <span className="ml-auto text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-3 py-1 rounded-full font-semibold">
//                 {myTourRequests.length} {myTourRequests.length === 1 ? 'Request' : 'Requests'}
//               </span>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {myTourRequests.map(req => (
//                 <div key={req.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
//                   <div className="flex gap-4 items-start">
//                     <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md">
//                       <i className="ri-calendar-event-line text-3xl"></i>
//                     </div>
//                     <div className="flex-grow">
//                       <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">Tour Scheduled</h4>
//                       <div className="space-y-2">
//                         <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
//                           <i className="ri-calendar-line text-purple-500"></i>
//                           <span className="font-semibold">{req.tourDate}</span>
//                         </p>
//                         <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
//                           <i className="ri-time-line text-pink-500"></i>
//                           <span className="font-semibold">{req.tourTime}</span>
//                         </p>
//                       </div>
//                       <div className="mt-3">
//                         <span className={`inline-block text-xs font-bold px-4 py-2 rounded-lg shadow-sm ${
//                           req.status === 'Approved' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
//                           req.status === 'Rejected' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
//                           'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
//                         }`}>
//                           {req.status}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* 2. Show My Payment Applications (Unchanged) */}
//         {appliedProperties.length > 0 && (
//           <div>
//             {myTourRequests.length > 0 && (
//               <div className="flex items-center gap-3 mb-5 mt-8">
//                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
//                   <i className="ri-file-list-3-line text-white text-xl"></i>
//                 </div>
//                 <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">Rental Applications</h4>
//                 <span className="ml-auto text-sm text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-semibold">
//                   {appliedProperties.length} {appliedProperties.length === 1 ? 'Application' : 'Applications'}
//                 </span>
//               </div>
//             )}
//             <div className="grid grid-cols-1 gap-5">
//               {appliedProperties.map((application, index) => (
//                 <div key={application.id || index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
//                   <div className="p-6">
//                     <div className="flex flex-col sm:flex-row gap-5 items-start">
//                       <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg transform transition-transform duration-300 hover:scale-110 hover:rotate-3">
//                         <i className="ri-building-2-line text-4xl"></i>
//                       </div>
//                       <div className="flex-grow">
//                         <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">{application.title || 'Property Application'}</h4>
//                         <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-4">
//                           <i className="ri-calendar-check-line text-green-500"></i>
//                           Applied on: <span className="font-semibold">{application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}</span>
//                         </p>
//                         <div className="flex flex-wrap items-center gap-3">
//                           <span className={`text-xs font-bold px-4 py-2 rounded-lg shadow-sm ${
//                             application.status === 'Approved' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
//                             application.status === 'Paid' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white' :
//                             application.status === 'Rejected' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
//                             application.status === 'Viewed' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' :
//                             'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
//                           }`}>
//                             {application.status || 'Pending'}
//                           </span>
//                           {application.status === 'Approved' && (
//                             <Link 
//                               to={`/payment/${application.id}`} 
//                               className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
//                             >
//                               <i className="ri-secure-payment-line"></i>
//                               Pay Now
//                             </Link>
//                           )}
//                           {application.status === 'Paid' && (
//                             <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-2 rounded-xl border border-cyan-200">
//                               <i className="ri-checkbox-circle-fill text-cyan-600 text-lg"></i>
//                               <span className="text-sm font-bold text-cyan-700">Payment Complete</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className={theme === "dark" ? "dark" : ""}>
//       <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-sans min-h-screen dark:from-gray-900 dark:via-gray-950 dark:to-black">
//         <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
//           <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//             <div className="flex items-center text-xl font-bold">
//               <h1 className="font-extrabold text-3xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mr-1">
//                 <Link to="/">Roof</Link>
//               </h1>
//               <h1 className="font-extrabold text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 <Link to="/">Scout</Link>
//               </h1>
//             </div>
//             <div className="flex items-center space-x-4">

//               <button
//                 onClick={toggleTheme}
//                 className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl font-semibold transition"
//               >
//                 {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
//               </button>

//               <button
//                 type="button"
//                 onClick={handleLogout}
//                 className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl text-sm transition-all duration-200 font-bold hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
//               >
//                 <i className="ri-logout-box-r-line"></i>
//                 Logout
//               </button>

//             </div>
//           </nav>
//         </header>

//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           {/* User Profile Section (Unchanged) */}
//           <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
//             <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
//               <div className="relative">
//                 <div className="w-36 h-36 md:w-52 md:h-52 rounded-2xl overflow-hidden border-4 border-white shadow-2xl flex-shrink-0 transition-transform duration-300 hover:scale-105 ring-4 ring-blue-100">
//                   <img
//                     src={userProfile?.image || `https://avatar.iran.liara.run/public/boy?username=${loggedUser}`}
//                     alt="User Profile"
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
//                   <i className="ri-check-line text-white text-2xl font-bold"></i>
//                 </div>
//               </div>
//               <div className="flex-grow text-center md:text-left">
//                 <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">{userProfile?.name || loggedUser || 'User Name'}</h2>
//                 <p className="text-gray-500 dark:text-gray-400 text-base mb-6 flex items-center justify-center md:justify-start gap-2">
//                   <i className="ri-map-pin-line text-red-500"></i>
//                   {userProfile?.address || 'Address details will appear here.'}
//                 </p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
//                   <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-phone-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Phone</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">{userProfile?.phone || 'Not Available'}</span>
//                   </div>
//                   <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-smartphone-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Mobile</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">{userProfile?.phone || 'Not Available'}</span>
//                   </div>
//                   <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-mail-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Email</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13 truncate">{userProfile?.email || 'Not Available'}</span>
//                   </div>
//                   <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-2xl border border-orange-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-lock-password-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Password</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">••••••••</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
//             {/* Tabs Navigation */}
//             <div className="flex flex-wrap bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
//               <button
//                 onClick={() => setActiveTab(TABS.APPLIED_HOUSES)}
//                 className={`flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm ${
//                   activeTab === TABS.APPLIED_HOUSES 
//                     ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600' 
//                     : ''
//                 }`}
//               >
//                 <span className="flex items-center justify-center gap-2">
//                   <i className="ri-home-heart-line"></i>
//                   Applied Houses
//                 </span>
//               </button>

//               <button
//                 onClick={() => setActiveTab(TABS.MY_PROPERTIES)}
//                 className={`flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm ${
//                   activeTab === TABS.MY_PROPERTIES 
//                     ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600' 
//                     : ''
//                 }`}
//               >
//                 <span className="flex items-center justify-center gap-2">
//                   <i className="ri-building-4-line"></i>
//                   My Properties
//                 </span>
//               </button>

//               {/* NEW TAB: Tour Requests Received (Owner View) */}
//               <button
//                 onClick={() => setActiveTab(TABS.TOUR_REQUESTS_RECEIVED)}
//                 className={`flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm ${
//                   activeTab === TABS.TOUR_REQUESTS_RECEIVED 
//                     ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600' 
//                     : ''
//                 }`}
//               >
//                 <span className="flex items-center justify-center gap-2">
//                   <i className="ri-calendar-check-line"></i>
//                   Tour Requests ({receivedTourRequests.length})
//                 </span>
//               </button>

//               <Link
//                 to="/user-profile"
//                 className="flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
//               >
//                 <i className="ri-user-settings-line"></i>
//                 Edit Profile
//               </Link>
//             </div>

//             {/* Tab Content */}
//             <div className="p-6">
//               {activeTab === TABS.APPLIED_HOUSES && (
//                 <div>
//                   <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Applications & Sent Tours</h3>
//                   {displayAppliedProperties()}
//                 </div>
//               )}

//               {activeTab === TABS.MY_PROPERTIES && (
//                 <div>
//                   <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Listed Properties</h3>
//                   {displayUserProperties()}
//                 </div>
//               )}

//               {activeTab === TABS.TOUR_REQUESTS_RECEIVED && (
//                 <div>
//                   <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Tour Requests Received for Your Listings</h3>
//                   {displayOwnerTourRequests()}
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// export default UserDashboard;


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import API, { getUserProperties, updateProperty, deleteProperty } from "../api";
import { useTheme } from "../hooks/useTheme";

// Define possible tabs for clarity
const TABS = {
    APPLIED_HOUSES: 'appliedHouses', // Buyer's applications/requests
    MY_PROPERTIES: 'properties',      // Owner's listed properties
    TOUR_REQUESTS_RECEIVED: 'tourRequestsReceived', // Owner's received tour requests
    EDIT_PROFILE: 'editProfile', // A virtual tab for navigation
};

function UserDashboard() {
    const [loggedUser, setLoggedUser] = useState('');
    // Initialize with a known tab constant
    const [activeTab, setActiveTab] = useState(TABS.APPLIED_HOUSES);
    const [userProfile, setUserProfile] = useState(null);
    // Separate state for owner's received requests vs. buyer's sent requests attached to backend APIs
    const [receivedTourRequests, setReceivedTourRequests] = useState([]);
    const [myTourRequests, setMyTourRequests] = useState([]);
    const [appliedProperties, setAppliedProperties] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loadingProperties, setLoadingProperties] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [userId, setUserId] = useState(null);
    
    // Soft deleted property IDs (hidden from UI but not deleted from DB)
    const [deletedPropertyIds, setDeletedPropertyIds] = useState(() => {
        const saved = localStorage.getItem("deletedPropertyIds");
        return saved ? JSON.parse(saved) : [];
    });
    
    // Edit modal state
    const [editingProperty, setEditingProperty] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: "",
        type: "",
        price: "",
        location: "",
        area: "",
        description: "",
        image: ""
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const navigate = useNavigate();
    const [theme, setTheme] = useTheme();
    const { user, logout, isAuthenticated } = useAuth();
    const { notifications: socketNotifications, socket, connected } = useSocket();

    const getStoredJSON = (key, defaultVal = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultVal;
        } catch (error) {
            console.error(`Error parsing JSON from localStorage key "${key}":`, error);
            return defaultVal;
        }
    };

    // Function to trigger a re-fetch of properties (used internally)
    const refreshProperties = () => {
        setLoadingProperties(true);
        // Re-fetch will happen via useEffect when userId changes or component mounts
        setTimeout(() => setLoadingProperties(false), 500);
    };

    // --- Initial User & Profile Load using JWT Auth ---
    useEffect(() => {
        function loadUser() {
            // Check if authenticated via JWT
            if (!isAuthenticated) {
                navigate("/login");
                return;
            }

            const storedUser = localStorage.getItem("user");
            const storedName = localStorage.getItem("name");
            const storedUserId = localStorage.getItem("userId");
            
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    setUserId(storedUserId || userData._id || userData.id);
                    setLoggedUser(storedName || userData.name || userData.username || 'User');
                    
                    const savedImage = localStorage.getItem("userProfileImage");
                    const savedProfile = getStoredJSON("userProfile");
                    
                    setUserProfile({
                        name: storedName || userData.name || 'User',
                        email: userData.email || "",
                        phone: savedProfile?.phone || "",
                        address: savedProfile?.address || "",
                        image: savedImage,
                    });
                } catch (err) {
                    console.error("Error loading user:", err);
                    navigate("/login");
                }
            }
        }

        loadUser();
    }, [navigate, isAuthenticated]);

    // Listen for profile updates from UserProfile page
    useEffect(() => {
        const handleProfileUpdate = () => {
            console.log("Profile updated event received, reloading profile...");
            const savedImage = localStorage.getItem("userProfileImage");
            const savedProfile = getStoredJSON("userProfile");
            setUserProfile(prev => ({
                ...prev,
                image: savedImage || prev.image,
                name: savedProfile?.name || prev.name,
                phone: savedProfile?.phone || prev.phone,
                address: savedProfile?.address || prev.address,
                email: savedProfile?.email || prev.email,
            }));
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
    }, []);

    // --- Fetch Properties for Owner from Express Backend (JWT Protected) ---
    useEffect(() => {
        async function fetchProperties() {
            if (!userId) return;
            setLoadingProperties(true);
            try {
                // Use the authenticated API endpoint for user's properties
                const { data } = await getUserProperties();
                if (data.success) {
                    setProperties(data.properties || []);
                }
            } catch (error) {
                console.error("Error fetching properties:", error);
                // If unauthorized, redirect to login
                if (error.response?.status === 401) {
                    navigate("/login");
                }
                setProperties([]);
            }
            setLoadingProperties(false);
        }
        fetchProperties();
    }, [userId, navigate]);

    // --- Fetch Requests from Express Backend ---
    useEffect(() => {
        async function fetchRequests() {
            if (!userId) return;
            setLoadingRequests(true);
            try {
                const token = localStorage.getItem("token");
                const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
                const response = await fetch(`${baseUrl}/api/request?t=${Date.now()}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    const allRequests = data.requests || [];

                    // 1. Owner's Received Requests - requests for user's properties
                    const propertyIds = properties.map(p => p._id || p.id);
                    const received = allRequests.filter(req => 
                        propertyIds.includes(req.propertyId) || 
                        propertyIds.includes(req.property_id)
                    );
                    setReceivedTourRequests(received);

                    // 2. Buyer's Sent Requests - requests made by the logged-in user
                    console.log("Filtering requests - userId:", userId, "loggedUser:", loggedUser);
                    console.log("All requests count:", allRequests.length);
                    console.log("All requests:", allRequests.map(r => ({ id: r._id, userId: r.userId, name: r.name, propertyId: r.propertyId, requestType: r.requestType })));
                    
                    const myItems = allRequests.filter(req => {
                        const matchUserId = String(req.userId) === String(userId);
                        const matchName = req.name === loggedUser;
                        const matchApplicant = req.applicant_name === loggedUser;
                        const matchRequester = req.requester_name === loggedUser;
                        const isMatch = matchUserId || matchName || matchApplicant || matchRequester;
                        console.log(`Request ${req._id}: userId=${req.userId}, name=${req.name}, matchUserId=${matchUserId}, matchName=${matchName}, isMatch=${isMatch}`);
                        return isMatch;
                    });
                    console.log("Filtered myItems count:", myItems.length);

                    // Split buyer's requests into Tours and Applications (Inquiries)
                    const tours = myItems.filter(req => req.requestType?.toLowerCase() === 'tour' || req.request_type?.toLowerCase() === 'tour');
                    const applications = myItems.filter(req => req.requestType?.toLowerCase() !== 'tour' && req.request_type?.toLowerCase() !== 'tour');

                    setMyTourRequests(tours);

                    // Fetch property details for applications to get images and payment info
                    const applicationsWithImages = await Promise.all(
                        applications.map(async (app) => {
                            try {
                                const propertyRes = await API.get(`/properties/${app.propertyId}/view`);
                                const propertyData = propertyRes.data?.property || propertyRes.data;
                                console.log(`Property data for ${app.propertyId}:`, propertyData);
                                return {
                                    ...app,
                                    title: app.property_title || propertyData?.title || `Property #${app.propertyId}`,
                                    appliedDate: app.createdAt || app.date,
                                    image: propertyData?.image || null,
                                    propertyPrice: propertyData?.price || null,
                                    propertyType: propertyData?.type || null,
                                    propertyLocation: propertyData?.location || null,
                                    propertyState: propertyData?.state || null
                                };
                            } catch (err) {
                                console.error(`Error fetching property ${app.propertyId}:`, err);
                                return {
                                    ...app,
                                    title: app.property_title || `Property #${app.propertyId}`,
                                    appliedDate: app.createdAt || app.date,
                                    image: null,
                                    propertyPrice: null,
                                    propertyType: null,
                                    propertyLocation: null,
                                    propertyState: null
                                };
                            }
                        })
                    );

                    setAppliedProperties(applicationsWithImages);
                }
            } catch (error) {
                console.error("Error fetching requests:", error);
                setReceivedTourRequests([]);
                setMyTourRequests([]);
                setAppliedProperties([]);
            }
            setLoadingRequests(false);
        }
        fetchRequests();
    }, [properties, userId, loggedUser]);

    // --- Real-time Socket.io Listener for Tour Request Status Updates ---
    useEffect(() => {
        if (socket && connected && userId) {
            const handleStatusChange = (data) => {
                console.log("Tour request status changed:", data);
                // Update myTourRequests if this is my request
                setMyTourRequests(prevRequests => 
                    prevRequests.map(req => {
                        const reqId = req._id || req.id;
                        if (reqId === data.requestId) {
                            return { ...req, status: data.status };
                        }
                        return req;
                    })
                );
                // Update receivedTourRequests if this is a request for my property
                setReceivedTourRequests(prevRequests => 
                    prevRequests.map(req => {
                        const reqId = req._id || req.id;
                        if (reqId === data.requestId) {
                            return { ...req, status: data.status };
                        }
                        return req;
                    })
                );
            };

            socket.on('tourRequestStatusChanged', handleStatusChange);

            return () => {
                socket.off('tourRequestStatusChanged', handleStatusChange);
            };
        }
    }, [socket, connected, userId]);


    // --- Logout Handler ---
    const handleLogout = () => {
        logout();
        window.dispatchEvent(new Event("usernameUpdated"));
        navigate("/login");
    };



    // --- Status Handlers (Express Backend) ---
    const handleTourRequestStatus = async (requestId, newStatus) => {
        try {
            const statusMapping = {
                'accepted': 'Approved',
                'rejected': 'Rejected',
                'Approved': 'Approved',
                'Rejected': 'Rejected'
            };
            const mappedStatus = statusMapping[newStatus] || newStatus;

            const response = await API.put(`/request/${requestId}/status`, { status: mappedStatus });

            if (response.data && response.data.success) {
                alert(`Request status updated to ${mappedStatus}!`);
                // Update local state instead of reloading
                setReceivedTourRequests(prevRequests => 
                    prevRequests.map(req =>
                        req.id === requestId ? { ...req, status: mappedStatus } : req
                    )
                );
            } else {
                alert("Failed to update status on server.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error updating status. Please try again.");
        }
    };

    // --- Edit/Delete Application Handlers ---
    const [editingApplication, setEditingApplication] = useState(null);
    const [editAppFormData, setEditAppFormData] = useState({
        message: "",
        date: "",
        time: "",
        mobile: ""
    });

    const handleEditApplication = (application) => {
        setEditingApplication(application);
        setEditAppFormData({
            message: application.message || "",
            date: application.date || "",
            time: application.time || "",
            mobile: application.mobile || ""
        });
    };

    const handleSaveApplicationEdit = async () => {
        if (!editingApplication) return;
        
        try {
            const response = await API.put(`/request/${editingApplication._id || editingApplication.id}`, editAppFormData);
            
            if (response.data && response.data.success) {
                alert("Application updated successfully!");
                // Update local state
                setAppliedProperties(prev => 
                    prev.map(app => 
                        (app._id || app.id) === (editingApplication._id || editingApplication.id) 
                            ? { ...app, ...editAppFormData }
                            : app
                    )
                );
                setMyTourRequests(prev => 
                    prev.map(req => 
                        (req._id || req.id) === (editingApplication._id || editingApplication.id) 
                            ? { ...req, ...editAppFormData }
                            : req
                    )
                );
                setEditingApplication(null);
            } else {
                alert("Failed to update application.");
            }
        } catch (error) {
            console.error("Error updating application:", error);
            console.error("Error details:", error.response?.data);
            console.error("Error status:", error.response?.status);
            alert(`Error updating application: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteApplication = async (application) => {
        if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
            return;
        }
        
        try {
            const appId = application._id || application.id;
            const response = await API.delete(`/request/${appId}`);
            
            if (response.data && response.data.success) {
                alert("Application deleted successfully!");
                // Remove from local state
                setAppliedProperties(prev => prev.filter(app => (app._id || app.id) !== appId));
                setMyTourRequests(prev => prev.filter(req => (req._id || req.id) !== appId));
            } else {
                alert("Failed to delete application.");
            }
        } catch (error) {
            console.error("Error deleting application:", error);
            console.error("Error details:", error.response?.data);
            console.error("Error status:", error.response?.status);
            alert(`Error deleting application: ${error.response?.data?.message || error.message}`);
        }
    };

    // Listen for deleted requests from socket
    useEffect(() => {
        if (socket && connected) {
            const handleRequestDeleted = (data) => {
                console.log("Request deleted via socket:", data);
                // Remove from received requests if this was a request for my property
                setReceivedTourRequests(prev => prev.filter(req => {
                    const reqId = req._id || req.id;
                    return reqId !== data.requestId;
                }));
            };

            socket.on('requestDeleted', handleRequestDeleted);

            return () => {
                socket.off('requestDeleted', handleRequestDeleted);
            };
        }
    }, [socket, connected]);


    // --- RENDER FUNCTIONS ---

    // --- OWNER VIEW (Tour Requests I received) ---
    const displayOwnerTourRequests = () => {
        if (loadingRequests) {
            return (
                <p className="text-center text-gray-500 mt-4">
                    Loading tour requests for your properties...
                </p>
            );
        }

        if (!receivedTourRequests || receivedTourRequests.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-50 mb-4">
                        <i className="ri-calendar-todo-line text-4xl text-red-400"></i>
                    </div>
                    <p className="text-gray-500 text-lg">You have no pending or past tour requests for your properties.</p>
                    <p className="text-gray-400 text-sm mt-2">Requests will appear here once buyers schedule a tour.</p>
                </div>
            );
        }

        return (
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Tour Requests ({receivedTourRequests.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {receivedTourRequests.map(req => {
                        const normalizedStatus = req.status?.toLowerCase() || 'pending';
                        const statusDisplay = normalizedStatus === 'accepted' || normalizedStatus === 'approved' ? 'Approved' : normalizedStatus === 'rejected' ? 'Rejected' : 'Pending';

                        const statusColor =
                            statusDisplay === 'Approved' ? 'bg-green-500' :
                                statusDisplay === 'Rejected' ? 'bg-red-500' :
                                    'bg-yellow-500';

                        const isPending = statusDisplay !== 'Approved' && statusDisplay !== 'Rejected';

                        // Support both old and new payload schemas
                        const isTourRequest = req.request_type?.toLowerCase() === 'tour' || req.requestType?.toLowerCase() === 'tour';
                        const reqDate = req.requested_date || req.date || 'N/A';
                        const reqTime = req.requested_time || req.time || 'N/A';
                        const reqName = req.applicant_name || req.requester_name || req.name || 'Anonymous';
                        const reqMessage = req.requester_message || req.message || 'No message provided.';
                        const propId = req.property_id || req.propertyId;
                        const requestId = req._id || req.id || req.id; // Use _id or id

                        // Find the property from the user's properties
                        const property = properties.find(p => (p._id || p.id) === propId);

                        const iconClass = property?.type === "PG" || property?.type === "pg"
                            ? "ri-hotel-bed-line"
                            : property?.type === "Rent" || property?.type === "rent"
                                ? "ri-building-2-line"
                                : "ri-home-sale-line";

                        const hasImage = property?.image && property.image.trim() !== "";

                        if (!requestId) {
                            console.warn("Request has no ID:", req);
                            return null;
                        }

                        return (
                            <div
                                key={requestId}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                                        {/* Property Image or Icon */}
                                        <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                                            {hasImage ? (
                                                <img
                                                    src={property.image}
                                                    alt={property.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.classList.add('bg-gradient-to-br', 'from-blue-500', 'to-purple-600', 'text-white');
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                                                    <i className={`${iconClass} text-4xl`}></i>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                                    {property?.title || `Property #${propId}`}
                                                </h4>
                                                <span className={`px-3 py-1 text-xs font-bold text-white rounded-full ${statusColor}`}>
                                                    {statusDisplay}
                                                </span>
                                            </div>

                                            {property && (
                                                <>
                                                    <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                                                        <strong>Type:</strong> {property.type}
                                                    </p>
                                                    <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                                                        <strong>Location:</strong> {property.location}
                                                    </p>
                                                    <p className="text-gray-700 dark:text-gray-200 font-semibold mt-2 text-sm">
                                                        Price: ₹{property.price?.toLocaleString?.() || property.price}
                                                    </p>
                                                </>
                                            )}

                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                    Requested by: <span className="font-semibold text-gray-800 dark:text-gray-200">{reqName}</span>
                                                </p>

                                                {req.payment_status === 'Paid' && (
                                                    <div className="mt-2 p-2 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <i className="ri-money-dollar-circle-fill text-green-600 text-lg"></i>
                                                            <div>
                                                                <p className="text-green-800 font-semibold text-xs">Payment Received!</p>
                                                                <p className="text-green-700 text-xs">₹5,000 booking amount paid</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {isTourRequest ? (
                                                    <div className="flex flex-wrap items-center gap-4 text-sm mt-2">
                                                        <p className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                                            <i className="ri-calendar-line text-blue-500"></i>
                                                            {reqDate}
                                                        </p>
                                                        <p className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                                            <i className="ri-time-line text-purple-500"></i>
                                                            {reqTime}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-700 dark:text-gray-200 text-sm italic mt-2">
                                                        Message: "{reqMessage}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {isPending && (
                                        <div className="mt-4 flex gap-3">
                                            <button
                                                onClick={() => handleTourRequestStatus(requestId, 'accepted')}
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleTourRequestStatus(requestId, 'rejected')}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };


    // --- OWNER VIEW (Properties I listed) with Edit/Delete ---
    const displayUserProperties = () => {
        if (loadingProperties) {
            return (
                <p className="text-center text-gray-500 mt-4">
                    Loading your properties...
                </p>
            );
        }

        // Filter out soft-deleted properties
        const visibleProperties = properties.filter(p => 
            !deletedPropertyIds.includes(p._id) && !deletedPropertyIds.includes(p.id)
        );

        if (!visibleProperties || visibleProperties.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 mb-4">
                        <i className="ri-home-3-line text-4xl text-blue-400"></i>
                    </div>
                    <p className="text-gray-500 text-lg">You haven't listed any properties yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Start listing to manage your properties here</p>
                </div>
            );
        }

        const handleSoftDelete = (propertyId) => {
            if (window.confirm("Are you sure you want to remove this property? It will be hidden from your dashboard but not deleted from the database.")) {
                const newDeletedIds = [...deletedPropertyIds, propertyId];
                setDeletedPropertyIds(newDeletedIds);
                localStorage.setItem("deletedPropertyIds", JSON.stringify(newDeletedIds));
            }
        };

        const handleEditClick = (property) => {
            setEditingProperty(property);
            setEditFormData({
                title: property.title || "",
                type: property.type || "",
                price: property.price || "",
                location: property.location || "",
                area: property.area || "",
                description: property.description || "",
                image: property.image || ""
            });
            setIsEditModalOpen(true);
        };

        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        My Properties ({visibleProperties.length})
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {visibleProperties.map(property => {
                        const iconClass =
                            property.type === "PG" || property.type === "pg"
                                ? "ri-hotel-bed-line"
                                : property.type === "Rent" || property.type === "rent"
                                    ? "ri-building-2-line"
                                    : "ri-home-sale-line";

                        const propertyId = property._id || property.id;
                        const hasImage = property.image && property.image.trim() !== "";

                        return (
                            <div
                                key={propertyId}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                                        {/* Image or Icon */}
                                        <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                                            {hasImage ? (
                                                <img 
                                                    src={property.image} 
                                                    alt={property.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.classList.add('bg-gradient-to-br', 'from-blue-500', 'to-purple-600', 'text-white');
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                                                    <i className={`${iconClass} text-4xl`}></i>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-grow">
                                            <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">{property.title}</h4>

                                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                <strong>Type:</strong> {property.type}
                                            </p>

                                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                <strong>Location:</strong> {property.location}
                                            </p>

                                            <p className="text-gray-700 dark:text-gray-200 font-semibold mt-2">
                                                Price: ₹{property.price?.toLocaleString?.() || property.price}
                                            </p>
                                        </div>

                                        {/* Edit/Delete Actions */}
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleEditClick(property)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                                            >
                                                <i className="ri-edit-line"></i>
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleSoftDelete(propertyId)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                                            >
                                                <i className="ri-delete-bin-line"></i>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };
    // --- BUYER VIEW (My Requests & Applications) Using Express Context ---
    const displayAppliedProperties = () => {
        if (appliedProperties.length === 0 && myTourRequests.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 mb-4">
                        <i className="ri-building-line text-4xl text-purple-400"></i>
                    </div>
                    <p className="text-gray-500 text-lg">You haven't applied for any houses or requested tours yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Start exploring properties to see them here</p>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                {/* 1. Show My Tour Requests */}
                {myTourRequests.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <i className="ri-walk-line text-white text-xl"></i>
                            </div>
                            <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">My Tour Requests</h4>
                            <span className="ml-auto text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-3 py-1 rounded-full font-semibold">
                                {myTourRequests.length} {myTourRequests.length === 1 ? 'Request' : 'Requests'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myTourRequests.map(req => (
                                <div key={req.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md">
                                            <i className="ri-calendar-event-line text-3xl"></i>
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">Tour Scheduled</h4>
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                                    <i className="ri-calendar-line text-purple-500"></i>
                                                    <span className="font-semibold">{req.tourDate || req.requested_date || req.date}</span>
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                                    <i className="ri-time-line text-pink-500"></i>
                                                    <span className="font-semibold">{req.tourTime || req.requested_time || req.time}</span>
                                                </p>
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span className={`inline-block text-xs font-bold px-4 py-2 rounded-lg shadow-sm ${req.status === 'Approved' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                                                    req.status === 'Rejected' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
                                                        'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                                
                                                {/* Edit/Delete buttons for pending requests */}
                                                {req.status !== 'Approved' && req.status !== 'Rejected' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditApplication(req)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg text-sm transition"
                                                            title="Edit Request"
                                                        >
                                                            <i className="ri-edit-line"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteApplication(req)}
                                                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg text-sm transition"
                                                            title="Delete Request"
                                                        >
                                                            <i className="ri-delete-bin-line"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Show My Payment Applications (Unchanged) */}
                {appliedProperties.length > 0 && (
                    <div>
                        {myTourRequests.length > 0 && (
                            <div className="flex items-center gap-3 mb-5 mt-8">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                                    <i className="ri-file-list-3-line text-white text-xl"></i>
                                </div>
                                <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">Rental Applications</h4>



                                <span className="ml-auto text-sm text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-semibold">
                                    {appliedProperties.length} {appliedProperties.length === 1 ? 'Application' : 'Applications'}
                                </span>
                            </div>
                        )}
                        <div className="grid grid-cols-1 gap-5">
                            {appliedProperties.map((application, index) => {
                                // Debug each application
                                console.log(`🏠 Rendering application ${index}:`, {
                                    id: application.id,
                                    title: application.title,
                                    status: application.status,
                                    statusType: typeof application.status,
                                    isApproved: application.status === 'Approved' || application.status === 'approved',
                                    fullApplication: application
                                });

                                return (
                                    <div key={application.id || index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="p-6">
                                            <div className="flex flex-col sm:flex-row gap-5 items-start">
                                                {application.image ? (
                                                    <img 
                                                        src={application.image} 
                                                        alt={application.title || 'Property'} 
                                                        className="w-20 h-20 object-cover rounded-xl flex-shrink-0 shadow-lg transform transition-transform duration-300 hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg transform transition-transform duration-300 hover:scale-110 hover:rotate-3">
                                                        <i className="ri-building-2-line text-4xl"></i>
                                                    </div>
                                                )}
                                                <div className="flex-grow">
                                                    <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">{application.title || 'Property Application'}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-4">
                                                        <i className="ri-calendar-check-line text-green-500"></i>
                                                        Applied on: <span className="font-semibold">{application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}</span>
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <span className={`text-xs font-bold px-4 py-2 rounded-lg shadow-sm ${(application.status === 'Approved' || application.status === 'approved') ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                                                            (application.status === 'Paid' || application.status === 'paid') ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white' :
                                                                (application.status === 'Rejected' || application.status === 'rejected') ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
                                                                    application.status === 'Viewed' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' :
                                                                        'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                                                            }`}>
                                                            {application.status || 'Pending'}
                                                        </span>

                                                        {/* Pay Now button for approved applications */}
                                                        {(application.status === 'Approved' || application.status === 'approved') && (
                                                            <Link
                                                                to={`/property-payment/${application.propertyId}`}
                                                                state={{ propertyData: { houseId: application.propertyId, title: application.title, price: application.propertyPrice, image: application.image, type: application.propertyType, location: application.propertyLocation, state: application.propertyState } }}
                                                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                                                            >
                                                                <i className="ri-secure-payment-line"></i>
                                                                Pay Now
                                                            </Link>
                                                        )}

                                                        {/* Payment complete indicator */}
                                                        {(application.status === 'Paid' || application.status === 'paid') && (
                                                            <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-2 rounded-xl border border-cyan-200">
                                                                <i className="ri-checkbox-circle-fill text-cyan-600 text-lg"></i>
                                                                <span className="text-sm font-bold text-cyan-700">Payment Complete</span>
                                                            </div>
                                                        )}

                                                        {/* Rejected status indicator */}
                                                        {(application.status === 'Rejected' || application.status === 'rejected') && (
                                                            <div className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-red-50 px-4 py-2 rounded-xl border border-red-200">
                                                                <i className="ri-close-circle-fill text-red-600 text-lg"></i>
                                                                <span className="text-sm font-bold text-red-700">Application Rejected</span>
                                                            </div>
                                                        )}

                                                        {/* Edit/Delete buttons for pending applications */}
                                                        {(application.status !== 'Approved' && application.status !== 'approved' && 
                                                          application.status !== 'Rejected' && application.status !== 'rejected' &&
                                                          application.status !== 'Paid' && application.status !== 'paid') && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEditApplication(application)}
                                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1"
                                                                    title="Edit Application"
                                                                >
                                                                    <i className="ri-edit-line"></i> Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteApplication(application)}
                                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1"
                                                                    title="Delete Application"
                                                                >
                                                                    <i className="ri-delete-bin-line"></i> Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // --- Edit Modal Handlers ---
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingProperty) return;
        
        const propertyId = editingProperty._id || editingProperty.id;
        
        try {
            const response = await updateProperty(propertyId, editFormData);
            if (response.data.success) {
                // Update local state
                setProperties(prev => prev.map(p => {
                    const pId = p._id || p.id;
                    if (pId === propertyId) {
                        return { ...p, ...editFormData };
                    }
                    return p;
                }));
                setIsEditModalOpen(false);
                setEditingProperty(null);
                alert("Property updated successfully!");
            } else {
                alert("Failed to update property: " + response.data.message);
            }
        } catch (error) {
            console.error("Error updating property:", error);
            alert("Error updating property. Please try again.");
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingProperty(null);
    };

    return (
        <div className={theme === "dark" ? "dark" : ""}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-black font-sans">

                {/* ── NAVBAR ── */}
                <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/60 dark:border-gray-700/50 shadow-sm">
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/logoRS.jpg" className="h-9 w-9 rounded-full ring-2 ring-yellow-400/40" alt="RoofScout" />
                            <span className="text-xl font-extrabold">
                                <span className="text-yellow-500">Roof</span>
                                <span className="text-blue-600 dark:text-teal-400">Scout</span>
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all bg-gray-100 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                {theme === "light" ? "🌙 Dark" : "☀️ Light"}
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white transition-all shadow-md shadow-red-500/20"
                            >
                                <i className="ri-logout-box-r-line" /> Logout
                            </button>
                        </div>
                    </nav>
                </header>

                {/* ── HERO BANNER ── */}
                <div className="relative overflow-hidden bg-blue-600 dark:bg-teal-600 py-10 px-6">
                    <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl ring-4 ring-indigo-300/30">
                                <img
                                    src={userProfile?.image || `https://avatar.iran.liara.run/public/boy?username=${loggedUser}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                <i className="ri-check-line text-white text-sm font-bold" />
                            </div>
                        </div>
                        {/* Info */}
                        <div className="text-center md:text-left">
                            <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold mb-1">RoofScout — Your Dashboard</p>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow">
                                Welcome back, <span className="text-yellow-400">{userProfile?.name || loggedUser || "User"}</span> 👋
                            </h1>
                            {userProfile?.address && (
                                <p className="text-blue-200/70 mt-1 text-sm flex items-center justify-center md:justify-start gap-1">
                                    <i className="ri-map-pin-line text-red-400" /> {userProfile.address}
                                </p>
                            )}
                            {/* Quick stats */}
                            <div className="flex flex-wrap items-center gap-3 mt-4">
                                <span className="px-3 py-1.5 bg-white/10 backdrop-blur border border-white/20 rounded-full text-white text-xs font-semibold">
                                    📋 {properties.length} Listed
                                </span>
                                <span className="px-3 py-1.5 bg-white/10 backdrop-blur border border-white/20 rounded-full text-white text-xs font-semibold">
                                    📅 {receivedTourRequests.length} Tour Requests
                                </span>
                                <Link to="/user-profile" className="px-4 py-2 bg-blue-600 dark:bg-teal-600 rounded-full text-white text-xs font-bold hover:bg-blue-500 dark:hover:bg-teal-500 transition-all flex items-center gap-1 shadow-md shadow-blue-500/20 dark:shadow-teal-500/20">
                                    <i className="ri-user-settings-line" /> Edit Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* ── PROFILE CONTACT CARDS ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { icon: "ri-phone-line", label: "Phone", value: userProfile?.phone || "Not set", from: "from-blue-500", to: "to-indigo-500", bg: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20", border: "border-blue-100 dark:border-blue-800/40" },
                            { icon: "ri-mail-line", label: "Email", value: userProfile?.email || "Not set", from: "from-emerald-500", to: "to-teal-500", bg: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20", border: "border-emerald-100 dark:border-emerald-800/40" },
                            { icon: "ri-map-pin-line", label: "Address", value: userProfile?.address || "Not set", from: "from-orange-500", to: "to-amber-500", bg: "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20", border: "border-orange-100 dark:border-orange-800/40" },
                            { icon: "ri-lock-password-line", label: "Password", value: "••••••••", from: "from-purple-500", to: "to-pink-500", bg: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20", border: "border-purple-100 dark:border-purple-800/40" },
                        ].map(({ icon, label, value, from, to, bg, border }) => (
                            <div key={label} className={`rounded-2xl border bg-gradient-to-br ${bg} ${border} p-4 hover:shadow-md transition-all`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${from} ${to} flex items-center justify-center shadow-sm`}>
                                        <i className={`${icon} text-white text-sm`} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── TABS ── */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg overflow-hidden">

                        {/* Tab bar */}
                        <div className="flex border-b border-gray-200/60 dark:border-gray-700/60 bg-gray-50/80 dark:bg-gray-900/40">
                            {[
                                { tab: TABS.APPLIED_HOUSES, icon: "ri-home-heart-line", label: "Applied Properties" },
                                { tab: TABS.MY_PROPERTIES, icon: "ri-building-4-line", label: "My Properties" },
                                { tab: TABS.TOUR_REQUESTS_RECEIVED, icon: "ri-calendar-check-line", label: `Tour Requests (${receivedTourRequests.length})` },
                            ].map(({ tab, icon, label }) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-4 px-3 flex items-center justify-center gap-2 text-sm font-semibold transition-all border-b-2 ${activeTab === tab
                                        ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800"
                                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                                        }`}
                                >
                                    <i className={icon} /> <span className="hidden sm:inline">{label}</span>
                                </button>
                            ))}
                            <Link
                                to="/user-profile"
                                className="flex-1 py-4 px-3 flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 border-b-2 border-transparent transition-all"
                            >
                                <i className="ri-user-settings-line" /> <span className="hidden sm:inline">Edit Profile</span>
                            </Link>
                        </div>

                        {/* Tab content */}
                        <div className="p-6">
                            {activeTab === TABS.APPLIED_HOUSES && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><i className="ri-home-heart-line text-white text-xs" /></span>
                                        Your Applications {'&'} Sent Tours
                                    </h3>
                                    {displayAppliedProperties()}
                                </div>
                            )}

                            {activeTab === TABS.MY_PROPERTIES && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center"><i className="ri-building-4-line text-white text-xs" /></span>
                                        Your Listed Properties
                                    </h3>
                                    {displayUserProperties()}
                                </div>
                            )}

                            {activeTab === TABS.TOUR_REQUESTS_RECEIVED && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center"><i className="ri-calendar-check-line text-white text-xs" /></span>
                                        Tour Requests for Your Listings
                                    </h3>
                                    {displayOwnerTourRequests()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Property Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Property</h3>
                                <button
                                    onClick={handleCloseEditModal}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <i className="ri-close-line text-2xl"></i>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Property Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Property Image</label>
                                    <div className="flex items-center gap-4">
                                        {editFormData.image ? (
                                            <img 
                                                src={editFormData.image} 
                                                alt="Preview" 
                                                className="w-20 h-20 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                                <i className="ri-image-line text-2xl"></i>
                                            </div>
                                        )}
                                        <label className="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition">
                                            Change Image
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleEditImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={editFormData.title}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select
                                        name="type"
                                        value={editFormData.type}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="plot">Plot / Land</option>
                                        <option value="flat">Flat / Apartment</option>
                                        <option value="villa">Villa / House</option>
                                        <option value="rent">Rent</option>
                                        <option value="pg">PG / Co-living</option>
                                    </select>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={editFormData.price}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={editFormData.location}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Area */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area (sq ft)</label>
                                    <input
                                        type="number"
                                        name="area"
                                        value={editFormData.area}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={editFormData.description}
                                        onChange={handleEditInputChange}
                                        rows="3"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleCloseEditModal}
                                    className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Application Modal */}
            {editingApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Edit {editingApplication.requestType === 'tour' ? 'Tour Request' : 'Application'}
                                </h3>
                                <button
                                    onClick={() => setEditingApplication(null)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <i className="ri-close-line text-2xl"></i>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Message Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        value={editAppFormData.message}
                                        onChange={(e) => setEditAppFormData(prev => ({ ...prev, message: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        rows="3"
                                        placeholder="Your message to the owner..."
                                    />
                                </div>

                                {/* Mobile Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={editAppFormData.mobile}
                                        onChange={(e) => setEditAppFormData(prev => ({ ...prev, mobile: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Your contact number..."
                                    />
                                </div>

                                {/* Date Field - Only for tours */}
                                {editingApplication.requestType === 'tour' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Preferred Date
                                        </label>
                                        <input
                                            type="date"
                                            value={editAppFormData.date}
                                            onChange={(e) => setEditAppFormData(prev => ({ ...prev, date: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                )}

                                {/* Time Field - Only for tours */}
                                {editingApplication.requestType === 'tour' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Preferred Time
                                        </label>
                                        <input
                                            type="time"
                                            value={editAppFormData.time}
                                            onChange={(e) => setEditAppFormData(prev => ({ ...prev, time: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setEditingApplication(null)}
                                    className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveApplicationEdit}
                                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserDashboard;
