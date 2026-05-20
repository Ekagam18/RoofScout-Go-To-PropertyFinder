import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // BUY / RENT MODE
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("mode") || "buy";
  });

  const switchMode = (newMode) => {
    setMode(newMode);
    localStorage.setItem("mode", newMode);
  };

  // DARK MODE
  const [theme, setTheme] = useTheme();
  const darkMode = theme === 'dark';
  const setDarkMode = (val) => setTheme(val ? 'dark' : 'light');

  // ---------------- AUTH CONTEXT ----------------
  const { user, isAuthenticated } = useAuth();
  const [username, setUsername] = useState(null);
  const [userProfileImage, setUserProfileImage] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Get username from user context first
      let displayName = user.name || user.username;
      
      // Fallback to localStorage if user context doesn't have name
      if (!displayName) {
        displayName = localStorage.getItem("name");
      }
      
      // Get profile image - only if it's a valid non-empty string
      let profileImage = null;
      if (user.image && typeof user.image === 'string' && user.image.trim() !== '') {
        profileImage = user.image;
      }
      
      // Check localStorage for profile image only
      if (!profileImage) {
        try {
          const localProfile = JSON.parse(localStorage.getItem("userProfile"));
          if (localProfile?.image && typeof localProfile.image === 'string' && localProfile.image.trim() !== '') {
            profileImage = localProfile.image;
          }
          // Only use localStorage name if displayName is still not set
          if (!displayName && localProfile?.name) {
            displayName = localProfile.name;
          }
        } catch (e) { }
      }

      setUserProfileImage(profileImage);

      // Strip email domain if still an email
      if (displayName && displayName.includes('@')) {
        displayName = displayName.split('@')[0];
      }
      
      setUsername(displayName);
    } else {
      setUsername(null);
      setUserProfileImage(null);
    }
  }, [isAuthenticated, user]);

  // ---------------- SCROLL + SEARCH ----------------
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.innerWidth >= 1024 && window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleSearch = () => {
    const state = searchValue.trim().toLowerCase();
    if (!state) return alert("Please enter a state to search.");

    const path = mode === "rent" ? "/statesrent" : "/states";
    navigate(`${path}?state=${encodeURIComponent(state)}`);
    setSearchValue("");
  };

  const navbarClasses = `sticky top-0 z-50 flex gap-10 h-20 p-4 items-center shadow-lg transition-all duration-300 
  ${isScrolled
      ? "rounded-3xl w-5/6 ml-[148px] shadow-2xl bg-gray-200/20 dark:bg-gray-800/30 backdrop-blur-lg border-gray-200/40 border-b-2 top-4"
      : "rounded-none shadow-lg bg-white dark:bg-gray-900 top-0"
    }`;

  return (
    <>
      <div id="navbar" className={navbarClasses}>

        {/* LOGO */}
        <div className="flex items-center mr-4">
          <img src="/LogoRS.png" alt="Logo" className="h-16 w-16 mr-2 hidden sm:block" />
          <h1 className="font-bold text-2xl text-yellow-500"><Link to="/">Roof</Link></h1>
          <h1 className="font-bold text-2xl text-blue-600 dark:text-teal-400"><Link to="/">Scout</Link></h1>
        </div>

        {/* BUY / RENT */}
        <div className="hidden sm:flex items-center space-x-4 ml-2">
          <div className="relative dropdown">
            <button className="px-3 py-2 text-sm font-bold">
              {mode === "rent" ? "Rent" : "Buy"}
            </button>
            <div className="dropdown-menu absolute hidden bg-white dark:bg-gray-800 pt-4">
              {mode === "rent" ? (
                <button onClick={() => switchMode("buy")} className="py-1 px-2">Buy</button>
              ) : (
                <button onClick={() => switchMode("rent")} className="py-1 px-2">Rent</button>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative flex items-center w-1/2 sm:w-40 md:w-1/2 ml-8 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
          <input
            type="text"
            placeholder="  Search States..."
            className="w-full rounded-xl h-10 sm:h-12 bg-gray-200/20 dark:bg-gray-800/30"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <i
            className="fa-solid fa-magnifying-glass absolute right-3 cursor-pointer"
            onClick={handleSearch}
          ></i>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex items-center ml-2 space-x-4">

          {/* POST PROPERTY */}
          <button className="bg-blue-500 dark:bg-teal-500 text-white font-semibold rounded-md w-40 px-3 py-2">
            <Link to="/postproperty">Post Property</Link>
            <sup className="text-xs text-black bg-green-400 rounded-md px-1 ml-1">Free</sup>
          </button>

          {/* USER BUTTON */}
          {isAuthenticated ? (
            <button
              onClick={() => {
                const role = localStorage.getItem("role") || "user";
                if (role === 'admin') navigate("/AdminDashboard");
                else navigate("/userdashboard");
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 dark:from-teal-500 dark:to-emerald-500 dark:hover:from-teal-600 dark:hover:to-emerald-600 text-white font-bold rounded-full h-11 px-2 pr-5 transition-all shadow-md"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full border-2 border-white/80 overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0">
                {userProfileImage ? (
                  <img src={userProfileImage} className="w-full h-full object-cover" alt="User" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                    {username ? username.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>
              {/* Username */}
              <span className="truncate max-w-[100px] text-sm">
                {username || "User"}
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 dark:from-teal-500 dark:to-emerald-500 dark:hover:from-teal-600 dark:hover:to-emerald-600 text-white font-bold rounded-xl h-10 px-6 transition-all shadow-md"
            >
              Login
            </button>
          )}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 shadow-md"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
          </button>
        </div>
      </div>
    </>
  );
}

export default Navbar;
