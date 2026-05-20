import { useTheme } from '../hooks/useTheme';
// src/pages/AdmPropt.jsx
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function AdmPropt() {
  const navigate = useNavigate();
  const location = useLocation();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useTheme();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("rs-theme", theme);
  }, [theme]);

  // Fetch plots from backend
  useEffect(() => {
    const fetchPlots = async () => {
      try {
        const { data } = await API.get("/properties");
        if (data.success) {
          // Filter only plots
          const plots = data.properties.filter(p => p.type === 'plot');
          setProperties(plots);
        }
      } catch (err) {
        console.error("Error fetching plots:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlots();
  }, []);

  // SEARCH
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return properties;
    return properties.filter((p) => {
      return (
        String(p._id || p.id).toLowerCase().includes(q) ||
        (p.title || "").toLowerCase().includes(q) ||
        (p.district || "").toLowerCase().includes(q) ||
        (p.state || "").toLowerCase().includes(q) ||
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

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plot?")) return;
    try {
      const propertyId = id._id || id;
      await API.delete(`/properties/${propertyId}`);
      setProperties(prev => prev.filter(p => (p._id || p.id) !== propertyId));
      alert("Plot deleted successfully!");
    } catch (err) {
      console.error("Error deleting plot:", err);
      alert("Error deleting plot. Please try again.");
    }
  };

  // SAVE
  const handleSaveFromCard = async (updated) => {
    try {
      const propertyId = updated._id || updated.id;
      await API.put(`/properties/${propertyId}`, updated);
      setProperties(prev => 
        prev.map(p => (p._id || p.id) === propertyId ? { ...p, ...updated } : p)
      );
      alert("Plot updated successfully!");
    } catch (err) {
      console.error("Error updating plot:", err);
      alert("Error updating plot. Please try again.");
    }
  };

  // VIEW DETAILS
  const navigateToDetails = (property) => {
    const id = property._id || property.id;
    navigate(`/viewdetail/${id}`);
  };

  return (
    <div
      className={`h-screen flex flex-col ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* NAV */}
      <div
        className={`flex-shrink-0 z-50 h-20 flex justify-between items-center px-6 shadow-md ${
          theme === "dark" ? "bg-gray-800/70" : "bg-white/70 backdrop-blur"
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-2 rounded hover:bg-gray-200/20 dark:hover:bg-gray-700/20"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <img src="/logoRS.jpg" className="h-10 w-10 rounded-full" alt="logo" />
            <div>
              <h1 className="text-xl font-bold">
                <span className="text-yellow-500">Roof</span>
                <span className="text-blue-600 dark:text-teal-400">Scout</span>
              </h1>
              <p className="text-sm opacity-70">Plot Admin</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="px-3 py-2 border rounded"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link
            to="#" onClick={(e) => { e.preventDefault(); import("../supabase").then(({ localAuth }) => { localAuth.signOut(); localStorage.removeItem("role"); window.location.href = "/login"; }); }}
            className="px-3 py-2 rounded hover:bg-gray-200/20 dark:hover:bg-gray-700/20"
          >Logout</Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={`transition-all duration-300 ${
            collapsed ? "w-20" : "w-72"
          } bg-gray-900 text-white p-4 h-full overflow-y-auto flex-shrink-0`}
        >
          <SidebarItem to="/AdminDashboard" icon={<Info />} text="Info" collapsed={collapsed} />
          <SidebarItem to="/AdmHouses" icon={<Home />} text="Houses" collapsed={collapsed} />
          <SidebarItem to="/AdmPropt" icon={<Building2 />} text="Properties" collapsed={collapsed} active />
          <SidebarItem to="/AdmClients" icon={<Users />} text="Clients" collapsed={collapsed} />
          <SidebarItem to="/AdmTenants" icon={<UserCheck />} text="Tenants" collapsed={collapsed} />
          <SidebarItem to="/AdmPayments" icon={<CreditCard />} text="Payments" collapsed={collapsed} />

          {!collapsed && (
            <div className="mt-6 text-xs text-gray-300">
              <p className="font-semibold">Quick Stats</p>
              <p>Total Plots: <span className="font-semibold text-white">{properties.length}</span></p>
              <p>Visible: <span className="font-semibold text-white">{filtered.length}</span></p>
            </div>
          )}
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6 overflow-y-auto">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Properties (Plots/Lands)</h1>
              <p className="text-gray-500 dark:text-gray-300 mt-1">Manage plot and land listings from the database.</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/postproperty")} className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition">Add Plot</button>
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search plots..." className="border px-4 py-2 rounded-lg w-64 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </header>

          {loading ? (
            <div className="text-center py-16">Loading...</div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16">No plots found in database.</div>
          ) : (
            <>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {paginated.map((prop) => (
                  <PropertyCard
                    key={prop._id || prop.id}
                    property={prop}
                    onViewDetails={navigateToDetails}
                    onSave={handleSaveFromCard}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* PAGINATION */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 bg-gray-300 text-black rounded disabled:opacity-50 hover:bg-gray-400 transition"
                >
                  Prev
                </button>

                <span className="text-lg font-semibold">
                  {page} / {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 bg-gray-300 text-black rounded disabled:opacity-50 hover:bg-gray-400 transition"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ to, icon, text, collapsed, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-xl text-sm text-gray-100 hover:bg-white/10 transition-all duration-200
        ${collapsed ? "justify-center" : ""}
        ${active ? "bg-gradient-to-r from-blue-600 to-teal-500 shadow-lg shadow-blue-500/30" : ""}`}
    >
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10">
        {icon}
      </div>
      {!collapsed && <span className="font-medium">{text}</span>}
    </Link>
  );
}

export default AdmPropt;
