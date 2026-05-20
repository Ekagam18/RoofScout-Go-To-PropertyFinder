import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Home, DollarSign, MapPin, Building, Image as ImageIcon, Upload, ArrowRight, CheckCircle2, Users } from "lucide-react";

function Pg() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    state: "",
    district: "",
    type: "pg",
    area: "",
    beds: "",
    baths: "",
    garages: ""
  });

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { emit, connected } = useSocket();
  const { user } = useAuth();

  const [ownerName, setOwnerName] = useState("");
  useEffect(() => {
    const name = localStorage.getItem("name") || localStorage.getItem("username") || "";
    setOwnerName(name);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newImages = Array.from(files);
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      alert("Please provide title and price.");
      return;
    }
    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("district", formData.district);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("area", formData.area);
      formDataToSend.append("beds", formData.beds);
      formDataToSend.append("baths", formData.baths);
      formDataToSend.append("garages", formData.garages);
      formDataToSend.append("ownerName", ownerName);
      images.forEach((image) => {
        formDataToSend.append("images", image);
      });
      const { data } = await API.post("/properties/add", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (connected && data.success) {
        emit("propertyAdded", {
          title: formData.title,
          ownerName: ownerName,
          property: data.property,
        });
      }
      alert("PG listing submitted successfully!");
      const isAdmin = user?.role === 'admin' || localStorage.getItem('role') === 'admin';
      if (isAdmin) {
        navigate("/AdminDashboard");
      } else {
        navigate("/userdashboard");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving PG listing");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Users size={16} />
            List Your PG / Co-living Space
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            PG & Co-living
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            List your PG or co-living space. Connect with students and professionals looking for accommodation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Home size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Property details and location</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Property Title</label>
                <input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="e.g., Cozy PG for Students" 
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Property Type</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange} 
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="pg">PG / Co-living</option>
                  <option value="rent">Apartment / Flat</option>
                  <option value="villa">Villa / House</option>
                  <option value="plot">Plot / Land</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">State</label>
                <input 
                  name="state" 
                  value={formData.state} 
                  onChange={handleChange} 
                  placeholder="e.g., Punjab" 
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">District (optional)</label>
                <input 
                  name="district" 
                  value={formData.district} 
                  onChange={handleChange} 
                  placeholder="District" 
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">City / Location</label>
                <input 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  placeholder="City / Locality" 
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Size (sq ft)</label>
                <input 
                  type="number" 
                  name="area" 
                  value={formData.area} 
                  onChange={handleChange} 
                  placeholder="e.g., 1200" 
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Details & Price</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Property specifications and pricing</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Monthly Rent (₹)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  placeholder="e.g., 8000" 
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bedrooms</label>
                  <input 
                    type="number" 
                    name="beds" 
                    value={formData.beds} 
                    onChange={handleChange} 
                    placeholder="Beds" 
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bathrooms</label>
                  <input 
                    type="number" 
                    name="baths" 
                    value={formData.baths} 
                    onChange={handleChange} 
                    placeholder="Baths" 
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Garages</label>
                  <input 
                    type="number" 
                    name="garages" 
                    value={formData.garages} 
                    onChange={handleChange} 
                    placeholder="Garages" 
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Describe your PG, amenities, rules, and facilities…" 
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none" 
                  rows={5}
                />
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ImageIcon size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Photos</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add images to showcase your property</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFile} 
                className="hidden" 
                id="file-upload-pg" 
              />
              <label htmlFor="file-upload-pg" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Upload size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-semibold mb-2">Click to upload images</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">JPG, PNG, WebP (Max 5MB each, Max 10 images)</p>
                </div>
              </label>
              {uploading && <div className="text-sm text-purple-600 dark:text-purple-400 mt-4">Uploading images…</div>}
              
              {images.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt={`preview ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-xl shadow-lg" 
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-6 border border-purple-100 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={20} className="text-white" />
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-semibold">Listing as: {ownerName || "Guest"}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your name will be displayed to potential tenants</p>
              </div>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={uploading} 
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-purple-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? "Processing…" : "Submit PG Listing"}
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default Pg;
