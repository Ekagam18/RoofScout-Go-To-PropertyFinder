import { useTheme } from '../hooks/useTheme';
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/axiosConfig";
import {
  Menu, Sun, Moon, Home, Building2, Users, UserCheck, CreditCard, Info, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

function AdmTenants() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useTheme();
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("rs-theme", theme);
  }, [theme]);

  // Fetch tenants (users who have rented properties)
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        // Get requests with payment_status = 'Paid' or rental properties
        const { data } = await API.get("/request");
        
        if (data.success) {
          const tenantsList = data.requests
            .filter(req => req.payment_status === 'Paid' || req.request_type?.toLowerCase() === 'rent')
            .map(req => ({
              name: req.applicant_name || req.requester_name || req.name || "Unknown",
              email: req.email || "N/A",
              mobile: req.mobile || "N/A",
              propertyId: req.property_id || req.propertyId,
              propertyTitle: "Rental Property",
              rentAmount: req.price || "N/A",
              status: req.status || "Active",
              requestDate: req.requested_date || req.date || "N/A",
              requestTime: req.requested_time || req.time || "N/A"
            }));
          
          setTenants(tenantsList);
        }
      } catch (err) {
        console.error("Error fetching tenants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const filtered = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(search.toLowerCase()) ||
    tenant.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}>
      {/* NAVBAR */}
      <div className={`flex-shrink-0 z-50 h-20 flex justify-between items-center px-6 shadow-md ${theme === "dark" ? "bg-gray-800/70" : "bg-white/60 backdrop-blur"}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => setCollapsed(c => !c)} className="p-2 rounded hover:bg-gray-200/20 dark:hover:bg-gray-700/20">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <img src="/logoRS.jpg" className="h-10 w-10 rounded-full" alt="RoofScout" />
            <div>
              <h1 className="text-xl font-bold">
                <Link to="/"><span className="text-yellow-500">Roof</span><span className="text-blue-600 dark:text-teal-400">Scout</span></Link>
              </h1>
              <p className="text-sm opacity-70">Admin - Tenants</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} className="p-2 rounded border">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link to="/AdminDashboard" className="px-3 py-2 rounded hover:bg-gray-200/20 dark:hover:bg-gray-700/20">Dashboard</Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`transition-all duration-300 ${collapsed ? "w-20" : "w-72"} bg-gray-900 text-white p-4 h-full overflow-y-auto flex-shrink-0`}>
          <nav className="flex flex-col gap-2">
            <SidebarItem to="/AdminDashboard" icon={<Info />} text="Info" collapsed={collapsed} />
            <SidebarItem to="/AdmHouses" icon={<Home />} text="Houses" collapsed={collapsed} />
            <SidebarItem to="/AdmPropt" icon={<Building2 />} text="Properties" collapsed={collapsed} />
            <SidebarItem to="/AdmClients" icon={<Users />} text="Clients" collapsed={collapsed} />
            <SidebarItem to="/AdmTenants" icon={<UserCheck />} text="Tenants" collapsed={collapsed} active />
            <SidebarItem to="/AdmPayments" icon={<CreditCard />} text="Payments" collapsed={collapsed} />
          </nav>
          {!collapsed && (
            <div className="mt-6 text-xs text-gray-300">
              <p className="font-semibold">Quick Stats</p>
              <p>Total Tenants: <span className="font-semibold text-white">{tenants.length}</span></p>
              <p>Active: <span className="font-semibold text-white">{tenants.filter(t => t.status === 'Active' || t.status === 'Approved').length}</span></p>
            </div>
          )}
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Tenants</h1>
                <p className="text-gray-500 dark:text-gray-300 mt-1">Users who have rented properties on the platform.</p>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenants..." className="border px-4 py-2 rounded-lg w-64 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {loading ? (
              <div className="text-center py-16 text-gray-500">Loading tenants...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No tenants found.</div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Mobile</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Property ID</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Rent Amount</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Request Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((tenant, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{tenant.name}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{tenant.email}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{tenant.mobile}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-sm">{tenant.propertyId}</td>
                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold">₹{tenant.rentAmount?.toLocaleString() || tenant.rentAmount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            tenant.status === 'Active' || tenant.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                            tenant.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {tenant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{tenant.requestDate}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ to, icon, text, collapsed, active }) {
  return (
    <Link to={to} className={`flex items-center gap-3 p-3 rounded-xl text-sm text-gray-100 hover:bg-white/10 transition-all duration-200 ${collapsed ? "justify-center" : ""} ${active ? "bg-gradient-to-r from-blue-600 to-teal-500 shadow-lg shadow-blue-500/30" : ""}`}>
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10">{icon}</div>
      {!collapsed && <span className="font-medium">{text}</span>}
    </Link>
  );
}

export default AdmTenants;
