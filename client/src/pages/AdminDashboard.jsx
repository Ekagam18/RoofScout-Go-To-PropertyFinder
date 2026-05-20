import { useTheme } from '../hooks/useTheme';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axiosConfig";
import {
  Menu, Sun, Moon, Home, Building2, Info, Bell, ChevronLeft, ChevronRight,
  Users, TrendingUp, DollarSign, Building, Activity, UserCheck, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';

const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];

function AdminDashboard() {
  const [theme, setTheme] = useTheme();
  const [stats, setStats] = useState({ houses: 0, plots: 0, rentals: 0, totalRevenue: 0, users: 0, properties: 0 });
  const [localNotifications, setLocalNotifications] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const [housesStatus, setHousesStatus] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const { notifications, connected } = useSocket();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/admin/stats");
        if (data.success) {
          setStats(prev => ({ ...prev, ...data.stats }));
        }
        setMonthlyData(data.monthlyData || []);
        setHousesStatus(data.housesStatus || []);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProperties = async () => {
      try {
        const { data } = await API.get("/properties");
        if (data.success) {
          setAllProperties(data.properties);
          const houses = data.properties.filter(p => p.type === 'house' || p.type === 'villa' || p.type === 'flat').length;
          const plots = data.properties.filter(p => p.type === 'plot').length;
          const rentals = data.properties.filter(p => p.type === 'rent' || p.type === 'Rent').length;
          setStats(prev => ({ ...prev, houses, plots, rentals }));
        }
      } catch (err) {
        console.error("Error fetching properties:", err);
      }
    };

    fetchStats();
    fetchProperties();
  }, []);

  // Sync socket notifications with local state
  useEffect(() => {
    const adminNotifs = notifications.filter(n => 
      n.type === 'adminNotification' || 
      n.type === 'propertyAdded' || 
      n.type === 'propertyUpdated' || 
      n.type === 'propertyDeleted' ||
      n.type === 'tourRequestCreated'
    );
    setLocalNotifications(adminNotifs.slice(0, 10));
  }, [notifications]);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
      }`}>

      {/* NAVBAR */}
      <div className={`backdrop-blur-md ${theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/60'
        } flex-shrink-0 flex justify-between items-center h-20 px-6 shadow-sm z-50`}>

        <div className="flex items-center gap-4">
          <button onClick={() => setCollapsed(c => !c)} className="p-2 rounded hover:bg-gray-200/20 dark:hover:bg-gray-700/20">
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <img src="/logoRS.jpg" className="h-12 w-12 rounded-full" alt="RoofScout" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <Link to="/">
                  <span className="text-yellow-500">Roof</span>
                  <span className="text-blue-600 dark:text-teal-400">Scout</span>
                </Link>
              </h1>
              <p className="text-sm opacity-70">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} title={connected ? 'Connected' : 'Disconnected'}></div>

          <div className="relative">
            <button onClick={() => setShowNotifs(v => !v)} className="p-2 rounded hover:bg-gray-200/20 dark:hover:bg-gray-700/20 relative">
              <Bell />
              {localNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {localNotifications.length > 9 ? '9+' : localNotifications.length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`absolute right-0 mt-2 w-72 rounded-lg shadow-lg border ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}
                >
                  <div className="p-3 text-sm">
                    <p className="font-semibold">Notifications {connected && <span className="text-green-500 text-xs">● Live</span>}</p>
                    <ul className="mt-2 space-y-2">
                      {localNotifications.length > 0 ? (
                        localNotifications.slice(0, 5).map((notif, idx) => (
                          <li key={idx} className="p-2 rounded hover:bg-gray-100/40 dark:hover:bg-gray-700/40">
                            {notif.message || notif}
                          </li>
                        ))
                      ) : (
                        <li className="p-2 text-gray-400">No new notifications</li>
                      )}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="px-3 py-2 border rounded hover:shadow">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link to="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="px-3 py-2 rounded hover:bg-gray-200/20 dark:hover:bg-gray-700/20">Logout</Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR (Copied from AdmHouses) */}
        <aside className={`transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'
          } bg-gray-900 h-full p-4 text-white overflow-y-auto flex-shrink-0`}>

          <div className="flex items-center justify-between mb-6">
            {!collapsed && (
              <div className="flex items-center gap-3">
                <img src="/logoRS.jpg" className="h-10 w-10 rounded-full" />
                <div>
                  <h4 className="font-bold">RoofScout</h4>
                  <p className="text-xs text-gray-300">Property Admin</p>
                </div>
              </div>
            )}

            <button onClick={() => setCollapsed(c => !c)} className="p-2 rounded bg-white/5 hover:bg-white/10">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <SidebarItem to="/AdminDashboard" icon={<Info />} text="Info" collapsed={collapsed} active />
            <SidebarItem to="/AdmHouses" icon={<Home />} text="Houses" collapsed={collapsed} />
            <SidebarItem to="/AdmPropt" icon={<Building2 />} text="Properties" collapsed={collapsed} />
            <SidebarItem to="/AdmClients" icon={<Users />} text="Clients" collapsed={collapsed} />
            <SidebarItem to="/AdmTenants" icon={<UserCheck />} text="Tenants" collapsed={collapsed} />
            <SidebarItem to="/AdmPayments" icon={<CreditCard />} text="Payments" collapsed={collapsed} />
          </nav>

          <div className="mt-8 text-xs text-gray-300">
            {!collapsed ? (
              <>
                <p className="font-medium">Quick Stats</p>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <p>Houses: <span className="text-white font-semibold">{stats.houses}</span></p>
                  <p>Plots: <span className="text-white font-semibold">{stats.plots}</span></p>
                  <p>Users: <span className="text-white font-semibold">{stats.users}</span></p>
                  <p>Total Properties: <span className="text-white font-semibold">{stats.properties}</span></p>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400">RS</div>
            )}
          </div>

        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-400 bg-clip-text text-transparent">
                    Dashboard
                  </h2>
                  <p className="text-gray-500 mt-1">Welcome back, Admin</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${connected ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                  <span className="text-sm font-medium">{connected ? 'Live' : 'Offline'}</span>
                </div>
              </div>

              {/* STATS CARDS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8"
              >
                <StatCard
                  title="Total Properties"
                  value={stats.properties}
                  icon={<Building className="w-6 h-6" />}
                  color="from-blue-500 to-blue-600"
                  bg="bg-blue-50 dark:bg-blue-900/20"
                />
                <StatCard
                  title="Houses Listed"
                  value={stats.houses}
                  icon={<Home className="w-6 h-6" />}
                  color="from-green-500 to-green-600"
                  bg="bg-green-50 dark:bg-green-900/20"
                />
                <StatCard
                  title="Plots/Lands"
                  value={stats.plots}
                  icon={<Building2 className="w-6 h-6" />}
                  color="from-purple-500 to-purple-600"
                  bg="bg-purple-50 dark:bg-purple-900/20"
                />
                <StatCard
                  title="Total Users"
                  value={stats.users}
                  icon={<Users className="w-6 h-6" />}
                  color="from-orange-500 to-orange-600"
                  bg="bg-orange-50 dark:bg-orange-900/20"
                />
              </motion.div>

              {/* REVENUE & ACTIVITY CARDS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid lg:grid-cols-2 gap-6 mb-8"
              >
                <div className={`p-6 rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Revenue</h3>
                      <p className="text-sm text-gray-500">All time earnings</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    ₹{stats.totalRevenue?.toLocaleString() || '0'}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12.5% from last month</span>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Listings</h3>
                      <p className="text-sm text-gray-500">Currently available</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.houses + stats.plots + stats.rentals}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <span>{stats.rentals} rentals available</span>
                  </div>
                </div>
              </motion.div>

              {/* CHARTS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="grid lg:grid-cols-3 gap-6 mb-8"
              >
                <div className={`p-6 rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Monthly Revenue</h3>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <AreaChart data={monthlyData.length > 0 ? monthlyData : [{ month: 'Jan', rent: 0 }, { month: 'Feb', rent: 0 }]}>
                        <defs>
                          <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} opacity={0.5} />
                        <XAxis dataKey="month" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                        <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                            borderRadius: '8px'
                          }}
                        />
                        <Area type="monotone" dataKey="rent" stroke="#4f46e5" fill="url(#colorRent)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Property Distribution</h3>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={housesStatus.length > 0 ? housesStatus : [
                            { name: 'Houses', value: stats.houses || 0 },
                            { name: 'Plots', value: stats.plots || 0 },
                            { name: 'Rentals', value: stats.rentals || 0 }
                          ]}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={index} fill={color} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Monthly Activity</h3>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <BarChart data={monthlyData.length > 0 ? monthlyData : [{ month: 'Jan', payments: 0 }, { month: 'Feb', payments: 0 }]}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} opacity={0.5} />
                        <XAxis dataKey="month" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                        <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="payments" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              {/* TABLE */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`p-6 rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
                    <p className="text-sm text-gray-500">Latest admin notifications</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${localNotifications.length > 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                    {localNotifications.length} notifications
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-200 dark:border-gray-700">
                        <th className="p-4 font-medium">Type</th>
                        <th className="p-4 font-medium">Message</th>
                        <th className="p-4 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localNotifications.length > 0 ? (
                        localNotifications.map((notif, idx) => (
                          <motion.tr
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="p-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                notif.type === 'propertyAdded' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                notif.type === 'propertyUpdated' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                notif.type === 'propertyDeleted' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                notif.type === 'tourRequestCreated' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                {notif.type?.replace(/([A-Z])/g, ' $1').trim() || 'Notification'}
                              </span>
                            </td>
                            <td className="p-4 text-gray-900 dark:text-gray-100">{notif.message || 'New notification'}</td>
                            <td className="p-4 text-gray-500">
                              {notif.timestamp ? new Date(notif.timestamp).toLocaleString() : 'Just now'}
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-8 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                              <Bell className="w-8 h-8 opacity-50" />
                              <span>No notifications yet</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

/* Sidebar Item (Copied from AdmHouses) */
function SidebarItem({ to = '#', icon, text, collapsed, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-xl text-sm text-gray-100 hover:bg-white/10 transition-all duration-200 
        ${collapsed ? 'justify-center' : ''} 
        ${active ? 'bg-gradient-to-r from-blue-600 to-teal-500 shadow-lg shadow-blue-500/30' : ''}`
      }
    >
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10">
        {icon}
      </div>
      {!collapsed && <span className="font-medium">{text}</span>}
    </Link>
  );
}

/* Enhanced Stat Card with Icon and Animation */
function StatCard({ title, value, icon, color, bg }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className={`p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 ${bg}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg">
          <span className="text-white">{icon}</span>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
        </div>
      </div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</div>
    </motion.div>
  );
}

/* Legacy MiniStat - kept for compatibility */
function MiniStat({ title, value }) {
  return (
    <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-800">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-bold mt-2">{value}</div>
    </div>
  );
}

export default AdminDashboard;
