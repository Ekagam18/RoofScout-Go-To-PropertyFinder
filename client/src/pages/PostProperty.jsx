import { useTheme } from '../hooks/useTheme';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import API from '../utils/axiosConfig';

// ── Per-option content ────────────────────────────────────────────────────────
const OPTION_CONTENT = {
  sell: {
    icon: '🏡',
    headline: 'Sell Your Property',
    tagline: 'Get the best value for your property',
    bullets: [
      { icon: '✦', text: 'Zero listing fees — advertise for FREE' },
      { icon: '✦', text: 'Connect with thousands of genuine buyers' },
      { icon: '✦', text: 'Professional assistance for site visits' },
      { icon: '✦', text: 'Fast deals with verified purchasers' },
    ],
    badge: 'Most Popular',
    badgeColor: 'from-orange-400 to-yellow-400',
    accentColor: 'from-orange-500 to-yellow-400',
    borderColor: 'border-orange-400/50',
  },
  rent: {
    icon: '🏠',
    headline: 'Rent Out Your Property',
    tagline: 'Find the perfect tenant hassle-free',
    bullets: [
      { icon: '✦', text: 'List your property in minutes' },
      { icon: '✦', text: 'Reach verified tenants actively searching' },
      { icon: '✦', text: 'Flexible lease options for every need' },
      { icon: '✦', text: 'Secure monthly rental income' },
    ],
    badge: 'Quick Listings',
    badgeColor: 'from-blue-500 to-cyan-400',
    accentColor: 'from-blue-600 to-cyan-400',
    borderColor: 'border-blue-400/50',
  },
  pg: {
    icon: '🛏️',
    headline: 'List Your PG / Co-Living',
    tagline: 'Fill your beds faster with quality tenants',
    bullets: [
      { icon: '✦', text: 'Reach students, professionals & travelers' },
      { icon: '✦', text: 'Showcase amenities — food, WiFi, AC & more' },
      { icon: '✦', text: 'Flexible single, double & triple sharing' },
      { icon: '✦', text: 'Zero commission on every booking' },
    ],
    badge: 'New Feature',
    badgeColor: 'from-purple-500 to-pink-400',
    accentColor: 'from-purple-600 to-pink-400',
    borderColor: 'border-purple-400/50',
  },
};
const OPTIONS = ['sell', 'rent', 'pg'];

