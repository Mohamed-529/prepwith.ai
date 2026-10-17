import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const ScoreGauge = ({ percentage }) => {
  const color =
    percentage >= 70 ? "#34d399" : percentage >= 40 ? "#facc15" : "#f87171";

  const label =
    percentage >= 70 ? "Excellent" : percentage >= 40 ? "Good" : "Needs Practice";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#1a1a24" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-display" style={{ color }}>
            {percentage}%
          </span>
        </div>
      </div>
      <span className="text-xs font-semibold" style={{ color }}>
        {label}
      </span>
    </div>
  );
};

const ResultsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [expandedIdx, setExpandedIdx] = useState(0);

  if (!state?.result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-xs">
          <p className="text-gray-300 text-sm mb-3">No results found.</p>
          <Link to="/interview" className="btn-primary inline-block text-xs py-2 px-4">
            Start Interview
          </Link>
        </div>
      </div>
    );
  }

  const { score, totalQuestions, percentage, answers } = state.result;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6 animate-slide-up">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Interview Results</h1>
        <p className="text-xs text-gray-400">RAG Grounded Evaluation</p>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-3 gap-2.5 mb-6 text-center">
        <div className="bg-dark-800/90 border border-dark-600 rounded-xl p-2.5">
          <span className="text-xs font-bold text-emerald-400 font-mono">-35%</span>
          <p className="text-[11px] font-semibold text-white mt-0.5">RAG Grounding</p>
        </div>

        <div className="bg-dark-800/90 border border-dark-600 rounded-xl p-2.5">
          <span className="text-xs font-bold text-brand-400 font-mono">-45%</span>
          <p className="text-[11px] font-semibold text-white mt-0.5">Redis Cache</p>
        </div>

        <div className="bg-dark-800/90 border border-dark-600 rounded-xl p-2.5">
          <span className="text-xs font-bold text-purple-400 font-mono">-30%</span>
          <p className="text-[11px] font-semibold text-white mt-0.5">SOA Decoupled</p>
        </div>
      </div>

      {/* Score Card */}
      <div className="card mb-6 text-center bg-gradient-to-br from-dark-800 to-dark-700 shadow-xl py-6 animate-fade-in">
        <ScoreGauge percentage={percentage} />
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-dark-700/60 rounded-xl p-3">
            <p className="text-xl font-bold text-white font-display">{score}</p>
            <p className="text-[11px] text-gray-400">Passed</p>
          </div>
          <div className="bg-dark-700/60 rounded-xl p-3">
            <p className="text-xl font-bold text-white font-display">{totalQuestions - score}</p>
            <p className="text-[11px] text-gray-400">Review</p>
          </div>
          <div className="bg-dark-700/60 rounded-xl p-3">
            <p className="text-xl font-bold text-white font-display">{totalQuestions}</p>
            <p className="text-[11px] text-gray-400">Total</p>
          </div>
        </div>
      </div>

      {/* Per-Question Breakdown */}
      <h2 className="text-base font-bold text-white mb-3">Question Breakdown</h2>
      <div className="space-y-3 mb-8">
        {(answers || []).map((ans, idx) => (
          <div
            key={idx}
            className={`card border transition-colors cursor-pointer p-4 ${
              ans.isCorrect
                ? "border-emerald-700/30 hover:border-emerald-600/50"
                : "border-red-700/30 hover:border-red-600/50"
            }`}
            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5 text-xs ${
                    ans.isCorrect ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400"
                  }`}
                >
                  {ans.isCorrect ? "✓" : "✕"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white leading-snug">{ans.questionText}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
                    <span className="text-gray-500 font-mono">Q{idx + 1}</span>
                    {ans.grade && <span className="font-bold text-brand-400 font-mono">[{ans.grade}]</span>}
                    {ans.ragContextUsed && (
                      <span className="text-gray-300 bg-dark-700 px-1.5 py-0.5 rounded border border-dark-600">
                        RAG: {ans.ragContextUsed}
                      </span>
                    )}
                    {ans.cached ? (
                      <span className="text-brand-300 bg-brand-950/60 px-1.5 py-0.5 rounded border border-brand-700/40">
                        ⚡ Redis Hit
                      </span>
                    ) : (
                      <span className="text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/40">
                        ✨ Live RAG
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={ans.isCorrect ? "badge-green" : "badge-red"}>
                  {ans.score}%
                </span>
              </div>
            </div>

            {expandedIdx === idx && (
              <div
                className="mt-3 pt-3 border-t border-dark-500 space-y-3 animate-fade-in text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Your Spoken Answer</p>
                  <p className="text-gray-300 bg-dark-700 rounded-lg p-2.5 border border-dark-500 font-mono text-xs">
                    {ans.userAnswer?.trim() || <span className="text-gray-500 italic">No answer spoken</span>}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-brand-400 uppercase tracking-wide mb-1">RAG Feedback</p>
                  <p className="text-gray-200 bg-brand-950/40 rounded-lg p-2.5 border border-brand-800/40">
                    {ans.feedback}
                  </p>
                </div>

                {ans.keyStrengths && ans.keyStrengths.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide mb-1">Strengths</p>
                    <ul className="list-disc list-inside text-emerald-300 space-y-0.5">
                      {ans.keyStrengths.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {ans.missingConcepts && ans.missingConcepts.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-yellow-400 uppercase tracking-wide mb-1">Improvements</p>
                    <ul className="list-disc list-inside text-yellow-300 space-y-0.5">
                      {ans.missingConcepts.map((mc, i) => (
                        <li key={i}>{mc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {ans.modelAnswer && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Ground Truth</p>
                    <p className="text-gray-300 bg-dark-900 p-2.5 rounded-lg border border-dark-600">
                      {ans.modelAnswer}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/interview")}
          className="btn-primary flex-1 text-center text-xs py-2.5"
        >
          New Interview
        </button>
        <Link to="/dashboard" className="btn-secondary flex-1 text-center text-xs py-2.5">
          Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ResultsPage;
