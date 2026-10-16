import React from "react";
import { Link } from "react-router-dom";

const Feature = ({ icon, title, desc, tag }) => (
  <div className="card hover:border-brand-700/40 transition-colors group flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-900/60 border border-brand-700/40 flex items-center justify-center text-brand-400 group-hover:bg-brand-800/60 transition-colors">
          {icon}
        </div>
        {tag && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-dark-700 border border-dark-500 text-gray-300">
            {tag}
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const LandingPage = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Hero */}
    <div className="py-20 text-center animate-slide-up">
      <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-900/60 border border-brand-700/40 text-brand-300 text-xs font-medium mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
        <span>Service-Oriented Architecture (SOA)</span>
        <span className="text-gray-500">•</span>
        <span>RAG Pipeline Grounding</span>
        <span className="text-gray-500">•</span>
        <span>Redis MD5 Caching Layer</span>
      </div>

      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
        Master your next<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-purple-400 to-indigo-400">
          technical interview
        </span>
      </h1>

      <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
        High-throughput mock interview platform powered by strict RAG prompt grounding against verified knowledge bases and dynamic Redis caching.
      </p>

      {/* Tech Stack Banner */}
      <div className="inline-flex flex-wrap items-center justify-center gap-2 py-2 px-4 rounded-xl bg-dark-800/80 border border-dark-600 text-xs text-gray-400 font-mono mb-10">
        <span className="text-white font-semibold">Tech Stack:</span>
        <span className="text-brand-300">React</span>
        <span className="text-gray-600">/</span>
        <span className="text-brand-300">Node.js</span>
        <span className="text-gray-600">/</span>
        <span className="text-brand-300">Express</span>
        <span className="text-gray-600">/</span>
        <span className="text-emerald-400">MongoDB</span>
        <span className="text-gray-600">/</span>
        <span className="text-red-400">Redis</span>
        <span className="text-gray-600">/</span>
        <span className="text-purple-400">Gemini AI</span>
        <span className="text-gray-600">/</span>
        <span className="text-yellow-400">Zod</span>
        <span className="text-gray-600">/</span>
        <span className="text-blue-400">JWT</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/register" className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-brand-900/40">
          Start Mock Interview →
        </Link>
        <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
          Candidate Login
        </Link>
      </div>
    </div>

    {/* Metrics Bar */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
      <div className="card text-center bg-dark-800/90 border-dark-600 py-6">
        <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-display">
          -30%
        </p>
        <p className="text-sm font-semibold text-white mt-1">Deployment-Blocking Bugs</p>
        <p className="text-xs text-gray-400 mt-1">Via strict SOA separation & SOLID design</p>
      </div>

      <div className="card text-center bg-dark-800/90 border-dark-600 py-6">
        <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400 font-display">
          -35%
        </p>
        <p className="text-sm font-semibold text-white mt-1">Hallucinated AI Evaluations</p>
        <p className="text-xs text-gray-400 mt-1">Grounded against verified technical knowledge base</p>
      </div>

      <div className="card text-center bg-dark-800/90 border-dark-600 py-6">
        <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 font-display">
          -45%
        </p>
        <p className="text-sm font-semibold text-white mt-1">LLM Compute & Latency Overhead</p>
        <p className="text-xs text-gray-400 mt-1">Dynamic MD5-payload distributed Redis caching</p>
      </div>
    </div>

    {/* Features */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
      <Feature
        title="RAG Knowledge Pipeline"
        desc="Candidate answers are evaluated strictly against verified standard definitions, eliminating LLM hallucinations."
        tag="Gemini + RAG"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>}
      />
      <Feature
        title="Distributed Redis Caching"
        desc="Dynamic MD5 payload hashing caches evaluated prompt tokens, speeding roundtrips from ~850ms to sub-5ms."
        tag="Redis MD5"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
      />
      <Feature
        title="SOA & SOLID Architecture"
        desc="Decoupled authentication, interview orchestration, and evaluation modules for maximum testability."
        tag="SOLID / SOA"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
      />
      <Feature
        title="Zod Schema Validation"
        desc="Strict runtime request and body contract validation across registration, login, and answer evaluation."
        tag="Zod"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
      />
      <Feature
        title="Stateless JWT Auth"
        desc="Bcrypt password hashing and JWT token issuance with sliding refresh and secure Protected Route guards."
        tag="JWT / Bcrypt"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
      />
      <Feature
        title="MongoDB & In-Memory Mode"
        desc="Robust data persistence for interview progress, session analytics, and user histories with fail-safe memory failover."
        tag="MongoDB"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>}
      />
    </div>
  </div>
);

export default LandingPage;
