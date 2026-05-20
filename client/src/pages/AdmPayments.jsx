import { useTheme } from '../hooks/useTheme';
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/axiosConfig";
import {
  Menu, Sun, Moon, Home, Building2, Users, UserCheck, CreditCard, Info, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

function AdmPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useTheme();
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("rs-theme", theme);
  }, [theme]);

  // Fetch payments from new payments endpoint
  useEffect(() => {
    const fetchPayments = async () => {
      console.log("Fetching payments...");
      try {
        const { data } = await API.get("/payments");
        console.log("Payments response:", data);
        
        if (data.success) {
          const paymentsList = data.payments.map(payment => ({
            id: payment._id || payment.id,
            buyerName: payment.buyerName || "Unknown",
            ownerName: payment.ownerName || "Unknown",
            propertyTitle: payment.propertyTitle || "N/A",
            propertyId: payment.propertyId,
            price: payment.price || 0,
            paymentType: payment.paymentType || 'full',
            amountPaid: payment.amountPaid || 0,
            remainingAmount: payment.remainingAmount || 0,
            emiDuration: payment.emiDuration || null,
            emiAmount: payment.emiAmount || null,
            paymentDate: payment.paymentDate || payment.createdAt,
            paymentStatus: payment.paymentStatus || 'completed',
            paymentMethod: payment.paymentMethod || 'N/A',
            transactionId: payment.transactionId || 'N/A'
          }));
          
          setPayments(paymentsList);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch payments");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filtered = payments.filter(payment => 
    payment.buyerName.toLowerCase().includes(search.toLowerCase()) ||
    payment.ownerName.toLowerCase().includes(search.toLowerCase()) ||
    payment.propertyTitle.toLowerCase().includes(search.toLowerCase())
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
              <p className="text-sm opacity-70">Admin - Payments</p>
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
            <SidebarItem to="/AdmTenants" icon={<UserCheck />} text="Tenants" collapsed={collapsed} />
            <SidebarItem to="/AdmPayments" icon={<CreditCard />} text="Payments" collapsed={collapsed} active />
          </nav>
          {!collapsed && (
            <div className="mt-6 text-xs text-gray-300">
              <p className="font-semibold">Quick Stats</p>
              <p>Total Payments: <span className="font-semibold text-white">{payments.length}</span></p>
              <p>Total Amount: <span className="font-semibold text-white">₹{payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}</span></p>
            </div>
          )}
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Payments</h1>
                <p className="text-gray-500 dark:text-gray-300 mt-1">Track all payments made on the platform.</p>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payments..." className="border px-4 py-2 rounded-lg w-64 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {loading ? (
              <div className="text-center py-16 text-gray-500">Loading payments...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <p className="text-lg font-semibold">Error loading payments</p>
                <p className="text-sm mt-2">{error}</p>
                <p className="text-xs mt-4 text-gray-400">Make sure the backend server is running on port 5000</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No payments found.</div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Buyer Name</th>
                      <th className="px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Owner Name</th>
                      <th className="px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Property</th>
                      <th className="px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Price</th>
                      <th className="px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Payment Type</th>
                      <th className="px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Amount Paid</th>
                      <th className="px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Remaining</th>
                      <th className="px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                      <th className="px-4 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((payment, idx) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">{payment.buyerName}</td>
                        <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{payment.ownerName}</td>
                        <td className="px-4 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={payment.propertyTitle}>{payment.propertyTitle}</td>
                        <td className="px-4 py-4 text-gray-900 dark:text-gray-100 font-semibold">₹{payment.price?.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            payment.paymentType === 'full' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                            'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          }`}>
                            {payment.paymentType === 'full' ? 'Full Payment' : 'EMI'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-900 dark:text-gray-100 font-semibold">₹{payment.amountPaid?.toLocaleString()}</td>
                        <td className="px-4 py-4 text-gray-900 dark:text-gray-100 font-semibold">
                          {payment.remainingAmount > 0 ? `₹${payment.remainingAmount.toLocaleString()}` : '₹0'}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            payment.paymentStatus === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                            payment.paymentStatus === 'partial' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {payment.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-600 dark:text-gray-300 text-sm">
                          {new Date(payment.paymentDate).toLocaleDateString()} {new Date(payment.paymentDate).toLocaleTimeString()}
                        </td>
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

export default AdmPayments;
