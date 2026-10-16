import React from "react";
import { Link } from "react-router-dom";

const Feature = ({ icon, title, desc }) => (
  <div className="card hover:border-brand-700/40 transition-colors group">
    <div className="w-10 h-10 rounded-xl bg-brand-900/60 border border-brand-700/40 flex items-center justify-center mb-4 text-brand-400 group-hover:bg-brand-800/60 transition-colors">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

const LandingPage = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Hero */}
    <div className="py-24 text-center animate-slide-up">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-900/60 border border-brand-700/40 text-brand-300 text-xs font-medium mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
        AI-Powered Interview Preparation
      </div>
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
        Ace your next<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
          tech interview
        </span>
      </h1>
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Practice with real-world questions, get instant AI feedback, and track your progress — all in one place.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/register" className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-brand-900/40">
          Start for free →
        </Link>
        <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
          Sign in
        </Link>
      </div>
    </div>

    {/* Features */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
      <Feature
        title="Curated Questions"
        desc="8 hand-picked questions covering JavaScript, React, Node.js, databases, and CS fundamentals."
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
      />
      <Feature
        title="Timed Sessions"
        desc="Each question comes with a 2-minute countdown timer to simulate real interview pressure."
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />
      <Feature
        title="AI Feedback"
        desc="Get detailed, personalised feedback on every answer using our intelligent evaluation system."
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>}
      />
      <Feature
        title="Progress Tracking"
        desc="View your session history, average scores, and best performances on your personal dashboard."
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
      />
      <Feature
        title="Secure Auth"
        desc="JWT-based authentication keeps your account and progress data safe and private."
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}
      />
      <Feature
        title="Detailed Results"
        desc="Review every answer after submission with expanded AI feedback to understand where you went wrong."
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>}
      />
    </div>
  </div>
);

export default LandingPage;
