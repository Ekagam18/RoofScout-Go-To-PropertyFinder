import { useTheme } from '../hooks/useTheme';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function UserProfile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    password: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useTheme();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Use user data from AuthContext
      setFormData({
        name: user.name || user.username || '',
        address: user.address || '',
        phone: user.phone || '',
        email: user.email || '',
        password: ''
      });
      // Only use profile image if it's a valid URL and not a default avatar service
      if (user.image && 
          typeof user.image === 'string' && 
          user.image.trim() !== '' &&
          !user.image.includes('avatar.iran.liara.run') &&
          !user.image.includes('ui-avatars.com') &&
          !user.image.includes('randomuser.me')) {
        setProfileImage(user.image);
      } else {
        setProfileImage(null);
      }
    }
  }, [isAuthenticated, user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setProfileImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const { name, address, phone, email } = formData;
    // Save profile data to localStorage
    localStorage.setItem('userProfile', JSON.stringify({ name, address, phone, email }));
    if (profileImage) {
      localStorage.setItem('userProfileImage', profileImage);
    }
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('usernameUpdated'));
    window.dispatchEvent(new Event('profileUpdated'));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls =
    'w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 ' +
    'bg-white dark:bg-gray-700/60 text-gray-800 dark:text-gray-100 ' +
    'focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 ' +
    'focus:ring-2 focus:ring-blue-500/20 transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500';

  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', key: 'name', icon: '👤', placeholder: 'Your full name' },
    { id: 'address', label: 'Address', type: 'text', key: 'address', icon: '📍', placeholder: 'City, State' },
    { id: 'pno', label: 'Phone Number', type: 'tel', key: 'phone', icon: '📞', placeholder: '+91 00000 00000' },
    { id: 'mail', label: 'Email Address', type: 'email', key: 'email', icon: '✉️', placeholder: 'you@email.com' },
    { id: 'pass', label: 'Change Password', type: 'password', key: 'password', icon: '🔒', placeholder: 'Leave blank to keep current' },
  ];

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-black font-sans">

        {/* ── NAVBAR ── */}
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/60 dark:border-gray-700/50 shadow-sm">
          <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logoRS.jpg" className="h-9 w-9 rounded-full ring-2 ring-yellow-400/40" alt="RoofScout" />
              <span className="text-xl font-extrabold">
                <span className="text-yellow-500">Roof</span>
                <span className="text-blue-600 dark:text-teal-400">Scout</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition-all bg-gray-100 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
              </button>
              <button
                onClick={() => navigate('/userdashboard')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                ← Dashboard
              </button>
            </div>
          </nav>
        </header>

        {/* ── HERO ── */}
        <div className="relative overflow-hidden bg-blue-600 dark:bg-teal-600 py-10 px-6">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="relative max-w-5xl mx-auto text-center">
            <p className="text-indigo-200 text-xs uppercase tracking-widest font-semibold mb-1">RoofScout — Account</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow">Edit Your Profile</h1>
            <p className="text-indigo-200/70 mt-2 text-sm">Update your photo and personal details here</p>
          </div>
        </div>

        {/* ── CARD ── */}
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl overflow-hidden">

            {/* Avatar section */}
            <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-gray-200/60 dark:border-gray-700/60 p-8 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl ring-4 ring-indigo-200/50 dark:ring-indigo-500/30">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white text-4xl font-bold">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <label
                  htmlFor="pfp"
                  className="absolute -bottom-2 -right-2 w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  title="Change photo"
                >
                  <span className="text-white text-sm">📷</span>
                </label>
                <input type="file" id="pfp" className="hidden" accept="image/*" onChange={handleImageChange} />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800 dark:text-white text-lg">{formData.name || 'Your Name'}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{formData.email || 'your@email.com'}</p>
              </div>
              <label
                htmlFor="pfp"
                className="cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition-all"
              >
                📷 Change Photo
              </label>
            </div>

            {/* Form fields */}
            <div className="p-6 md:p-8">
              <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs">✎</span>
                Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {fields.map(({ id, label, type, key, icon, placeholder }) => (
                  <div key={id} className={key === 'address' || key === 'password' ? 'md:col-span-2' : ''}>
                    <label htmlFor={id} className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      {label}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base select-none">{icon}</span>
                      <input
                        type={type}
                        id={id}
                        className={inputCls}
                        value={formData[key]}
                        onChange={e => {
                          let val = e.target.value;
                          if (key === 'phone') {
                            val = val.replace(/\D/g, '').slice(0, 10);
                          }
                          setFormData({ ...formData, [key]: val });
                        }}
                        placeholder={placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200/60 dark:border-gray-700/60">
                <button
                  onClick={() => navigate('/userdashboard')}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  ← Back to Dashboard
                </button>
                <button
                  onClick={handleSave}
                  className={`px-8 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${saved
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/20'
                    : 'bg-blue-600 hover:bg-blue-500 dark:bg-teal-600 dark:hover:bg-teal-500 shadow-blue-500/20 dark:shadow-teal-500/20'
                    }`}
                >
                  {saved ? '✅ Saved!' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
