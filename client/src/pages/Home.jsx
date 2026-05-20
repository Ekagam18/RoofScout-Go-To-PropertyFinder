import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { useAuth } from "../contexts/AuthContext";
import {
  Home as HomeIcon,
  Building,
  MapPin,
  ArrowRight,
  Check,
  Star,
  Quote,
  IndianRupee,
} from "lucide-react";

/* ─── PROPERTIES DATA ─────────────────────────────────────────────── */
const properties = [
  {
    id: "P001",
    title: "405 Lock House",
    location: "Goa, India",
    price: "₹85 Lakhs",
    type: "3 BHK Villa",
    tag: "For Sale",
    image: "/homehouse1.jpg",
  },
  {
    id: "P002",
    title: "308 Ganga Sagar",
    location: "Nashik, India",
    price: "₹25,000/month",
    type: "2 BHK Apartment",
    tag: "For Rent",
    image: "/homehouse2.jpg",
  },
  {
    id: "P003",
    title: "566, 3BHK House",
    location: "Delhi, India",
    price: "₹1.2 Cr",
    type: "3 BHK House",
    tag: "New Listing",
    image: "/homehouse3.jpg",
  },
];

/* ─── SERVICES DATA ───────────────────────────────────────────────── */
const services = [
  {
    icon: HomeIcon,
    title: "Easy Buying Process",
    desc: "Find verified properties with transparent pricing and easy EMI options.",
    items: ["Verified properties", "Transparent pricing", "Easy EMI options"],
    color: "yellow",
  },
  {
    icon: Building,
    title: "Easy Rental Process",
    desc: "Quick and convenient renting with verified landlords and secure agreements.",
    items: ["Convenient renting", "Verified landlords", "Secure agreements"],
    color: "blue",
  },
  {
    icon: IndianRupee,
    title: "Easy Selling Process",
    desc: "Reach thousands of buyers with optimized listings and expert support.",
    items: ["Thousands of buyers", "Optimized listings", "Expert support"],
    color: "green",
  },
];

/* ─── TESTIMONIALS DATA ───────────────────────────────────────────── */
const testimonials = [
  {
    text: "Don't let little things stop you from moving forward. Stay focused, stay consistent, and you'll overcome challenges. RoofScout made our home buying journey incredibly smooth.",
    name: "Palbo & Emma",
    role: "Homeowners, Goa",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    text: "RoofScout made buying our first home so smooth! Highly professional and trustworthy service. The team was incredibly helpful throughout the entire process.",
    name: "Riya & Manish",
    role: "First-time Buyers, Delhi",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    text: "The rental process was simple and quick. Found the perfect home in just 2 days! The platform is intuitive and the support team is very responsive.",
    name: "Sagar Verma",
    role: "Tenant, Mumbai",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
  },
];

/* ─── STATS DATA ──────────────────────────────────────────────────── */
const stats = [
  { label: "Homes Provided", value: 5000, suffix: "+" },
  { label: "Cities Covered", value: 120, suffix: "+" },
  { label: "Happy Buyers", value: 200, suffix: "+" },
];

