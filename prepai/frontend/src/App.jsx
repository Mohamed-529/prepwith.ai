import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage    from "./pages/LandingPage";
import LoginPage      from "./pages/LoginPage";
import RegisterPage   from "./pages/RegisterPage";
import DashboardPage  from "./pages/DashboardPage";
import InterviewPage  from "./pages/InterviewPage";
import ResultsPage    from "./pages/ResultsPage";

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login"     element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register"  element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
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
