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
    <nav className="sticky top-0 z-50 border-b border-mist-200/80 bg-white/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center shadow-sm group-hover:from-teal-500 group-hover:to-cyan-600 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg text-slate-800 tracking-tight">
              Prep<span className="text-brand-600">AI</span>
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-1">
              <Link to="/dashboard" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/dashboard") ? "bg-brand-50 text-brand-800" : "text-slate-500 hover:text-slate-800 hover:bg-mist-100"}`}>Dashboard</Link>
              <Link to="/interview" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/interview") ? "bg-peach-50 text-peach-500" : "text-slate-500 hover:text-slate-800 hover:bg-mist-100"}`}>Interview</Link>
            </div>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-mist-100 border border-mist-200">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-300 to-teal-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm text-slate-600 font-medium">{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="btn-ghost text-sm">Logout</button>
                </div>
                <button className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-mist-100" onClick={() => setMenuOpen(!menuOpen)}>
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
          <div className="md:hidden border-t border-mist-200 py-3 space-y-1">
            <Link to="/dashboard" className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-mist-100 rounded-lg" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/interview" className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-mist-100 rounded-lg" onClick={() => setMenuOpen(false)}>Interview</Link>
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
