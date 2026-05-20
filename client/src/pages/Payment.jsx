import { useTheme } from '../hooks/useTheme';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, CheckCircle, CreditCard, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Payment() {
  const [darkMode, setDarkMode] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [theme, setTheme] = useTheme();
  const [loggedUser, setLoggedUser] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  // Helper function for localStorage
  const getStoredJSON = (key, defaultVal = []) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch (error) {
      console.error(`Error parsing JSON from localStorage key "${key}":`, error);
      return defaultVal;
    }
  };

  // --- Dark Mode Logic ---
  

  // --- Load Logged User ---
  useEffect(() => {
    function loadUser() {
      // Use JWT Auth instead of localAuth
      const storedUser = localStorage.getItem('user');
      const storedName = localStorage.getItem('name');
      
      if (storedName) {
        setLoggedUser(storedName);
      } else if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setLoggedUser(userData.name || userData.username || 'User');
        } catch {
          setLoggedUser('User');
        }
      } else if (user?.name) {
        setLoggedUser(user.name);
      } else {
        setLoggedUser('User');
      }
    }

    loadUser();
  }, [user]);

  // --- Load Application Data ---
  useEffect(() => {
    if (!loggedUser) return;

    console.log(`Payment: Looking for application with ID: ${id} for user: ${loggedUser}`);

    // Try to find application in user-specific applied properties
    const userKey = `appliedProperties_${loggedUser.replace(/\s+/g, '_')}`;
    const userAppliedProps = getStoredJSON(userKey, []);
    console.log(`Payment: User key ${userKey} has ${userAppliedProps.length} applications:`, userAppliedProps);

    let app = userAppliedProps.find(p => String(p.id) === String(id));
    console.log(`Payment: Found in user key:`, app);

    // If not found, search in all user-specific keys
    if (!app) {
      console.log('Payment: Searching in all user-specific keys...');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('appliedProperties_')) {
          const userApps = getStoredJSON(key, []);
          const userApp = userApps.find(a => a.applicant_name === loggedUser && String(a.id) === String(id));
          if (userApp) {
            app = userApp;
            console.log(`Payment: Found in key ${key}:`, app);
          }
        }
      });
    }

    // Also check allApplications
    if (!app) {
      console.log('Payment: Checking allApplications...');
      const allApplications = getStoredJSON('allApplications', []);
      app = allApplications.find(a => a.applicant_name === loggedUser && String(a.id) === String(id));
      console.log(`Payment: Found in allApplications:`, app);
    }

    // Fallback to global applied properties
    if (!app) {
      console.log('Payment: Checking global applied properties...');
      const globalAppliedProps = getStoredJSON('appliedProperties', []);
      app = globalAppliedProps.find(p => String(p.id) === String(id));
      console.log(`Payment: Found in global:`, app);
    }

    // Debug: Show all available applications
    console.log('Payment: All localStorage keys:', Object.keys(localStorage).filter(k => k.includes('applied')));

    if (app) {
      console.log('Payment: Application found:', app);
      setApplication(app);
    } else {
      console.log('Payment: Application not found. Available data:');
      Object.keys(localStorage).forEach(key => {
        if (key.includes('applied')) {
          console.log(`  ${key}:`, getStoredJSON(key, []));
        }
      });
      alert("Application not found!");
      navigate('/userdashboard');
    }
    setLoading(false);
  }, [id, navigate, loggedUser]);

  // --- Handle Payment ---
  const handlePayment = (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate network delay
    setTimeout(() => {
      try {
        // Update in user-specific applied properties
        const userKey = `appliedProperties_${loggedUser.replace(/\s+/g, '_')}`;
        const userAppliedProps = getStoredJSON(userKey, []);
        const userIndex = userAppliedProps.findIndex(p => String(p.id) === String(id));

        if (userIndex !== -1) {
          userAppliedProps[userIndex].status = 'Paid';
          userAppliedProps[userIndex].paymentDate = new Date().toISOString();
          localStorage.setItem(userKey, JSON.stringify(userAppliedProps));
        }

        // Update in allApplications
        const allApplications = getStoredJSON('allApplications', []);
        const allIndex = allApplications.findIndex(a =>
          String(a.id) === String(id) && a.applicant_name === loggedUser
        );
        if (allIndex !== -1) {
          allApplications[allIndex].status = 'Paid';
          allApplications[allIndex].paymentDate = new Date().toISOString();
          localStorage.setItem('allApplications', JSON.stringify(allApplications));
        }

        // Update in global applied properties as fallback
        const globalAppliedProps = getStoredJSON('appliedProperties', []);
        const globalIndex = globalAppliedProps.findIndex(p => String(p.id) === String(id));
        if (globalIndex !== -1) {
          globalAppliedProps[globalIndex].status = 'Paid';
          globalAppliedProps[globalIndex].paymentDate = new Date().toISOString();
          localStorage.setItem('appliedProperties', JSON.stringify(globalAppliedProps));
        }

        // Also update tour requests status to show payment completed
        const allTourRequests = getStoredJSON('allTourRequests', []);
        const tourIndex = allTourRequests.findIndex(req =>
          req.property_id === id && req.requester_name === loggedUser
        );
        if (tourIndex !== -1) {
          allTourRequests[tourIndex].payment_status = 'Paid';
          allTourRequests[tourIndex].paymentDate = new Date().toISOString();
          localStorage.setItem('allTourRequests', JSON.stringify(allTourRequests));
        }

        console.log(`Payment successful for application ${id} by user ${loggedUser}`);
        alert('Payment Successful! Booking Confirmed.');
        navigate('/userdashboard');

      } catch (error) {
        console.error('Error processing payment:', error);
        alert('Error processing payment.');
        setProcessing(false);
      }
    }, 2000); // 2 second delay
  };

    const handleCardInputChange = (e) => {
    const { id, value } = e.target;
    let val = value;
    if (id === 'cardNumber') {
      val = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
      setCardDetails(prev => ({ ...prev, number: val }));
    } else if (id === 'expiry') {
      val = value.replace(/\D/g, '');
      if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
      setCardDetails(prev => ({ ...prev, expiry: val }));
    } else if (id === 'cvv') {
      val = value.replace(/\D/g, '').slice(0, 3);
      setCardDetails(prev => ({ ...prev, cvv: val }));
    } else if (id === 'cardName') {
      setCardDetails(prev => ({ ...prev, name: value }));
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center dark:bg-gray-900 dark:text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">

      {/* Navbar (Simple Version) */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 ml-4">
          <img src="/logoRS.jpg" className="h-10 w-10 rounded-full" alt="Logo" />
          <h1 className="text-xl font-bold">
            <span className="text-yellow-500">Roof</span>
            <span className="text-blue-600 dark:text-blue-400">Scout</span>
          </h1>
        </div>
        <button
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          className="mr-4 p-2 border rounded-full bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
        >
          {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
        </button>
      </header>

      <main className="container mx-auto p-4 md:p-8 flex justify-center">
        <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

          {/* LEFT: Order Summary */}
          <div className="md:w-2/5 bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-blue-200 text-sm">Property</p>
                  <p className="font-semibold text-lg">{application?.title}</p>
                  <p className="text-sm opacity-80">ID: {application?.id}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-sm">Applicant</p>
                  <p className="font-semibold">{loggedUser}</p>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <p className="text-blue-200 text-sm">Booking Amount</p>
                  <p className="font-bold text-3xl">₹ 5,000</p> {/* Fixed Booking Token Amount */}
                  <p className="text-xs mt-1 opacity-75">*Refundable if deal cancelled within 24hrs</p>
                </div>
              </div>
            </div>

            {/* Decorative Circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

            <div className="mt-8 relative z-10">
              <Link to="/userdashboard" className="text-sm text-blue-100 hover:text-white flex items-center gap-1">
                ← Cancel and return
              </Link>
            </div>
          </div>

          {/* RIGHT: Payment Form */}
          <div className="md:w-3/5 p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Payment Details</h2>

            <form onSubmit={handlePayment}>
              {/* Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Select Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 border-2 rounded-xl flex items-center justify-center gap-2 transition-all ${paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 dark:text-gray-300'
                      }`}
                  >
                    <CreditCard size={20} /> Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 border-2 rounded-xl flex items-center justify-center gap-2 transition-all ${paymentMethod === 'upi'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 dark:text-gray-300'
                      }`}
                  >
                    <span className="font-bold">UPI</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Card Number</label>
                    <input required type="text" id="cardNumber" placeholder="0000 0000 0000 0000" value={cardDetails.number} onChange={handleCardInputChange} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Expiry</label>
                      <input required type="text" id="expiry" placeholder="MM/YY" value={cardDetails.expiry} onChange={handleCardInputChange} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">CVV</label>
                      <input required type="password" id="cvv" placeholder="123" value={cardDetails.cvv} onChange={handleCardInputChange} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Name on Card</label>
                    <input required type="text" id="cardName" placeholder="John Doe" value={cardDetails.name} onChange={handleCardInputChange} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="py-8 text-center">
                  <div className="mx-auto w-40 h-40 bg-white p-2 rounded-lg shadow-inner border">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=roofscout@okaxis" alt="QR Code" className="w-full h-full" />
                  </div>
                  <p className="text-sm text-gray-500 mt-4">Scan to pay ₹5,000</p>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Confirm Payment <CheckCircle size={20} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Payment;