/* ─── ANIMATION VARIANTS ──────────────────────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

/* ─── MAIN HOME COMPONENT ─────────────────────────────────────────── */
export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countersActive, setCountersActive] = useState(false);
  const counterRef = useRef(null);
  const navigate = useNavigate();

  // AUTH STATE
  const { isAuthenticated, user } = useAuth();
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Use AuthContext instead of localAuth
    if (isAuthenticated && user) {
      setSession({ user });
    } else {
      setSession(null);
    }
  }, [isAuthenticated, user]);

  const handleGetStartedClick = (e) => {
    e.preventDefault();
    // Check auth using localStorage (JWT based)
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "admin") navigate("/AdminDashboard");
      else navigate("/userdashboard");
    } else {
      navigate("/login");
    }
  };

  const handleAdminClick = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "admin") navigate("/AdminDashboard");
      else navigate("/userdashboard");
    } else {
      navigate("/login");
    }
  };

  /* AUTO SLIDER FOR TESTIMONIALS */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* COUNTER VISIBILITY OBSERVER */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCountersActive(true);
        }
      },
      { threshold: 0.3 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <Navbar />

      <main className="flex-1">
        {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-8 pb-20 px-4 sm:px-6 lg:px-8">
          {/* Background Decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-400/10 dark:bg-yellow-400/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-400/5 to-blue-500/5 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
              {/* Left Content */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="text-center lg:text-left"
              >
                <motion.div variants={fadeInUp} className="mb-4">
                  <span className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold">
                    <Star className="w-4 h-4" />
                    Your Property Companion
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight"
                >
                  Find Your
                  <span className="block text-blue-600 dark:text-teal-400 mt-2">
                    Dream Home
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="mt-6 text-gray-600 dark:text-gray-300 text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed"
                >
                  Rent, Sell, Purchase — Simplifying property discovery and
                  management with an intuitive platform designed for modern
                  living.
                </motion.p>

                <motion.div
                  variants={fadeInUp}
                  className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <button
                    onClick={handleGetStartedClick}
                    className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-all duration-300 hover:-translate-y-1"
                  >
                    Get Started — Free
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>

                <motion.p
                  variants={fadeInUp}
                  className="mt-8 text-gray-500 dark:text-gray-400 italic text-sm"
                >
                  "The best platform I've used for finding rental properties.
                  Simple, fast, and reliable."
                </motion.p>
              </motion.div>

              {/* Right Content - Device Mockups with Floating Effect */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: [0, -15, 0]
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                  y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="relative hidden lg:block"
              >
                {/* Desktop Mockup */}
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-md mx-auto">
                  {/* Browser Header */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        roofscout.com
                      </span>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-800 dark:text-white">
                        Dashboard
                      </span>
                      <span className="text-xs text-gray-500">Welcome back!</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { num: "518", label: "Houses", color: "text-yellow-500" },
                        { num: "120", label: "Locations", color: "text-blue-500" },
                        { num: "24", label: "Saved", color: "text-green-500" },
                      ].map((stat, i) => (
                        <div
                          key={i}
                          className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm"
                        >
                          <div className={`text-2xl font-bold ${stat.color}`}>
                            {stat.num}
                          </div>
                          <div className="text-xs text-gray-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 mb-2">Recent Activity</div>
                      {[
                        { color: "bg-yellow-100 dark:bg-yellow-400/20", text: "New listing in Goa" },
                        { color: "bg-blue-100 dark:bg-blue-400/20", text: "Tour scheduled" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2 last:mb-0">
                          <div className={`w-8 h-8 rounded ${item.color}`}></div>
                          <div className="text-xs text-gray-700 dark:text-gray-300">
                            {item.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Phone Mockup */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotate: [-3, -2, -3]
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.6,
                    rotate: {
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  className="absolute -bottom-6 -left-8 w-40"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-2">
                    <div className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden">
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <div className="w-10 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                      </div>
                      <div className="p-2">
                        <div className="text-xs font-semibold text-gray-800 dark:text-white mb-2">
                          My Saved Homes
                        </div>
                        {[
                          { color: "bg-yellow-100 dark:bg-yellow-400/20", name: "Villa Goa" },
                          { color: "bg-blue-100 dark:bg-blue-400/20", name: "Apartment Delhi" },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded p-1.5 mb-1.5 last:mb-0"
                          >
                            <div className={`w-6 h-6 rounded ${item.color}`}></div>
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-xs text-yellow-500 dark:text-yellow-400 font-medium">
                      Your Property Buddy
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
          VIDEO SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={scaleIn}
              className="rounded-3xl overflow-hidden relative shadow-2xl"
            >
              <video
                className="w-full h-[50vh] sm:h-[60vh] object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/RSvideo.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-center justify-center">
                <div className="text-center">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold"
                  >
                    Discover homes with immersive tours
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-white/80 mt-4 text-lg"
                  >
                    Experience properties like never before
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
          STATS COUNTERS
        ═══════════════════════════════════════════════════════════════ */}
        <section
          ref={counterRef}
          className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-400 bg-clip-text text-transparent">
                    {countersActive && (
                      <CountUp end={stat.value} duration={2.5} separator="," />
                    )}
                    {stat.suffix}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-semibold mt-3 text-lg">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
          SERVICES SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative overflow-hidden">
          {/* Background Image - FIXED: Increased opacity for light mode visibility */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70 dark:opacity-60"
            style={{ backgroundImage: "url('/service.jpg')" }}
          ></div>

          <div className="max-w-7xl mx-auto relative">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <span className="text-yellow-500 dark:text-yellow-400 font-semibold tracking-wide uppercase text-sm">
                What We Offer
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mt-3">
                Our Services
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
                >
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${service.color === "yellow"
                      ? "bg-yellow-100 dark:bg-yellow-400/20"
                      : service.color === "blue"
                        ? "bg-blue-100 dark:bg-blue-400/20"
                        : "bg-green-100 dark:bg-green-400/20"
                      }`}
                  >
                    <service.icon
                      className={`w-8 h-8 ${service.color === "yellow"
                        ? "text-yellow-500"
                        : service.color === "blue"
                          ? "text-blue-500"
                          : "text-green-500"
                        }`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {service.desc}
                  </p>
                  <ul className="space-y-2">
                    {service.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
          PROPERTIES SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="flex flex-col sm:flex-row sm:items-end justify-between mb-12"
            >
              <div>
                <span className="text-yellow-500 dark:text-yellow-400 font-semibold tracking-wide uppercase text-sm">
                  Featured Listings
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2">
                  Our Properties
                </h2>
              </div>
              <Link
                to="/allproperties"
                className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-blue-600 dark:text-teal-400 font-semibold hover:gap-3 transition-all"
              >
                View All Properties
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                  className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative h-72 sm:h-80">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Tag */}
                    <div
                      className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${property.tag === "For Sale"
                        ? "bg-yellow-400 text-gray-900"
                        : property.tag === "For Rent"
                          ? "bg-blue-400 text-white"
                          : "bg-green-400 text-gray-900"
                        }`}
                    >
                      {property.tag}
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {property.title}
                      </h3>
                      <p className="text-white/80 text-sm flex items-center gap-1 mb-3">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-400 font-bold text-lg">
                          {property.price}
                        </span>
                        <span className="text-white/70 text-sm">
                          {property.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <span className="text-yellow-500 dark:text-yellow-400 font-semibold tracking-wide uppercase text-sm">
                Testimonials
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mt-3">
                What Our Clients Say
              </h2>
            </motion.div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
                >
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={testimonials[currentIndex].image}
                      alt="Happy Client"
                      className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-2xl shadow-xl"
                    />
                    <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-xl shadow-lg">
                      Happy Client
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                    <Quote className="absolute -top-4 -left-4 w-12 h-12 text-yellow-400 opacity-50" />
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed italic mb-6 relative z-10">
                      "{testimonials[currentIndex].text}"
                    </p>
                    <div className="flex items-center gap-4">
                      <img
                        src={testimonials[currentIndex].avatar}
                        alt={testimonials[currentIndex].name}
                        className="w-14 h-14 rounded-full border-2 border-yellow-400"
                      />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {testimonials[currentIndex].name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {testimonials[currentIndex].role}
                        </div>
                      </div>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex gap-1 mt-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots Navigation */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentIndex
                      ? "bg-yellow-400 w-8"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-yellow-400/50"
                      }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
          CTA SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-800 dark:to-teal-700">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleIn}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of happy homeowners who found their perfect
              property with RoofScout. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStartedClick}
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Get Started Now — It's Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link
                to="/postproperty"
                className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold transition-all duration-300"
              >
                Post Your Property
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}