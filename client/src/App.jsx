import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdmPropt from './pages/AdmPropt';
import AdmHouses from './pages/AdmHouses';
import AdmClients from './pages/AdmClients';
import AdmTenants from './pages/AdmTenants';
import AdmPayments from './pages/AdmPayments';
import AllProperties from './pages/AllProperties';
import AdmInvoice from './pages/AdmInvoice';
import States from './pages/States';
import StatesRent from './pages/StatesRent';
import StatesPG from './pages/StatesPG';
import PostProperty from './pages/PostProperty';
import ViewDetail from './pages/ViewDetail';
import Sell from './pages/Sell';
import Rent from './pages/Rent';
import PG from './pages/PG';
import UserProfile from './pages/UserProfile';
import Payment from './pages/Payment';
import PropertyPayment from './pages/PropertyPayment';

import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationToast from './components/NotificationToast';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <NotificationToast />
          <Routes>
                {/* HOME - Public */}
                <Route path="/" element={<Home />} />

                {/* AUTH - Public */}
                <Route path="/login" element={<Login />} />

                {/* USER - Protected (requires authentication) */}
                <Route path="/userdashboard" element={
                  <ProtectedRoute requireAuth={true}>
                    <UserDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/user-profile" element={
                  <ProtectedRoute requireAuth={true}>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="/payment/:id" element={
                  <ProtectedRoute requireAuth={true}>
                    <Payment />
                  </ProtectedRoute>
                } />
                <Route path="/property-payment/:id" element={
                  <ProtectedRoute requireAuth={true}>
                    <PropertyPayment />
                  </ProtectedRoute>
                } />

                {/* ADMIN - Protected (requires admin role) */}
                <Route path="/AdminDashboard" element={
                  <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/AdmPropt" element={
                  <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <AdmPropt />
                  </ProtectedRoute>
                } />
                <Route path="/AdmHouses" element={
                  <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <AdmHouses />
                  </ProtectedRoute>
                } />
                <Route path="/AdmClients" element={
                  <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <AdmClients />
                  </ProtectedRoute>
                } />
                <Route path="/AdmTenants" element={
                  <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <AdmTenants />
                  </ProtectedRoute>
                } />
                <Route path="/AdmPayments" element={
                  <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <AdmPayments />
                  </ProtectedRoute>
                } />
                <Route path="/AdmInvoice" element={
                  <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <AdmInvoice />
                  </ProtectedRoute>
                } />

                {/* PROPERTIES - Mixed access */}
                <Route path="/allproperties" element={<AllProperties />} />
                <Route path="/states" element={<States />} />
                <Route path="/statesrent" element={<StatesRent />} />
                <Route path="/statespg" element={<StatesPG />} />
                <Route path="/postproperty" element={<PostProperty />} />
                <Route path="/viewdetail" element={<ViewDetail />} />
                <Route path="/viewdetail/:id" element={<ViewDetail />} />
                
                {/* ADD PROPERTY - Protected (requires authentication) */}
                <Route path="/sell" element={
                  <ProtectedRoute requireAuth={true}>
                    <Sell />
                  </ProtectedRoute>
                } />
                <Route path="/rent" element={
                  <ProtectedRoute requireAuth={true}>
                    <Rent />
                  </ProtectedRoute>
                } />
                <Route path="/pg" element={
                  <ProtectedRoute requireAuth={true}>
                    <PG />
                  </ProtectedRoute>
                } />

              </Routes>
            </Router>
          </SocketProvider>
        </AuthProvider>
  );
}

export default App;
