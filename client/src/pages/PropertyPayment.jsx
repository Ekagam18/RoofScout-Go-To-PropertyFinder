import { useTheme } from '../hooks/useTheme';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Wallet, Home, CheckCircle, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../utils/axiosConfig';

function PropertyPayment() {
    const [theme] = useTheme();
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const propertyData = state?.propertyData;

    const [paymentType, setPaymentType] = useState('full'); // 'full' or 'emi'
    const [downpaymentPercent, setDownpaymentPercent] = useState(20);
    const [tenureYears, setTenureYears] = useState(15);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

    // Load user
    const [loggedUser, setLoggedUser] = useState('Guest');
    useEffect(() => {
        // Use JWT Auth instead of localAuth
        const storedName = localStorage.getItem('name');
        const storedUser = localStorage.getItem('user');
        
        if (storedName) {
            setLoggedUser(storedName);
        } else if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setLoggedUser(userData.name || userData.username || userData.email || 'User');
            } catch {
                setLoggedUser('User');
            }
        } else if (user?.name) {
            setLoggedUser(user.name);
        }
    }, [user]);

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
            setCardDetails(prev => ({ ...prev, name: val }));
        }
    };

    if (!propertyData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                <h2 className="text-2xl font-bold dark:text-white mb-4">Property data not found.</h2>
                <button onClick={() => navigate(-1)} className="text-blue-600 underline">Go Back</button>
            </div>
        );
    }

    // Parse price safely
    const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        let numeric = priceStr.replace(/[^0-9.]/g, '');
        let val = parseFloat(numeric);

        if (priceStr.toLowerCase().includes('cr')) val *= 10000000;
        else if (priceStr.toLowerCase().includes('lakh')) val *= 100000;
        else if (priceStr.toLowerCase().includes('k')) val *= 1000;

        return val || 0;
    };

    const propertyPrice = parsePrice(propertyData.priceText);
    const isRent = propertyData.priceText?.toLowerCase().includes('month');

    // EMI Calculations
    const interestRate = 8.5; // Fixed 8.5% annual interest
    const downpaymentAmount = (propertyPrice * downpaymentPercent) / 100;
    const loanAmount = propertyPrice - downpaymentAmount;

    const calculateEMI = () => {
        if (loanAmount <= 0) return 0;
        const r = interestRate / 12 / 100;
        const n = tenureYears * 12;
        const emi = loanAmount * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
        return emi;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // First, fetch property details to get owner info
            const propertyResponse = await API.get(`/properties/${propertyData.houseId}/view`);
            const property = propertyResponse.data.property;
            
            const amountPaid = paymentType === 'emi' ? downpaymentAmount : propertyPrice;
            const remainingAmount = paymentType === 'emi' ? loanAmount : 0;
            
            // Save payment record
            const paymentData = {
                propertyId: propertyData.houseId,
                userId: user?._id || user?.id,
                ownerId: property?.user,
                buyerName: loggedUser,
                ownerName: property?.ownerName || property.user?.name || 'Unknown',
                propertyTitle: propertyData.title,
                price: propertyPrice,
                paymentType: paymentType,
                amountPaid: amountPaid,
                remainingAmount: remainingAmount,
                emiDuration: paymentType === 'emi' ? tenureYears : null,
                emiAmount: paymentType === 'emi' ? calculateEMI() : null,
                paymentMethod: 'card',
                transactionId: 'TXN' + Date.now()
            };

            const paymentResponse = await API.post('/payments', paymentData);
            
            if (!paymentResponse.data.success) {
                throw new Error('Failed to save payment record');
            }

            // Remove from backend database so it stops showing up in listings
            const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const deleteResponse = await fetch(`${baseUrl}/api/property/${propertyData.houseId}`, {
                method: 'DELETE',
            });
            const deleteResult = await deleteResponse.json();

            if (deleteResponse.ok && deleteResult.success) {
                setTimeout(() => {
                    alert(`Payment Successful! You have requested to ${isRent ? 'rent' : 'buy'} ${propertyData.title}. The owner will contact you shortly to finalize paperwork.`);
                    setIsProcessing(false);
                    navigate('/userdashboard');
                }, 1500); // Small delay for UX
            } else {
                alert(`Payment processed, but failed to remove listing: ${deleteResult.message || 'Unknown error'}`);
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('An error occurred while finalizing the transaction.');
            setIsProcessing(false);
        }
    };

    return (
        <div className={theme === "dark" ? "dark" : ""}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors font-sans pb-16">
                <Navbar />

                <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-20">
                    <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-medium">
                        <i className="ri-arrow-left-line"></i> Back to Property
                    </button>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">

                        {/* LEFT: Order Summary */}
                        <div className="w-full lg:w-1/3 bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 sticky top-24">
                            <div className="h-48 overflow-hidden relative">
                                <img src={propertyData.image || "/housescover_copy.jpg"} className="w-full h-full object-cover" alt="Property" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 text-white">
                                    <span className="bg-blue-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Order Summary</span>
                                    <h3 className="font-bold text-lg leading-tight truncate w-full pr-4">{propertyData.title}</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Total Property Value</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{propertyData.priceText}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Location</span>
                                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px] text-right">{propertyData.address || propertyData.location}</span>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium mb-1">
                                        <ShieldCheck size={16} /> Secure Checkout
                                    </div>
                                    <p className="text-xs text-gray-400">Your payment information is encrypted and secure.</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Payment Details */}
                        <div className="w-full lg:w-2/3 space-y-6">

                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Payment Options</h1>

                            {!isRent && (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setPaymentType('full')}
                                        className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 ${paymentType === 'full' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300'}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentType === 'full' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                                <Wallet size={20} />
                                            </div>
                                            {paymentType === 'full' && <CheckCircle className="text-blue-600" size={24} />}
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Full Payment</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pay the total amount upfront and close instantly.</p>
                                    </div>

                                    <div
                                        onClick={() => setPaymentType('emi')}
                                        className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 ${paymentType === 'emi' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300'}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentType === 'emi' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                                <Home size={20} />
                                            </div>
                                            {paymentType === 'emi' && <CheckCircle className="text-blue-600" size={24} />}
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Pay in EMI (Home Loan)</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pay a downpayment now, rest in easy monthly installments.</p>
                                    </div>
                                </div>
                            )}

                            {/* Dynamic Content area based on selection */}
                            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-800">

                                {paymentType === 'emi' && !isRent && (
                                    <div className="mb-10 space-y-8 animate-fade-in-up">
                                        <h3 className="text-xl font-bold dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Customize your Home Loan</h3>

                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <label className="font-medium text-gray-700 dark:text-gray-300">Downpayment ({downpaymentPercent}%)</label>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(downpaymentAmount)}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="10"
                                                max="80"
                                                step="5"
                                                value={downpaymentPercent}
                                                onChange={(e) => setDownpaymentPercent(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                                            />
                                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                                <span>10% Min</span>
                                                <span>80% Max</span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <label className="font-medium text-gray-700 dark:text-gray-300">Loan Tenure</label>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">{tenureYears} Years</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="5"
                                                max="30"
                                                step="1"
                                                value={tenureYears}
                                                onChange={(e) => setTenureYears(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                                            />
                                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                                <span>5 Years</span>
                                                <span>30 Years</span>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-blue-100 dark:border-blue-800/50">
                                            <div>
                                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Estimated EMI (@8.5% p.a.)</p>
                                                <p className="text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(calculateEMI())} <span className="text-base font-normal text-gray-500">/mo</span></p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 mb-1">Loan Amount</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(loanAmount)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}


                                <form onSubmit={handleCheckout} className="space-y-6">
                                    <h3 className="text-xl font-bold dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">
                                        Amount to Pay Now: <span className="text-blue-600 ml-2">
                                            {isRent ? propertyData.priceText : (paymentType === 'emi' ? formatCurrency(downpaymentAmount) : propertyData.priceText)}
                                        </span>
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
                                            <div className="relative">
                                                <input required type="text" id="cardNumber" placeholder="0000 0000 0000 0000" value={cardDetails.number} onChange={handleCardInputChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-12 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all" />
                                                <CreditCard className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                                                <input required type="text" id="expiry" placeholder="MM/YY" value={cardDetails.expiry} onChange={handleCardInputChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVC</label>
                                                <input required type="password" id="cvv" placeholder="123" value={cardDetails.cvv} onChange={handleCardInputChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cardholder Name</label>
                                            <input required type="text" id="cardName" placeholder="John Doe" value={cardDetails.name} onChange={handleCardInputChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all" />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-[.98] disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 text-lg"
                                    >
                                        {isProcessing ? (
                                            <span className="animate-pulse">Processing Payment...</span>
                                        ) : (
                                            <>
                                                <i className="ri-lock-fill"></i> Pay Securely
                                            </>
                                        )}
                                    </button>
                                </form>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default PropertyPayment;
