import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Feature = ({ icon, title, desc, tag, accent = "brand" }) => {
  const accentBorder =
    accent === "cyan"
      ? "group-hover:border-cyan-400/50 group-hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.3)]"
      : accent === "emerald"
      ? "group-hover:border-emerald-400/50 group-hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.3)]"
      : accent === "violet"
      ? "group-hover:border-purple-400/50 group-hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.3)]"
      : "group-hover:border-brand-500/50 group-hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.3)]";

  const iconBg =
    accent === "cyan"
      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 group-hover:bg-cyan-500/20"
      : accent === "emerald"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 group-hover:bg-emerald-500/20"
      : accent === "violet"
      ? "bg-purple-500/10 text-purple-400 border-purple-500/30 group-hover:bg-purple-500/20"
      : "bg-brand-500/10 text-brand-400 border-brand-500/30 group-hover:bg-brand-500/20";

  return (
    <div
      className={`card bg-dark-900/60 hover:bg-dark-850/80 border-white/[0.08] transition-all duration-300 group flex flex-col justify-between ${accentBorder}`}
    >
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div
            className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-sm ${iconBg}`}
          >
            {icon}
          </div>
          {tag && (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-dark-950/80 border border-white/10 text-gray-300 group-hover:border-white/20 transition-colors">
              {tag}
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-brand-300 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

const TECH_STACK_LOGOS = [
  {
    name: "React",
    icon: (
      <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-full h-full" fill="none">
        <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
        <g stroke="#61DAFB" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  {
    name: "Node.js",
    icon: (
      <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
        <path d="M16 2.5L3.2 9.8v14.4L16 31.5l12.8-7.3V9.8L16 2.5z" fill="#539E43" />
        <path d="M16 5.5l10.2 5.8v11.6L16 28.7 5.8 22.9V11.3L16 5.5z" fill="#0C1222" />
        <path d="M16 11.2c-3.1 0-5.3 1.8-5.3 4.5 0 2.7 1.9 3.9 4.3 4.3l1.7.3c1.4.3 2.3.8 2.3 1.8 0 1.2-1.1 2-2.9 2-1.8 0-3.1-.7-3.8-1.9l-1.6 1.6c1.1 1.7 3 2.6 5.4 2.6 3.4 0 5.6-1.9 5.6-4.6 0-2.9-2-4-4.4-4.4l-1.7-.3c-1.3-.2-2.1-.7-2.1-1.6 0-1.1 1-1.9 2.7-1.9 1.5 0 2.7.6 3.4 1.5l1.6-1.6c-1-1.4-2.7-2.1-4.6-2.1z" fill="#539E43" />
      </svg>
    ),
  },
  {
    name: "Express.js",
    icon: (
      <svg viewBox="0 0 32 32" className="w-full h-full" fill="currentColor">
        <path d="M2.5 16c0-7.5 6-13.5 13.5-13.5S29.5 8.5 29.5 16 23.5 29.5 16 29.5 2.5 23.5 2.5 16z" fill="#181824" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <path d="M7.8 12.5h2.8l2.2 3.6 2.2-3.6h2.8l-3.5 5.2 3.8 5.8h-2.9l-2.4-4-2.4 4H7.6l3.8-5.8-3.6-5.2zm11 0h6.6v2.2h-4.3v2.3h3.8v2.1h-3.8v2.4h4.5v2.2h-6.8v-11.2z" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    name: "MongoDB",
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
        <path d="M12 1.5c-.4 0-6 6.8-6 12.2 0 4.2 2.9 7.6 6 8.8 3.1-1.2 6-4.6 6-8.8 0-5.4-5.6-12.2-6-12.2z" fill="#00ED64" />
        <path d="M12 1.5v20.5c.3-.1.6-.3.9-.5 2.8-1.5 5.1-4.7 5.1-7.8 0-5.4-5.6-12.2-6-12.2z" fill="#00684A" />
        <path d="M12 7.2v10.5c.8-.5 1.5-1.3 1.8-2.2.3-.9.2-2.1-.3-3.2-.4-.9-1-2.9-1.5-5.1z" fill="#FFFFFF" opacity="0.4" />
      </svg>
    ),
  },
  {
    name: "Redis",
    icon: (
      <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
        <path d="M16 2.5L2.8 8.8l13.2 6.3 13.2-6.3L16 2.5z" fill="#FF4438" />
        <path d="M2.8 13.8l13.2 6.3 13.2-6.3L16 7.5 2.8 13.8z" fill="#D82C20" opacity="0.9" />
        <path d="M2.8 18.8l13.2 6.3 13.2-6.3-13.2-6.3L2.8 18.8z" fill="#A81D14" />
        <path d="M2.8 23.8l13.2 6.3 13.2-6.3-13.2-6.3L2.8 23.8z" fill="#75120B" />
        <circle cx="16" cy="8.8" r="2.2" fill="#FFFFFF" opacity="0.8" />
      </svg>
    ),
  },
  {
    name: "Google Gemini",
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <defs>
          <linearGradient id="geminiLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4E82EE" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <path
          d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z"
          fill="url(#geminiLogoGrad)"
        />
      </svg>
    ),
  },
  {
    name: "Zod",
    icon: (
      <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
        <rect width="32" height="32" rx="8" fill="#18233C" stroke="#3B82F6" strokeWidth="1.2" />
        <path d="M8 9.5h16l-10.2 13h10.2v3H8l10.2-13H8v-3z" fill="#38BDF8" />
      </svg>
    ),
  },
  {
    name: "JSON Web Token",
    icon: (
      <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
        <path d="M16 2.5a13.5 13.5 0 1013.5 13.5A13.5 13.5 0 0016 2.5z" fill="#111827" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <path d="M16 6.5a9.5 9.5 0 018.2 4.7l-4.1 2.4a4.8 4.8 0 00-4.1-2.4z" fill="#FB015B" />
        <path d="M25.5 16a9.5 9.5 0 01-4.7 8.2l-2.4-4.1a4.8 4.8 0 002.4-4.1z" fill="#D63AFF" />
        <path d="M16 25.5a9.5 9.5 0 01-8.2-4.7l4.1-2.4a4.8 4.8 0 004.1 2.4z" fill="#00B9F1" />
        <path d="M6.5 16a9.5 9.5 0 014.7-8.2l2.4 4.1a4.8 4.8 0 00-2.4 4.1z" fill="#FFC83B" />
        <circle cx="16" cy="16" r="3.2" fill="#FFFFFF" />
      </svg>
    ),
  },
];

const ROTATING_PHRASES = [
  "Big Tech interview",
  "every technical round",
  "spoken AI interview",
  "system design round",
];

const LandingPage = () => {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPhraseIdx((prev) => (prev + 1) % ROTATING_PHRASES.length);
        setFade(true);
      }, 300);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      {/* Hero Section */}
      <div className="py-20 md:py-24 text-center animate-slide-up relative">
        {/* Decorative Hero Top Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-brand-600/20 via-cyan-500/15 to-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Pill Badge */}
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-dark-900/90 border border-brand-500/40 text-brand-300 text-xs font-semibold mb-6 shadow-glow backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-300">AI Voice Mock Interview</span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-300">Natural Speech</span>
          <span className="text-gray-600">•</span>
          <span className="text-purple-300">RAG Grounded</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.15] tracking-tight">
          Master your next<br className="hidden sm:inline" />{" "}
          <span
            className={`inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-cyan-400 to-purple-400 transition-all duration-300 transform min-h-[1.15em] ${
              fade ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
            }`}
          >
            {ROTATING_PHRASES[phraseIdx]}
          </span>
        </h1>

      <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
        Real-time conversational mock interviews with an AI bot, audio questions, spoken voice answers, and technical RAG evaluations.
      </p>

      {/* Continuous Moving Tech Stack Logos */}
      <div className="w-full max-w-3xl mx-auto overflow-hidden relative mb-12 py-3 select-none [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="animate-marquee flex items-center gap-5 shrink-0">
          {[...TECH_STACK_LOGOS, ...TECH_STACK_LOGOS, ...TECH_STACK_LOGOS].map((tech, idx) => (
            <div
              key={`${tech.name}-${idx}`}
              className="group relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-dark-900/80 backdrop-blur-xl border border-white/[0.08] hover:border-brand-500/50 hover:bg-dark-850 shadow-lg hover:shadow-glow transition-all duration-300 shrink-0 cursor-pointer"
              title={tech.name}
              aria-label={tech.name}
            >
              <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center transition-transform duration-300 group-hover:scale-115">
                {tech.icon}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/register"
          className="btn-primary text-base px-8 py-3.5 shadow-xl shadow-brand-500/25 group flex items-center gap-2"
        >
          <span>Start Spoken Interview</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
        <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
          Sign In
        </Link>
      </div>
    </div>

    {/* Metrics Bar */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
      <div className="card bg-dark-900/70 border-white/[0.08] hover:border-emerald-500/40 text-center py-6 group">
        <div className="inline-block p-1 rounded-xl bg-emerald-500/10 mb-2 border border-emerald-500/20">
          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-display">
            -30%
          </p>
        </div>
        <p className="text-sm font-bold text-white mt-1">Bug Reduction</p>
        <p className="text-xs text-gray-400 mt-0.5">SOA & SOLID Architecture</p>
      </div>

      <div className="card bg-dark-900/70 border-white/[0.08] hover:border-brand-500/40 text-center py-6 group">
        <div className="inline-block p-1 rounded-xl bg-brand-500/10 mb-2 border border-brand-500/20">
          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 font-display">
            -35%
          </p>
        </div>
        <p className="text-sm font-bold text-white mt-1">Hallucination Cut</p>
        <p className="text-xs text-gray-400 mt-0.5">RAG Grounded Pipeline</p>
      </div>

      <div className="card bg-dark-900/70 border-white/[0.08] hover:border-amber-500/40 text-center py-6 group">
        <div className="inline-block p-1 rounded-xl bg-amber-500/10 mb-2 border border-amber-500/20">
          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 font-display">
            -45%
          </p>
        </div>
        <p className="text-sm font-bold text-white mt-1">Latency Reduction</p>
        <p className="text-xs text-gray-400 mt-0.5">Redis MD5 Caching</p>
      </div>
    </div>

    {/* Features Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
      <Feature
        accent="brand"
        title="RAG Evaluation Pipeline"
        desc="Verified technical ground-truth evaluations with deterministic grading and constructive feedback."
        tag="Gemini + RAG"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        }
      />
      <Feature
        accent="cyan"
        title="Spoken Voice Only"
        desc="Interactive AI interviewer speaks questions aloud and records spoken candidate answers with live speech-to-text."
        tag="Voice API"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        }
      />
      <Feature
        accent="emerald"
        title="Sub-5ms Redis Caching"
        desc="Instant evaluation responses utilizing MD5 hashed question-answer payloads with zero redundant API calls."
        tag="Redis MD5"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      />
      <Feature
        accent="violet"
        title="SOA & SOLID Architecture"
        desc="Decoupled services with strict dependency injection, single responsibility, and production reliability."
        tag="SOLID / SOA"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
      />
      <Feature
        accent="brand"
        title="Zod Schema Validation"
        desc="Strict runtime contract validation preventing invalid payload injection across all client-server boundaries."
        tag="Zod Safe"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
      />
      <Feature
        accent="cyan"
        title="Stateless JWT & MongoDB"
        desc="Production-grade auth tokens and scalable MongoDB persistence with automatic fallback storage."
        tag="MongoDB"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        }
      />
    </div>
  </div>
  );
};

export default LandingPage;
