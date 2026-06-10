import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeaturesBar from './components/FeaturesBar'
import Collections from './components/Collections'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import AdminDashboard from './pages/AdminDashboard'
import CartDrawer from './components/CartDrawer'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'

import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const authPages = ['/login', '/register', '/forgot-password'];
  const adminPages = ['/admin'];
  const hideHeaderFooter = authPages.includes(location.pathname) || adminPages.includes(location.pathname);

  useEffect(() => {
    if (location.state?.cartOpen) {
      setIsCartOpen(true)
      // Clear the state so it doesn't open again on refresh
      navigate(location.pathname, { replace: true, state: { ...location.state, cartOpen: false } })
    }
  }, [location, navigate])

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-gray-100 transition-colors duration-300">
          <ScrollToTop />
          {!hideHeaderFooter && <Navbar onOpenCart={() => setIsCartOpen(true)} />}

          {!hideHeaderFooter && <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <FeaturesBar />
                  <Collections />
                </>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/collections/chai" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>

          {!hideHeaderFooter && <Footer />}
          </div>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App;
