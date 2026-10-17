import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const ScoreGauge = ({ percentage }) => {
  const isHigh = percentage >= 70;
  const isMed = percentage >= 40 && percentage < 70;

  const color = isHigh ? "#10b981" : isMed ? "#f59e0b" : "#f43f5e";
  const label = isHigh ? "Excellent Readiness" : isMed ? "Solid Performance" : "Needs Additional Practice";
  const auraGlow = isHigh
    ? "rgba(16, 185, 129, 0.25)"
    : isMed
    ? "rgba(245, 158, 11, 0.25)"
    : "rgba(244, 63, 94, 0.25)";

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 w-36 h-36 rounded-full blur-2xl pointer-events-none -translate-x-4 -translate-y-2 opacity-50"
        style={{ background: auraGlow }}
      />

      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#131936" strokeWidth="9" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold font-display tracking-tight" style={{ color }}>
            {percentage}%
          </span>
          <span className="text-[10px] uppercase font-mono text-gray-400">Score</span>
        </div>
      </div>
      <span className="text-xs font-bold tracking-wide uppercase px-3 py-0.5 rounded-full bg-dark-950/80 border border-white/10" style={{ color }}>
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
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="card text-center max-w-sm bg-dark-900/80 border-white/[0.08] shadow-2xl p-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto mb-3 text-brand-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">No Results Active</h2>
          <p className="text-gray-400 text-xs mb-5">Start a new mock session to view automated RAG evaluation results.</p>
          <Link to="/interview" className="btn-primary w-full text-xs py-2.5">
            Launch Mock Interview
          </Link>
        </div>
      </div>
    );
  }

  const { score, totalQuestions, percentage, answers } = state.result;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Automated Technical Debrief</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
          Interview Evaluation Report
        </h1>
        <p className="text-xs text-gray-400">RAG Grounded Scoring & Architectural Feedback</p>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-3 gap-3 mb-6 text-center">
        <div className="card bg-dark-900/60 border-white/[0.08] hover:border-emerald-500/30 p-3">
          <span className="text-xs font-extrabold text-emerald-400 font-mono">-35%</span>
          <p className="text-[11px] font-bold text-white mt-0.5">RAG Grounding</p>
          <p className="text-[10px] text-gray-400">Anti-Hallucination</p>
        </div>

        <div className="card bg-dark-900/60 border-white/[0.08] hover:border-brand-500/30 p-3">
          <span className="text-xs font-extrabold text-brand-400 font-mono">-45%</span>
          <p className="text-[11px] font-bold text-white mt-0.5">Redis Cache</p>
          <p className="text-[10px] text-gray-400">Sub-5ms Hits</p>
        </div>

        <div className="card bg-dark-900/60 border-white/[0.08] hover:border-purple-500/30 p-3">
          <span className="text-xs font-extrabold text-purple-400 font-mono">-30%</span>
          <p className="text-[11px] font-bold text-white mt-0.5">SOA Decoupled</p>
          <p className="text-[10px] text-gray-400">SOLID Contracts</p>
        </div>
      </div>

      {/* Score Card */}
      <div className="card mb-8 text-center bg-dark-900/80 border-white/[0.08] shadow-2xl py-8 px-6 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 via-cyan-400 to-purple-500" />
        <ScoreGauge percentage={percentage} />

        <div className="mt-6 grid grid-cols-3 gap-3 max-w-md mx-auto">
          <div className="bg-dark-950/70 border border-white/[0.06] rounded-xl p-3">
            <p className="text-2xl font-bold text-emerald-400 font-display">{score}</p>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Passed</p>
          </div>
          <div className="bg-dark-950/70 border border-white/[0.06] rounded-xl p-3">
            <p className="text-2xl font-bold text-rose-400 font-display">{totalQuestions - score}</p>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Review</p>
          </div>
          <div className="bg-dark-950/70 border border-white/[0.06] rounded-xl p-3">
            <p className="text-2xl font-bold text-white font-display">{totalQuestions}</p>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Total Questions</p>
          </div>
        </div>
      </div>

      {/* Per-Question Breakdown */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Question-by-Question Analysis</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-dark-800 border border-white/10 text-gray-400">
            {answers?.length || 0}
          </span>
        </h2>
        <span className="text-xs text-gray-400">Click to expand details</span>
      </div>

      <div className="space-y-3 mb-8">
        {(answers || []).map((ans, idx) => (
          <div
            key={idx}
            className={`card border transition-all duration-200 cursor-pointer p-4 bg-dark-900/70 hover:bg-dark-850/80 ${
              ans.isCorrect
                ? "border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-glow-emerald"
                : "border-rose-500/30 hover:border-rose-500/50 hover:shadow-glow"
            }`}
            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center mt-0.5 text-xs font-bold shadow-sm ${
                    ans.isCorrect
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {ans.isCorrect ? "✓" : "✕"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-snug">{ans.questionText}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px]">
                    <span className="text-gray-400 font-mono font-bold">Q{idx + 1}</span>
                    {ans.grade && (
                      <span className="font-bold text-cyan-300 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        Grade {ans.grade}
                      </span>
                    )}
                    {ans.ragContextUsed && (
                      <span className="text-gray-300 bg-dark-950 px-2 py-0.5 rounded-md border border-white/10">
                        RAG: {ans.ragContextUsed}
                      </span>
                    )}
                    {ans.cached ? (
                      <span className="text-brand-300 bg-brand-950/80 px-2 py-0.5 rounded-md border border-brand-500/40">
                        ⚡ Redis Hit
                      </span>
                    ) : (
                      <span className="text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/40">
                        ✨ Live RAG
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={ans.isCorrect ? "badge-green" : "badge-red"}>
                  {ans.score}% Score
                </span>
              </div>
            </div>

            {expandedIdx === idx && (
              <div
                className="mt-4 pt-4 border-t border-white/[0.08] space-y-3 animate-fade-in text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <span>🎙️ Candidate Spoken Transcript:</span>
                  </p>
                  <div className="text-gray-200 bg-dark-950/90 rounded-xl p-3 border border-white/10 font-mono text-xs leading-relaxed">
                    {ans.userAnswer?.trim() || <span className="text-gray-500 italic">No spoken words recorded.</span>}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <span>🤖 AI Evaluation & Feedback:</span>
                  </p>
                  <div className="text-gray-200 bg-cyan-950/20 rounded-xl p-3 border border-cyan-500/30 leading-relaxed">
                    {ans.feedback}
                  </div>
                </div>

                {ans.keyStrengths && ans.keyStrengths.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide mb-1">Key Strengths:</p>
                    <ul className="list-disc list-inside text-emerald-300 space-y-0.5 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20">
                      {ans.keyStrengths.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {ans.missingConcepts && ans.missingConcepts.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wide mb-1">Concepts to Add:</p>
                    <ul className="list-disc list-inside text-amber-300 space-y-0.5 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20">
                      {ans.missingConcepts.map((mc, i) => (
                        <li key={i}>{mc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {ans.modelAnswer && (
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">RAG Ground Truth Benchmark:</p>
                    <p className="text-gray-300 bg-dark-950 p-3 rounded-xl border border-white/10 leading-relaxed font-mono text-xs">
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
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate("/interview")}
          className="btn-primary flex-1 text-center text-sm py-3 shadow-lg shadow-brand-500/25"
        >
          Take Another Mock Interview →
        </button>
        <Link to="/dashboard" className="btn-secondary flex-1 text-center text-sm py-3">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ResultsPage;
