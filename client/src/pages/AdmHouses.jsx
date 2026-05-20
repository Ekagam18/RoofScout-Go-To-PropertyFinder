import { useTheme } from '../hooks/useTheme';
// src/pages/AdmHouses.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PropertyCard from "../components/propertyCard";
import API from "../utils/axiosConfig";

import {
  Menu,
  Sun,
  Moon,
  Home,
  Users,
  Building2,
  UserCheck,
  CreditCard,
  Info,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

function AdmHouses() {
  const navigate = useNavigate();
  const location = useLocation();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useTheme();
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("rs-theme", theme);
  }, [theme]);

  // Fetch houses from backend
  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const { data } = await API.get("/properties?includeSold=true");
        if (data.success) {
          console.log("All properties from DB:", data.properties);
          // Show all properties EXCEPT plots - this includes houses, flats, villas, rentals, etc.
          const houses = data.properties.filter(p => {
            const type = (p.type || "").toLowerCase();
            // Exclude only plots/lands
            return type !== 'plot' && type !== 'land';
          });
          console.log("Filtered houses:", houses);
          setProperties(houses);
        }
      } catch (err) {
        console.error("Error fetching houses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHouses();
  }, []);

  // SEARCH
  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) => {
      return (
        String(p._id || p.id || "").toLowerCase().includes(q) ||
        (p.title || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.location || p.state || p.district || "").toLowerCase().includes(q) ||
        (p.price || "").toString().toLowerCase().includes(q)
      );
    });
  }, [properties, search]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // VIEW DETAILS
  const handleViewDetails = (property) => {
    const id = property._id || property.id;
    navigate(`/viewdetail/${id}`);
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      const propertyId = id._id || id;
      await API.delete(`/properties/${propertyId}`);
      setProperties(prev => prev.filter(p => (p._id || p.id) !== propertyId));
      alert("Property deleted successfully!");
    } catch (err) {
      console.error("Error deleting property:", err);
      alert("Error deleting property. Please try again.");
    }
  };

  // SAVE (update)
  const handleSaveFromCard = async (updated) => {
    try {
      const propertyId = updated._id || updated.id;
      await API.put(`/properties/${propertyId}`, updated);
      setProperties(prev => 
        prev.map(p => (p._id || p.id) === propertyId ? { ...p, ...updated } : p)
      );
      alert("Property updated successfully!");
    } catch (err) {
      console.error("Error updating property:", err);
      alert("Error updating property. Please try again.");
    }
  };

  // UI
  return (
    <div
      className={`h-screen flex flex-col ${
        theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* TOP NAV */}
      <div
        className={`flex-shrink-0 z-50 h-20 flex justify-between items-center px-6 shadow-md ${
          theme === "dark" ? "bg-gray-800/70" : "bg-white/70 backdrop-blur"
        }`}
      >
        <div className="flex items-center gap-4">
          <button onClick={() => setCollapsed((c) => !c)} className="p-2 rounded hover:bg-gray-200/20 dark:hover:bg-gray-700/20">
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <img src="/logoRS.jpg" className="h-10 w-10 rounded-full" alt="RoofScout" />
            <div>
              <h1 className="text-xl font-bold">
                <Link to="/"><span className="text-yellow-500">Roof</span> <span className="text-blue-600 dark:text-teal-400">Scout</span></Link>
              </h1>
              <p className="text-sm opacity-70">Property Admin</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} className="p-2 rounded border">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link to="#" onClick={(e) => { e.preventDefault(); import("../supabase").then(({ localAuth }) => { localAuth.signOut(); localStorage.removeItem("role"); window.location.href = "/login"; }); }} className="px-3 py-2 rounded hover:bg-gray-200/20 dark:hover:bg-gray-700/20">Logout</Link>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`transition-all duration-300 ${collapsed ? "w-20" : "w-72"} bg-gray-900 text-white p-4 h-full overflow-y-auto flex-shrink-0`}>
          <nav className="flex flex-col gap-2">
            <SidebarItem to="/AdminDashboard" icon={<Info />} text="Info" collapsed={collapsed} />
            <SidebarItem to="/AdmHouses" icon={<Home />} text="Houses" collapsed={collapsed} active />
            <SidebarItem to="/AdmPropt" icon={<Building2 />} text="Properties" collapsed={collapsed} />
            <SidebarItem to="/AdmClients" icon={<Users />} text="Clients" collapsed={collapsed} />
            <SidebarItem to="/AdmTenants" icon={<UserCheck />} text="Tenants" collapsed={collapsed} />
            <SidebarItem to="/AdmPayments" icon={<CreditCard />} text="Payments" collapsed={collapsed} />
          </nav>

          {!collapsed && (
            <div className="mt-6 text-xs text-gray-300">
              <p className="font-semibold">Quick Stats</p>
              <p>Total Houses: <span className="font-semibold text-white">{properties.length}</span></p>
              <p>Visible: <span className="font-semibold text-white">{filtered.length}</span></p>
            </div>
          )}
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6 overflow-y-auto">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Houses</h1>
              <p className="text-gray-500 dark:text-gray-300 mt-1">Manage house listings from the database.</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/postproperty")} className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition">Add House</button>
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search houses..." className="border px-4 py-2 rounded-lg w-64 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div key={location.pathname + page} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}>
              {loading ? (
                <div className="text-center py-16 text-gray-500">Loading houses...</div>
              ) : (
                <>
                  {paginated.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No houses found in database.</div>
                  ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {paginated.map((prop) => (
                        <PropertyCard
                          key={prop._id || prop.id}
                          property={prop}
                          onViewDetails={handleViewDetails}
                          onSave={handleSaveFromCard}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}

                  {/* PAGINATION */}
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 font-semibold hover:bg-gray-400 transition">Prev</button>
                    <div className="text-sm font-medium">Page <strong>{page}</strong> of <strong>{totalPages}</strong></div>
                    <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 font-semibold hover:bg-gray-400 transition">Next</button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ to, icon, text, collapsed, active }) {
  return (
    <Link to={to} className={`flex items-center gap-3 p-3 rounded-xl text-sm text-gray-100 hover:bg-white/10 transition-all duration-200 ${collapsed ? "justify-center" : ""} ${active ? "bg-gradient-to-r from-blue-600 to-teal-500 shadow-lg shadow-blue-500/30" : ""}`}>
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10">
        {icon}
      </div>
      {!collapsed && <span className="font-medium">{text}</span>}
    </Link>
  );
}

export default AdmHouses;
