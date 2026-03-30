import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const ScoreGauge = ({ percentage }) => {
  const color =
    percentage >= 70 ? "#34d399" :
    percentage >= 40 ? "#facc15" :
    "#f87171";

  const label =
    percentage >= 70 ? "Excellent!" :
    percentage >= 40 ? "Good effort" :
    "Keep practicing";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#1a1a24" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="50" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-display" style={{ color }}>{percentage}%</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
};

const ResultsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [expandedIdx, setExpandedIdx] = useState(null);

  if (!state?.result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-sm">
          <p className="text-gray-300 mb-4">No results found. Please complete an interview first.</p>
          <Link to="/interview" className="btn-primary inline-block">Start Interview</Link>
        </div>
      </div>
    );
  }

  const { score, totalQuestions, percentage, answers } = state.result;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10 animate-slide-up">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Interview Complete!</h1>
        <p className="text-gray-400">Here's how you performed across all questions.</p>
      </div>

      {/* Score card */}
      <div className="card mb-8 text-center bg-gradient-to-br from-dark-800 to-dark-700 shadow-xl shadow-black/30 animate-fade-in">
        <ScoreGauge percentage={percentage} />
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-dark-700/60 rounded-xl p-4">
            <p className="text-2xl font-bold text-white font-display">{score}</p>
            <p className="text-xs text-gray-400 mt-1">Correct</p>
          </div>
          <div className="bg-dark-700/60 rounded-xl p-4">
            <p className="text-2xl font-bold text-white font-display">{totalQuestions - score}</p>
            <p className="text-xs text-gray-400 mt-1">Incorrect</p>
          </div>
          <div className="bg-dark-700/60 rounded-xl p-4">
            <p className="text-2xl font-bold text-white font-display">{totalQuestions}</p>
            <p className="text-xs text-gray-400 mt-1">Total</p>
          </div>
        </div>
      </div>

      {/* Per-question breakdown */}
      <h2 className="text-xl font-bold text-white mb-4">Question Breakdown</h2>
      <div className="space-y-3 mb-10">
        {(answers || []).map((ans, idx) => (
          <div
            key={idx}
            className={`card border transition-colors cursor-pointer ${
              ans.isCorrect ? "border-emerald-700/30 hover:border-emerald-600/50" : "border-red-700/30 hover:border-red-600/50"
            }`}
            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${ans.isCorrect ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400"}`}>
                  {ans.isCorrect
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white leading-snug">{ans.questionText}</p>
                  <p className="text-xs text-gray-500 mt-1">Q{idx + 1} · Click to {expandedIdx === idx ? "collapse" : "expand"}</p>
                </div>
              </div>
              <span className={ans.isCorrect ? "badge-green" : "badge-red"}>
                {ans.isCorrect ? "Correct" : "Needs work"}
              </span>
            </div>

            {expandedIdx === idx && (
              <div className="mt-4 pt-4 border-t border-dark-500 space-y-4 animate-fade-in">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Your Answer</p>
                  <p className="text-sm text-gray-300 leading-relaxed bg-dark-700 rounded-xl px-4 py-3 border border-dark-500">
                    {ans.userAnswer?.trim() || <span className="text-gray-500 italic">No answer provided</span>}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-brand-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                    AI Feedback
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed bg-brand-900/20 rounded-xl px-4 py-3 border border-brand-800/30">
                    {ans.feedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => navigate("/interview")} className="btn-primary flex-1 text-center">
          Try Again
        </button>
        <Link to="/dashboard" className="btn-secondary flex-1 text-center">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ResultsPage;