function PostProperty() {
  const [selectedPage, setSelectedPage] = useState('sell');
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();

  // ── Auto-cycle through tabs ─────────────────────────────────────────────
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setSelectedPage(prev => {
        const idx = OPTIONS.indexOf(prev);
        return OPTIONS[(idx + 1) % OPTIONS.length];
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [paused]);

  // Manual tab click — pauses auto-cycle for 8 s then resumes
  const handleTabClick = (key) => {
    setSelectedPage(key);
    setPaused(true);
    setTimeout(() => setPaused(false), 8000);
  };

  // ── Dark Mode ───────────────────────────────────────────────────────────────
  const [theme, setTheme] = useTheme();



  // ── Auth-aware navigation ───────────────────────────────────────────────────
  const handleStart = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate(`/login?redirect=${selectedPage}`);
      return;
    }
    navigate(`/${selectedPage}`);
  };

  const content = OPTION_CONTENT[selectedPage];

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">

      {/* ── BG IMAGE ─────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: "url('/housescover_copy.jpg?v=2')" }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/60" />
      {/* Dark mode extra tint */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${theme === 'dark' ? 'bg-black/40 opacity-100' : 'opacity-0'}`} />

      {/* ── NAVBAR ───────────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 md:px-12">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logoRS.jpg" className="h-10 w-10 rounded-full shadow-lg ring-2 ring-white/30" alt="RoofScout" />
          <h1 className="text-xl font-extrabold tracking-tight">
            <span className="text-yellow-500">Roof</span>
            <span className="text-teal-400">Scout</span>
          </h1>
        </Link>

        <button
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-lg"
        >
          {theme === 'dark'
            ? <><Sun size={16} className="text-yellow-300" /> Light Mode</>
            : <><Moon size={16} /> Dark Mode</>
          }
        </button>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      {/* Added animate-fade-in-up so the whole content block slides up on load */}
      <main className="relative z-10 flex items-center justify-start min-h-[calc(100vh-72px)] px-8 md:px-16 py-12 animate-fade-in-up">
        <div className="w-full max-w-5xl ml-0">

          {/* Hero text */}
          <div className="text-left mb-10">
            <p className="text-white/70 uppercase tracking-widest text-xs mb-2 font-semibold">RoofScout — Owner Portal</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-xl">
              List Your Property,<br />
              <span className={`bg-gradient-to-r ${content.accentColor} bg-clip-text text-transparent transition-all duration-500`}>
                Reach Millions
              </span>
            </h2>
            <p className="text-white/70 mt-3 text-lg">No fees. No hassle. Just results.</p>
          </div>

          {/* ── CARD ─────────────────────────────────────────────────────────── */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">

            {/* Option Tabs — speech-bubble pill style */}
            <div className="flex border-b border-white/10">
              {Object.entries(OPTION_CONTENT).map(([key, val]) => {
                const isActive = selectedPage === key;
                const label = key === 'pg' ? 'PG / Co-living' : key.charAt(0).toUpperCase() + key.slice(1);
                return (
                  <button
                    key={key}
                    onClick={() => handleTabClick(key)}
                    className={`group flex-1 py-5 flex flex-col items-center gap-0 transition-all duration-300
                      ${isActive ? 'bg-white/15' : 'hover:bg-white/5'}`}
                  >
                    {/* Icon */}
                    <span className="text-xl mb-2">{val.icon}</span>

                    {/* Pill with downward caret — visible on active OR hover */}
                    <div className="relative flex flex-col items-center">
                      {/* Pill label */}
                      <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all duration-300
                        ${isActive
                          ? 'bg-white text-gray-900 shadow-lg'
                          : 'bg-white/10 text-white/50 group-hover:bg-white/20 group-hover:text-white'
                        }`}>
                        {label}
                      </span>

                      {/* Downward caret — speech bubble arrow */}
                      <span className={`mt-0.5 transition-all duration-300 text-[10px] leading-none
                        ${isActive ? 'opacity-100 translate-y-0 text-white' : 'opacity-0 -translate-y-1 group-hover:opacity-70 group-hover:translate-y-0 text-white'}`}>
                        ▼
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Content area */}
            {selectedPage === 'sell' ? (
              <div className="p-8 md:p-10 grid md:grid-cols-2 gap-8 items-stretch min-h-[450px]">
                {/* ── CARD 1: SELL DIRECTLY ── */}
                <div
                  onClick={handleStart}
                  className="bg-white/5 hover:bg-white/15 border border-orange-400/50 hover:border-orange-400 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-md group cursor-pointer shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-400 to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-lg z-10">New feature</div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform">⚡</div>
                    <h3 className="text-2xl font-extrabold text-white mb-1">Sell Directly<br /><span className="text-orange-400 font-medium text-lg leading-tight block mt-1">Instant Cash Offer</span></h3>
                    <p className="text-white/70 leading-relaxed text-sm mt-2 mb-4">Skip the wait, showings, and negotiations. Get a competitive cash offer within 48 hours.</p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center gap-2 text-white/80 text-sm"><span className="text-orange-400 font-bold">✓</span> Close in 7 days</li>
                      <li className="flex items-center gap-2 text-white/80 text-sm"><span className="text-orange-400 font-bold">✓</span> Zero repairs needed</li>
                    </ul>
                  </div>
                  <button className="mt-6 w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 relative z-10 active:scale-95">
                    Start Right Now <span>→</span>
                  </button>
                </div>

                {/* ── CARD 2: LIST ON ROOFSCOUT ── */}
                <div
                  onClick={handleStart}
                  className="bg-white/5 hover:bg-white/15 border border-blue-400/50 hover:border-blue-400 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-md group cursor-pointer shadow-xl relative"
                >
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-400 to-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-lg z-10">Popular</div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform">🏡</div>
                    <h3 className="text-2xl font-extrabold text-white mb-1">List Property<br /><span className="text-blue-400 font-medium text-lg leading-tight block mt-1">Find Buyers</span></h3>
                    <p className="text-white/70 leading-relaxed text-sm mt-2 mb-4">List your property on our platform to reach thousands of genuine buyers and get the best market value.</p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center gap-2 text-white/80 text-sm"><span className="text-blue-400 font-bold">✓</span> Reaches millions</li>
                      <li className="flex items-center gap-2 text-white/80 text-sm"><span className="text-blue-400 font-bold">✓</span> Direct buyer contact</li>
                    </ul>
                  </div>
                  <button className="mt-6 w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 relative z-10 active:scale-95">
                    List for Free <span>→</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 md:p-10 grid md:grid-cols-2 gap-10 items-center">

                {/* Left — description */}
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${content.accentColor} bg-clip-text text-transparent transition-all duration-500`}>
                      {content.headline}
                    </h3>
                    <p className="text-white/60 mt-2 text-base">{content.tagline}</p>
                  </div>

                  <ul className="space-y-3">
                    {content.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/80">
                        <span className={`mt-0.5 text-sm font-black bg-gradient-to-r ${content.accentColor} bg-clip-text text-transparent flex-shrink-0`}>
                          {b.icon}
                        </span>
                        <span className="text-sm md:text-base leading-relaxed">{b.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Trust bar */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-white text-xl font-extrabold">10K+</p>
                      <p className="text-white/50 text-xs">Active Listings</p>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <div className="text-center">
                      <p className="text-white text-xl font-extrabold">₹0</p>
                      <p className="text-white/50 text-xs">Listing Fee</p>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <div className="text-center">
                      <p className="text-white text-xl font-extrabold">48h</p>
                      <p className="text-white/50 text-xs">Avg. Response</p>
                    </div>
                  </div>
                </div>

                {/* Right — CTA panel */}
                <div className={`bg-white/10 border ${content.borderColor} rounded-2xl p-6 md:p-8 space-y-6 backdrop-blur-sm`}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${content.accentColor} flex items-center justify-center text-3xl shadow-lg`}>
                    {content.icon}
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-lg">
                      Ready to {selectedPage === 'sell' ? 'sell' : selectedPage === 'rent' ? 'rent out' : 'list your PG'}?
                    </h4>
                    <p className="text-white/60 text-sm mt-1">
                      {selectedPage === 'sell' && 'You\'ll be redirected to our property form to add your details and photos.'}
                      {selectedPage === 'rent' && 'Fill in your rental details, pricing, and amenities to attract tenants.'}
                      {selectedPage === 'pg' && 'Add your PG name, sharing types, amenities and pricing in minutes.'}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-white/50">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-base">✓</span> Takes less than 5 minutes
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-base">✓</span> Completely free — no hidden charges
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-base">✓</span> Visible to thousands of seekers
                    </div>
                  </div>

                  <button
                    onClick={handleStart}
                    className={`w-full py-4 rounded-xl font-bold text-white text-base bg-gradient-to-r ${content.accentColor} hover:opacity-90 active:scale-[.98] transition-all duration-200 shadow-xl flex items-center justify-center gap-2`}
                  >
                    Start Listing for Free
                    <span className="text-lg">→</span>
                  </button>

                  <p className="text-center text-white/30 text-xs">
                    By continuing, you agree to our{' '}
                    <span className="underline cursor-pointer text-white/50 hover:text-white">Terms of Service</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom nav links */}
          <p className="text-center text-white/40 text-sm mt-6">
            Looking to buy or rent?{' '}
            <Link to="/allproperties" className="text-white/70 underline hover:text-white transition-colors">
              Browse all properties
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default PostProperty;