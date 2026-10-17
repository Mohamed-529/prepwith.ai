import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useInterviewLock } from "../context/InterviewLockContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isInterviewLocked, openQuitModal } = useInterviewLock();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (e, path) => {
    if (isInterviewLocked) {
      e.preventDefault();
      setMenuOpen(false);
      openQuitModal(path);
      return;
    }
    setMenuOpen(false);
  };

  const handleLogout = (e) => {
    if (isInterviewLocked) {
      e.preventDefault();
      setMenuOpen(false);
      openQuitModal("logout");
      return;
    }
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-dark-950/70 backdrop-blur-2xl shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={user ? "/dashboard" : "/"}
            onClick={(e) => handleNavClick(e, user ? "/dashboard" : "/")}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 p-[1px] shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all duration-300">
              <div className="w-full h-full bg-dark-950 rounded-[11px] flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
            </div>
            <span className="font-display font-bold text-xl text-white tracking-tight flex items-center gap-1">
              Prep<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">AI</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded-md bg-brand-500/10 border border-brand-500/30 text-brand-300">v2</span>
            </span>
          </Link>

          {/* Active Interview Notice Badge if locked */}
          {isInterviewLocked && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-semibold shadow-glow animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Interview In Session (Locked)</span>
            </div>
          )}

          {user && (
            <div className="hidden md:flex items-center gap-1.5">
              <Link
                to="/dashboard"
                onClick={(e) => handleNavClick(e, "/dashboard")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive("/dashboard")
                    ? "bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm shadow-brand-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/interview"
                onClick={(e) => handleNavClick(e, "/interview")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive("/interview")
                    ? "bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm shadow-brand-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                Mock Interview
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900/80 border border-white/10 shadow-sm">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm text-gray-200 font-medium">{user.name}</span>
                  </div>

                  {isInterviewLocked ? (
                    <button
                      type="button"
                      onClick={() => openQuitModal("/dashboard")}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 border border-rose-600/50 text-rose-200 transition-colors shadow-sm shadow-rose-900/30"
                    >
                      Quit Session
                    </button>
                  ) : (
                    <button type="button" onClick={handleLogout} className="btn-ghost text-sm">
                      Logout
                    </button>
                  )}
                </div>

                <button
                  className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {user && menuOpen && (
          <div className="md:hidden border-t border-white/[0.08] py-3 space-y-1 bg-dark-900/90 rounded-b-2xl p-2 mt-1 shadow-2xl">
            <Link
              to="/dashboard"
              onClick={(e) => handleNavClick(e, "/dashboard")}
              className={`block px-4 py-2 text-sm rounded-xl transition-colors ${
                isActive("/dashboard") ? "bg-brand-500/20 text-brand-300 font-semibold" : "text-gray-300 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/interview"
              onClick={(e) => handleNavClick(e, "/interview")}
              className={`block px-4 py-2 text-sm rounded-xl transition-colors ${
                isActive("/interview") ? "bg-brand-500/20 text-brand-300 font-semibold" : "text-gray-300 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              Mock Interview
            </Link>
            {isInterviewLocked ? (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openQuitModal("/dashboard");
                }}
                className="block w-full text-left px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl font-semibold"
              >
                Quit Interview Session
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-rose-300 hover:bg-white/[0.05] rounded-xl"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
