import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingChatbot from './components/chatbot/FloatingChatbot';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import FarmListingsPage from './pages/listings/FarmListingsPage';
import FarmDetailPage from './pages/listings/FarmDetailPage';
import HomestayListingsPage from './pages/listings/HomestayListingsPage';
import HomestayDetailPage from './pages/listings/HomestayDetailPage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import CartPage from './pages/marketplace/CartPage';
import CheckoutPage from './pages/marketplace/CheckoutPage';
import BookingManagementPage from './pages/bookings/BookingManagementPage';
import ProfileSettingsPage from './pages/profile/ProfileSettingsPage';
import AIAssistantPage from './pages/AIAssistantPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
              <Navbar />
              
              <div className="flex-grow">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Listings */}
                  <Route path="/farms" element={<FarmListingsPage />} />
                  <Route path="/farms/:id" element={<FarmDetailPage />} />
                  <Route path="/homestays" element={<HomestayListingsPage />} />
                  <Route path="/homestays/:id" element={<HomestayDetailPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />

                  {/* Protected routes */}
                  <Route
                    path="/dashboard/*"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ai-assistant"
                    element={
                      <ProtectedRoute>
                        <AIAssistantPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bookings"
                    element={
                      <ProtectedRoute>
                        <BookingManagementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfileSettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>

              <Footer />
              <FloatingChatbot />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
