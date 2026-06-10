import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { GuestRoute, ProtectedRoute, AdminRoute } from "./components/RouteGuards";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

// User pages
import HomePage from "./pages/HomePage";
import MoviesPage from "./pages/MoviesPage";
import MovieOpenPage from "./pages/MovieOpenPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import PlansPage from "./pages/PlansPage";
import NotFoundPage from "./pages/NotFoundPage";

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMoviesPage from "./pages/admin/AdminMoviesPage";
import AdminUploadMoviePage from "./pages/admin/AdminUploadMoviePage";
import AdminEditMoviePage from "./pages/admin/AdminEditMoviePage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminPlansPage from "./pages/admin/AdminPlansPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* ── Admin routes (no Navbar/Footer) ── */}
              <Route
                path="/admin/login"
                element={
                  <GuestRoute>
                    <AdminLoginPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="movies" element={<AdminMoviesPage />} />
                <Route path="movies/upload" element={<AdminUploadMoviePage />} />
                <Route path="movies/:id/edit" element={<AdminEditMoviePage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="plans" element={<AdminPlansPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
              </Route>

              {/* ── Public / User routes ── */}
              <Route
                path="*"
                element={
                  <div className="app-container">
                    <Navbar />
                    <main>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/movies" element={<MoviesPage />} />
                        <Route path="/movies/:id" element={<MovieOpenPage />} />
                        <Route path="/plans" element={<PlansPage />} />

                        {/* Guest only */}
                        <Route
                          path="/login"
                          element={
                            <GuestRoute>
                              <LoginPage />
                            </GuestRoute>
                          }
                        />
                        <Route
                          path="/register"
                          element={
                            <GuestRoute>
                              <RegisterPage />
                            </GuestRoute>
                          }
                        />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />

                        {/* Protected */}
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          }
                        />

                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
