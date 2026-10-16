import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage    from "./pages/LandingPage";
import LoginPage      from "./pages/LoginPage";
import RegisterPage   from "./pages/RegisterPage";
import DashboardPage  from "./pages/DashboardPage";
import InterviewPage  from "./pages/InterviewPage";
import ResultsPage    from "./pages/ResultsPage";

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading PrepAI...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
        <Route path="/login"     element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register"  element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
        <Route path="/results"   element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        <Route path="*"          element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-brand-400 mb-4">404</h1>
              <p className="text-gray-400 mb-6">Page not found.</p>
              <a href="/" className="btn-primary inline-block">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </>
  );
};

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
