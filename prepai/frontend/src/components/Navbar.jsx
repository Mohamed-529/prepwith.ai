import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-dark-600 bg-dark-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg group-hover:bg-brand-500 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">
              Prep<span className="text-brand-400">AI</span>
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-1">
              <Link to="/dashboard" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/dashboard") ? "bg-dark-600 text-white" : "text-gray-400 hover:text-white hover:bg-dark-700"}`}>Dashboard</Link>
              <Link to="/interview" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/interview") ? "bg-dark-600 text-white" : "text-gray-400 hover:text-white hover:bg-dark-700"}`}>Interview</Link>
            </div>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-500">
                    <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm text-gray-300 font-medium">{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="btn-ghost text-sm">Logout</button>
                </div>
                <button className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700" onClick={() => setMenuOpen(!menuOpen)}>
                  {menuOpen
                    ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  }
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
              </div>
            )}
          </div>
        </div>
        {user && menuOpen && (
          <div className="md:hidden border-t border-dark-600 py-3 space-y-1">
            <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-700 rounded-lg" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/interview" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-700 rounded-lg" onClick={() => setMenuOpen(false)}>Interview</Link>
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-dark-700 rounded-lg">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
