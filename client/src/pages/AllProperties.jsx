import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../utils/axiosConfig";

const TYPE_META = {
  all: { label: "All", icon: "🏘️", color: "from-gray-500 to-slate-500" },
  plot: { label: "Plot / Land", icon: "🌿", color: "from-green-500 to-teal-500" },
  flat: { label: "Flat / Apartment", icon: "🏢", color: "from-blue-500 to-cyan-500" },
  "builder-floor": { label: "Builder Floor", icon: "🏗️", color: "from-orange-500 to-amber-500" },
  villa: { label: "Villa / House", icon: "🏡", color: "from-purple-500 to-pink-500" },
  rent: { label: "Rent", icon: "🔑", color: "from-indigo-500 to-violet-500" },
  pg: { label: "PG / Co-living", icon: "🛏️", color: "from-rose-500 to-pink-500" },
};

function getBadgeColor(type) {
  return TYPE_META[type]?.color || "from-gray-500 to-slate-500";
}
function getIcon(type) {
  return TYPE_META[type]?.icon || "🏠";
}

function AllProperties() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ type: "all", price: "all" });
  const [sortType, setSortType] = useState("none");
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 6;

  // Fetch all properties from backend
  useEffect(() => {
    const fetchAllProperties = async () => {
      setLoading(true);
      try {
        const { data } = await API.get("/properties");
        const properties = data.properties || [];
        
        const mapped = properties.map(prop => ({
          id: prop._id,
          title: prop.title || "Untitled Property",
          priceText: prop.price ? `₹${Number(prop.price).toLocaleString("en-IN")}` : "Price on request",
          price: Number(prop.price) || 0,
          area: Number(prop.area) || 0,
          type: prop.type || "house",
          image: (prop.images && prop.images.length > 0) ? prop.images[0] : (prop.image || null),
          location: prop.location || prop.state || "",
          beds: prop.beds || "",
          baths: prop.baths || "",
          description: prop.description || "",
        }));

        setAllProperties(mapped);
        setFilteredProperties(mapped);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setAllProperties([]);
        setFilteredProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProperties();
  }, []);

  const applyFilters = () => {
    let filtered = allProperties.filter((prop) => {
      const matchType = filters.type === "all" || prop.type === filters.type;
      let matchPrice = true;
      const p = prop.price;
      switch (filters.price) {
        case "1": matchPrice = p < 5000000; break;
        case "2": matchPrice = p >= 5000000 && p < 20000000; break;
        case "3": matchPrice = p >= 20000000 && p < 50000000; break;
        case "4": matchPrice = p >= 50000000; break;
        default: matchPrice = true;
      }
      return matchType && matchPrice;
    });
    setPage(1);
    setFilteredProperties(filtered);
  };

  const clearFilters = () => {
    setFilters({ type: "all", price: "all" });
    setSortType("none");
    setFilteredProperties(allProperties);
    setPage(1);
  };

  const sortData = (data) => {
    if (sortType === "low") return [...data].sort((a, b) => a.price - b.price);
    if (sortType === "high") return [...data].sort((a, b) => b.price - a.price);
    if (sortType === "area") return [...data].sort((a, b) => a.area - b.area);
    return data;
  };

  const sortedData = sortData(filteredProperties);
  const startIndex = (page - 1) * perPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + perPage);
  const totalPages = Math.ceil(sortedData.length / perPage);

  const selectCls =
    "w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 " +
    "bg-white dark:bg-gray-700/70 text-gray-800 dark:text-gray-100 " +
    "focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 " +
    "focus:ring-2 focus:ring-blue-500/20 transition-all text-sm";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">

        {/* ── HERO BANNER ── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 py-12 px-6">
          {/* decorative blobs */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

          <div className="relative max-w-6xl mx-auto text-center">
            <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold mb-2">RoofScout — Property Explorer</p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
              Browse <span className="text-yellow-400">All Properties</span>
            </h1>
            <p className="text-blue-100/80 mt-3 text-base md:text-lg">
              {allProperties.length} listings — find your perfect match
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* ── FILTER BAR ── */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-5 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Property Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className={selectCls}
                >
                  <option value="all">🏘️ All Types</option>
                  <option value="plot">🌿 Plot / Land</option>
                  <option value="flat">🏢 Flat / Apartment</option>
                  <option value="builder-floor">🏗️ Builder Floor</option>
                  <option value="villa">🏡 Villa / House</option>
                  <option value="rent">🔑 Rent</option>
                  <option value="pg">🛏️ PG / Co-living</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Price Range</label>
                <select
                  value={filters.price}
                  onChange={(e) => setFilters({ ...filters, price: e.target.value })}
                  className={selectCls}
                >
                  <option value="all">💰 All Prices</option>
                  <option value="1">Below ₹50 Lacs</option>
                  <option value="2">₹50 Lacs – ₹2 Cr</option>
                  <option value="3">₹2 Cr – ₹5 Cr</option>
                  <option value="4">Above ₹5 Cr</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Sort By</label>
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                  className={selectCls}
                >
                  <option value="none">⚡ Default</option>
                  <option value="low">Price: Low → High</option>
                  <option value="high">Price: High → Low</option>
                  <option value="area">Area: Low → High</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 text-sm"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all text-sm border border-gray-200 dark:border-gray-600"
                >
                  Clear
                </button>
              </div>

            </div>

            {/* Result count */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-bold text-gray-800 dark:text-white">{filteredProperties.length}</span> properties
              </p>
            </div>
          </div>

          {/* ── LOADING ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Loading properties…</p>
            </div>
          )}

          {/* ── PROPERTY GRID ── */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedData.map((prop, idx) => (
                <div
                  key={prop.id || idx}
                  className="group bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                    {prop.image ? (
                      <img
                        src={prop.image}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl opacity-40">
                        {getIcon(prop.type)}
                      </div>
                    )}

                    {/* Type badge */}
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getBadgeColor(prop.type)} shadow-md`}>
                      {getIcon(prop.type)} {TYPE_META[prop.type]?.label || prop.type.toUpperCase()}
                    </div>

                    {/* Price badge */}
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white text-sm font-extrabold shadow-lg">
                      {prop.priceText}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h2 className="text-base font-bold text-gray-800 dark:text-white leading-snug line-clamp-2 mb-1">
                      {prop.title}
                    </h2>

                    {prop.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-3">
                        📍 {prop.location}
                      </p>
                    )}

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {prop.area > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-800/50">
                          📐 {prop.area} sq ft
                        </span>
                      )}
                      {prop.beds && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full border border-purple-100 dark:border-purple-800/50">
                          🛏️ {prop.beds} Bed
                        </span>
                      )}
                      {prop.baths && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-100 dark:border-cyan-800/50">
                          🚿 {prop.baths} Bath
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/viewdetail/${prop.id}`)}
                      className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[.98] transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                      View Details <span>→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── NO RESULTS ── */}
          {!loading && paginatedData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="text-7xl opacity-30">🏚️</div>
              <p className="text-xl font-semibold text-gray-400 dark:text-gray-500">No properties found</p>
              <p className="text-sm text-gray-400 dark:text-gray-600">Try adjusting your filters</p>
              <button onClick={clearFilters} className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all">
                Clear Filters
              </button>
            </div>
          )}

          {/* ── PAGINATION ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 my-8">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                ← Prev
              </button>

              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${p === page
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30"
                      : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next →
              </button>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}

export default AllProperties;
