import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../utils/axiosConfig";

/**
 * StatesRent page - Shows only RENT type properties for a specific state
 * - Fetches from backend: GET /api/properties?state=...&type=rent
 * - Filters to show ONLY rent properties
 */

const STATE_MAP = {
  punjab: ["punjab", "mohali", "ludhiana", "amritsar", "jalandhar", "patiala", "bathinda", "barnala"],
  haryana: ["haryana", "gurgaon", "gurugram", "faridabad", "panipat", "ambala", "hisar", "karnal", "rohtak", "sonipat"],
  delhi: ["delhi", "new delhi", "noida", "gurgaon", "faridabad"],
  rajasthan: ["rajasthan", "jaipur", "udaipur", "jodhpur", "ajmer", "alwar", "kota", "bikaner"],
  uttarpradesh: ["uttar pradesh", "up", "lucknow", "kanpur", "agra", "varanasi", "noida", "ghaziabad"],
};

const PRICE_PRESETS = [
  { id: "all", label: "All Prices", min: null, max: null },
  { id: "lt15", label: "Below ₹15k/month", min: 0, max: 15000 },
  { id: "15-30", label: "₹15k – ₹30k/month", min: 15000, max: 30000 },
  { id: "30-50", label: "₹30k – ₹50k/month", min: 30000, max: 50000 },
  { id: "gt50", label: "Above ₹50k/month", min: 50000, max: null }
];

const AREA_PRESETS = [
  { id: "all", label: "All Areas", min: null, max: null },
  { id: "lt500", label: "Below 500 sq ft", min: 0, max: 500 },
  { id: "500-1000", label: "500 – 1000 sq ft", min: 500, max: 1000 },
  { id: "1000-2000", label: "1000 – 2000 sq ft", min: 1000, max: 2000 },
  { id: "gt2000", label: "Above 2000 sq ft", min: 2000, max: null }
];

function getBadgeGradient() {
  return "from-green-500 to-teal-500";
}

function getIcon() {
  return "🔑";
}

export default function StatesRent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawState = searchParams.get("state") || "Punjab";
  const stateKey = rawState.toLowerCase();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    pricePreset: "all",
    areaPreset: "all"
  });
  const [sortType, setSortType] = useState("none");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const backendParams = useMemo(() => {
    const params = { type: "rent" }; // Always fetch rent type
    if (stateKey) params.state = stateKey;

    const pricePreset = PRICE_PRESETS.find(p => p.id === filters.pricePreset);
    if (pricePreset && pricePreset.id !== "all") {
      if (pricePreset.min !== null) params.minPrice = pricePreset.min;
      if (pricePreset.max !== null) params.maxPrice = pricePreset.max;
    }

    return params;
  }, [stateKey, filters]);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const { data } = await API.get("/properties", { params: backendParams });
        let props = data.properties || [];

        // Filter only RENT properties
        props = props.filter((p) => (p.type || "").toLowerCase() === "rent");

        // Client-side state matching
        if (stateKey) {
          const aliases = STATE_MAP[stateKey] || [stateKey];
          props = props.filter((p) => {
            const pState = (p.state || "").toLowerCase();
            const pLoc = (p.location || "").toLowerCase();
            const stateMatch = pState.includes(stateKey) || pLoc.includes(stateKey);
            const aliasMatch = aliases.some(a => pLoc.includes(a));
            return stateMatch || aliasMatch;
          });
        }

        // Apply area filter client-side using preset
        const areaPreset = AREA_PRESETS.find(p => p.id === filters.areaPreset);
        if (areaPreset && areaPreset.id !== "all") {
          props = props.filter((p) => {
            const area = Number(p.area || 0);
            if (areaPreset.min !== null && area < areaPreset.min) return false;
            if (areaPreset.max !== null && area > areaPreset.max) return false;
            return true;
          });
        }

        setProperties(props);
        setPage(1);
      } catch (err) {
        console.error("Error fetching rent properties:", err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [backendParams, stateKey, filters.areaPreset]);

  const sorted = useMemo(() => {
    if (!properties) return [];
    if (sortType === "low") return [...properties].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortType === "high") return [...properties].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sortType === "area") return [...properties].sort((a, b) => (a.area || 0) - (b.area || 0));
    return properties;
  }, [properties, sortType]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const handlePricePresetChange = (e) => setFilters(f => ({ ...f, pricePreset: e.target.value }));
  const handleAreaPresetChange = (e) => setFilters(f => ({ ...f, areaPreset: e.target.value }));

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Hero */}
        <div className="relative bg-green-600 dark:bg-teal-600 py-12 px-6 text-center">
          <h1 className="text-4xl font-extrabold text-white">
            Rentals in <span className="text-yellow-400">{rawState}</span>
          </h1>
          <p className="text-green-100 mt-2">{properties.length} rental listings found</p>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Price Range</label>
                <select value={filters.pricePreset} onChange={handlePricePresetChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/70 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm">
                  {PRICE_PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Area Range</label>
                <select value={filters.areaPreset} onChange={handleAreaPresetChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/70 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm">
                  {AREA_PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Sort By</label>
                <select value={sortType} onChange={(e) => setSortType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/70 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm">
                  <option value="none">⚡ Default</option>
                  <option value="low">Rent: Low → High</option>
                  <option value="high">Rent: High → Low</option>
                  <option value="area">Area: Low → High</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFilters({ pricePreset: 'all', areaPreset: 'all' });
                    setPage(1);
                  }}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 text-sm"
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    setFilters({ pricePreset: 'all', areaPreset: 'all' });
                    setSortType('none');
                    setPage(1);
                  }}
                  className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all text-sm border border-gray-200 dark:border-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Result count */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-bold text-gray-800 dark:text-white">{paginated.length}</span> of <span className="font-bold text-gray-800 dark:text-white">{properties.length}</span> rentals
              </p>
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && (
              <div className="col-span-full text-center py-12 text-gray-500">Loading rentals…</div>
            )}

            {!loading && paginated.length === 0 && (
              <div className="col-span-full text-center py-24">
                <div className="text-7xl opacity-30">🏚️</div>
                <p className="text-xl font-semibold text-gray-400 mt-4">No rentals found in {rawState}</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting filters or search another state.</p>
              </div>
            )}

            {!loading && paginated.map((p) => (
              <div key={p._id} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-md hover:shadow-xl transition overflow-hidden">
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-40">🏠</div>
                  )}

                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getBadgeGradient()} shadow-md`}>
                    {getIcon()} RENT
                  </div>

                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white text-sm font-extrabold shadow-lg">
                    ₹{Number(p.price || 0).toLocaleString()}/month
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="text-base font-bold text-gray-800 dark:text-white leading-snug line-clamp-2 mb-1">{p.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">📍 {p.location}{p.state ? `, ${p.state}` : ""}</p>
                  {p.area > 0 && <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">📐 {p.area} sq ft</p>}
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">{p.description}</p>

                  <button
                    onClick={() => navigate(`/viewdetail/${p._id}`)}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 dark:bg-teal-500 dark:hover:bg-teal-400 transition"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 my-8">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-700 border text-gray-700 dark:text-gray-200 disabled:opacity-40">← Prev</button>
              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-sm font-bold ${p === page ? "bg-green-600 dark:bg-teal-500 text-white" : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300"}`}>{p}</button>
                ))}
              </div>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-700 border text-gray-700 dark:text-gray-200 disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}