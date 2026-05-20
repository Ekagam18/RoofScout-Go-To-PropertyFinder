// src/pages/StatesPG.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../utils/axiosConfig";

/**
 * StatesPG page - Shows only PG type properties for a specific state
 * - Fetches from backend: GET /api/properties?state=...&type=pg
 * - Filters to show ONLY pg properties
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
  { id: "lt5", label: "Below ₹5k/month", min: 0, max: 5000 },
  { id: "5-10", label: "₹5k – ₹10k/month", min: 5000, max: 10000 },
  { id: "10-20", label: "₹10k – ₹20k/month", min: 10000, max: 20000 },
  { id: "gt20", label: "Above ₹20k/month", min: 20000, max: null }
];

const AREA_PRESETS = [
  { id: "all", label: "All Areas", min: null, max: null },
  { id: "lt200", label: "Below 200 sq ft", min: 0, max: 200 },
  { id: "200-500", label: "200 – 500 sq ft", min: 200, max: 500 },
  { id: "500-1000", label: "500 – 1000 sq ft", min: 500, max: 1000 },
  { id: "gt1000", label: "Above 1000 sq ft", min: 1000, max: null }
];

function getBadgeGradient() {
  return "from-purple-500 to-pink-500";
}

function getIcon() {
  return "🛏️";
}

export default function StatesPG() {
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
    const params = { type: "pg" };
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

        // Filter only PG properties
        props = props.filter((p) => (p.type || "").toLowerCase() === "pg");

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
        console.error("Error fetching PG properties:", err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [backendParams, stateKey, filters.minArea, filters.maxArea, filters.minPrice, filters.maxPrice, filters.pricePreset]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Hero */}
        <div className="relative bg-purple-600 dark:bg-pink-600 py-12 px-6 text-center">
          <h1 className="text-4xl font-extrabold text-white">
            PG & Co-living in <span className="text-yellow-400">{rawState}</span>
          </h1>
          <p className="text-purple-100 mt-2">{properties.length} PG listings found</p>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white/90 dark:bg-gray-800/80 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
            <select value={filters.pricePreset} onChange={handlePricePresetChange} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-700">
              {PRICE_PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>

            <select value={filters.areaPreset} onChange={handleAreaPresetChange} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-700">
              {AREA_PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>

            <select value={sortType} onChange={(e) => setSortType(e.target.value)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-700 ml-auto">
              <option value="none">Sort: Default</option>
              <option value="low">Rent: Low → High</option>
              <option value="high">Rent: High → Low</option>
              <option value="area">Area: Low → High</option>
            </select>

            <div className="ml-4 text-sm text-gray-600 dark:text-gray-300">Showing {paginated.length} of {properties.length}</div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && (
              <div className="col-span-full text-center py-12 text-gray-500">Loading PG listings…</div>
            )}

            {!loading && paginated.length === 0 && (
              <div className="col-span-full text-center py-24">
                <div className="text-7xl opacity-30">🏚️</div>
                <p className="text-xl font-semibold text-gray-400 mt-4">No PG found in {rawState}</p>
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
                    {getIcon()} PG
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
                    className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-purple-600 hover:bg-purple-500 dark:bg-pink-500 dark:hover:bg-pink-400 transition"
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
                  <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-sm font-bold ${p === page ? "bg-purple-600 dark:bg-pink-500 text-white" : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300"}`}>{p}</button>
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
