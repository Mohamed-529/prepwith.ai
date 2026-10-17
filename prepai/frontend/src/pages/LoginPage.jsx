import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../utils/api";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  // If already authenticated, redirect smoothly to destination
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Ambient background glow spotlight specifically behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/15 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 p-[1px] shadow-lg shadow-brand-500/25">
              <div className="w-full h-full bg-dark-950 rounded-[15px] flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Sign in to resume your technical AI mock interviews</p>
        </div>

        {/* Card */}
        <div className="card bg-dark-900/80 backdrop-blur-2xl border-white/[0.08] shadow-2xl p-7">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3.5 shadow-lg shadow-brand-500/25">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Signing in...</span>
                </span>
              ) : (
                "Sign In →"
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setForm({ email: "demo@prepai.ai", password: "password123" });
                setError("");
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-white/10 hover:border-brand-500/40 bg-dark-950/60 hover:bg-dark-850/80 text-xs text-gray-300 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-amber-400">⚡ Autofill Demo Account</span>
              <span className="text-gray-500 font-mono text-[11px]">(demo@prepai.ai)</span>
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-white/[0.06]">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
