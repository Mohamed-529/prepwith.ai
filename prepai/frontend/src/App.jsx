import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { InterviewLockProvider } from "./context/InterviewLockContext";
import AppBackground from "./components/AppBackground";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import InterviewPage from "./pages/InterviewPage";
import ResultsPage from "./pages/ResultsPage";

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950 relative">
        <AppBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
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
      <div className="min-h-screen flex items-center justify-center bg-dark-950 relative">
        <AppBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading PrepAI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative text-gray-100 selection:bg-brand-500/30">
      <AppBackground />
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            <Route
              path="*"
              element={
                <div className="min-h-[70vh] flex items-center justify-center">
                  <div className="card text-center max-w-sm">
                    <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400 mb-4">404</h1>
                    <p className="text-gray-400 mb-6">Page not found.</p>
                    <a href="/" className="btn-primary inline-block">Go Home</a>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <InterviewLockProvider>
      <AppRoutes />
    </InterviewLockProvider>
  </AuthProvider>
);

export default App;
