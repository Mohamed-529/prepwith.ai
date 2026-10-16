import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestions, submitAnswers } from "../utils/api";

const QUESTION_TIME = 120; // seconds per question

const TimerRing = ({ timeLeft, total }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / total;
  const offset = circumference * (1 - progress);
  const color = timeLeft > 60 ? "#6366f1" : timeLeft > 30 ? "#eab308" : "#ef4444";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#1a1a24" strokeWidth="6" />
        <circle
          cx="48" cy="48" r={radius} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
        />
      </svg>
      <div className="text-center z-10">
        <span className="text-lg font-bold font-mono" style={{ color }}>
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

const CATEGORIES = ["All", "JavaScript", "React", "Node.js", "Database", "General CS", "CSS"];

const InterviewPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [questions, setQuestions]     = useState([]);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [answers, setAnswers]         = useState({});
  const [timeLeft, setTimeLeft]       = useState(QUESTION_TIME);
  const [loadingQ, setLoadingQ]       = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const [started, setStarted]         = useState(false);
  const [submittedIndices, setSubmittedIndices] = useState(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const fetchQs = useCallback(async (cat) => {
    setLoadingQ(true);
    setError("");
    try {
      const { data } = await getQuestions(cat);
      setQuestions(data.questions || []);
      setCurrentIdx(0);
      setAnswers({});
      setSubmittedIndices(new Set());
      setTimeLeft(QUESTION_TIME);
    } catch (err) {
      setError("Failed to load questions. Please refresh.");
    } finally {
      setLoadingQ(false);
    }
  }, []);

  useEffect(() => {
    fetchQs(selectedCategory);
  }, [fetchQs, selectedCategory]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const handleConfirmNext = () => {
    clearInterval(timerRef.current);
    // Mark current question as submitted & permanently locked
    setSubmittedIndices((prev) => {
      const nextSet = new Set(prev);
      nextSet.add(currentIdx);
      return nextSet;
    });

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setTimeLeft(QUESTION_TIME);
    }
  };

  // Timer: automatically locks and advances if time expires
  useEffect(() => {
    if (!started || loadingQ || questions.length === 0) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setSubmittedIndices((prev) => {
            const nextSet = new Set(prev);
            nextSet.add(currentIdx);
            return nextSet;
          });

          if (currentIdx < questions.length - 1) {
            showToast(`Time expired for Question ${currentIdx + 1}. Auto-submitted. Moving to Question ${currentIdx + 2}.`);
            setCurrentIdx((i) => i + 1);
            setTimeLeft(QUESTION_TIME);
          } else {
            showToast("Time expired for the final question. Submitting interview...");
            handleSubmit();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, currentIdx, loadingQ, questions.length]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    localStorage.removeItem("answers");
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        questionText: q.question,
        userAnswer: answers[q.id] || "",
      }));
      const { data } = await submitAnswers({ answers: payload });
      navigate("/results", { state: { result: data } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIdx];
  const currentAnswer = answers[currentQ?.id] || "";
  const answeredCount = Object.values(answers).filter((a) => a && a.trim()).length;
  const isCurrentAnswered = Boolean(currentAnswer.trim());
  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;

  if (loadingQ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  // Start screen
  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-lg w-full text-center animate-slide-up shadow-xl shadow-black/30">
          <div className="w-16 h-16 rounded-2xl bg-brand-900/60 border border-brand-700/40 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Mock Interview Ready</h2>
          <p className="text-gray-400 mb-5 text-sm leading-relaxed">
            Select your technical domain or practice all topics. Answer in your own words — our verified RAG pipeline will evaluate your answers.
          </p>

          <div className="mb-6 text-left">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
              Choose Domain / Category:
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-brand-600 text-white shadow-md shadow-brand-900/50 scale-105"
                      : "bg-dark-700 text-gray-400 hover:text-gray-200 hover:bg-dark-600 border border-dark-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[["Questions", questions.length],["Time/Q","2 min"],["RAG Evaluation","✓"]].map(([label, val]) => (
              <div key={label} className="bg-dark-700 rounded-xl p-3 border border-dark-500">
                <p className="text-lg font-bold text-white font-display">{val}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="mb-6 p-3 rounded-xl bg-dark-700/60 border border-dark-500 text-left text-xs text-gray-300 space-y-1">
            <p className="font-semibold text-brand-300 flex items-center gap-1.5">
              <span>🔒</span> Interview Integrity Rule:
            </p>
            <p className="text-gray-400">
              Each question is submitted sequentially. Once you submit an answer and move to the next question, you cannot navigate back to edit previous answers.
            </p>
          </div>

          <button onClick={() => setStarted(true)} className="btn-primary w-full text-base">
            Begin Interview →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-900/40 border border-amber-600/50 text-amber-300 text-xs flex items-center gap-2.5 animate-slide-up shadow-lg">
          <svg className="w-5 h-5 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 font-medium">
              Question <span className="text-white font-bold">{currentIdx + 1}</span> of <span className="text-white font-bold">{questions.length}</span>
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-900/40 text-brand-300 border border-brand-700/40 font-mono">
              Step {currentIdx + 1} of {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span>🔒</span> {submittedIndices.size} locked
            </span>
            <span className="text-gray-400">
              {answeredCount} answered
            </span>
          </div>
        </div>
        <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
        {/* Question dots */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {questions.map((q, i) => {
            const isSubmitted = submittedIndices.has(i) || i < currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  if (i < currentIdx) {
                    showToast(`Question ${i + 1} was already submitted and locked. You cannot revisit previous questions.`);
                  }
                }}
                title={
                  isSubmitted
                    ? `Question ${i + 1}: Submitted & Locked (Cannot revisit)`
                    : isCurrent
                    ? `Question ${i + 1}: Current Active Question`
                    : `Question ${i + 1}: Upcoming`
                }
                className={`h-2.5 flex-1 min-w-[10px] rounded-full transition-all ${
                  isSubmitted
                    ? "bg-emerald-600 hover:bg-emerald-500 cursor-help"
                    : isCurrent
                    ? "bg-brand-400 ring-2 ring-brand-400/50 animate-pulse"
                    : "bg-dark-500 cursor-default"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Question card */}
      <div className="card mb-6 animate-fade-in" key={currentIdx}>
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-indigo">{currentQ?.category}</span>
              <span className="text-xs text-gray-500 font-mono">Q#{currentIdx + 1}</span>
            </div>
            <h2 className="text-xl font-semibold text-white leading-relaxed">
              {currentQ?.question}
            </h2>
          </div>
          <TimerRing timeLeft={timeLeft} total={QUESTION_TIME} />
        </div>

        {currentQ?.hint && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-brand-900/20 border border-brand-800/30 mb-5">
            <svg className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
            <p className="text-sm text-brand-300">{currentQ.hint}</p>
          </div>
        )}

        <textarea
          value={currentAnswer}
          onChange={(e) => handleAnswerChange(currentQ?.id, e.target.value)}
          placeholder="Explain clearly with core concepts, practical examples, and architecture decisions if applicable..."
          className="input-field resize-none text-sm leading-relaxed"
          rows={7}
          autoFocus
        />
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2.5">
          <span>{currentAnswer.length} characters • {wordCount} words</span>
          {isCurrentAnswered ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span>✓</span> Answer drafted
            </span>
          ) : (
            <span className="text-amber-400/90 italic">
              Please enter an answer before proceeding
            </span>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Previous Button - Permanently locked to prevent navigating back to submitted questions */}
        <div className="flex items-center gap-2">
          <button
            disabled
            type="button"
            className="px-4 py-2.5 rounded-xl bg-dark-800 text-gray-500 border border-dark-700 text-sm font-medium cursor-not-allowed flex items-center gap-2 select-none opacity-60"
            title="Previous questions cannot be revisited once submitted"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Previous (Locked)</span>
          </button>
          <span className="text-[11px] text-gray-500 hidden md:inline">
            (Submitted questions cannot be revisited)
          </span>
        </div>

        {/* Submit & Next with User Concern Modal */}
        <div className="flex items-center gap-3">
          {currentIdx < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <span>Submit & Next Question</span>
              <span>→</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={submitting}
              className="btn-primary bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-400 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Evaluating Answers...
                </span>
              ) : (
                <>
                  <span>Submit Final Interview</span>
                  <span>({answeredCount}/{questions.length} answered)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* User Concern & Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-lg w-full bg-dark-800 border-dark-600 shadow-2xl p-6 relative animate-scale-up">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">
                  {currentIdx < questions.length - 1
                    ? `Submit Question ${currentIdx + 1} and Proceed?`
                    : "Complete & Submit Interview?"}
                </h3>
                <p className="text-xs text-amber-300 font-medium mt-1">
                  ⚠️ Irreversible action: You will not be able to return to or edit previous questions once confirmed.
                </p>
              </div>
            </div>

            {/* Answer Preview & Status */}
            <div className="bg-dark-900/90 rounded-xl p-4 border border-dark-600 mb-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">Question {currentIdx + 1} Status:</span>
                {isCurrentAnswered ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span>✓</span> {currentAnswer.trim().length} chars (~{wordCount} words)
                  </span>
                ) : (
                  <span className="text-red-400 font-semibold flex items-center gap-1">
                    <span>⚠️</span> Unanswered / Blank
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Your answer draft:</p>
                <div className="max-h-28 overflow-y-auto rounded-lg bg-dark-950 p-3 text-xs text-gray-300 font-mono border border-dark-700 whitespace-pre-wrap leading-relaxed">
                  {currentAnswer.trim() || (
                    <span className="text-red-400/80 italic">
                      No answer entered yet. If you proceed, this question will receive a 0% score.
                    </span>
                  )}
                </div>
              </div>

              {isCurrentAnswered && currentAnswer.trim().length < 35 && (
                <p className="text-xs text-amber-400/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                  💡 Tip: The RAG evaluation compares your answer against industry documentation. Adding key details and terminology yields higher scores.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary w-full sm:w-auto text-sm"
              >
                ← Keep Reviewing / Edit Answer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  if (currentIdx < questions.length - 1) {
                    handleConfirmNext();
                  } else {
                    handleSubmit();
                  }
                }}
                className={`btn-primary w-full sm:w-auto text-sm ${
                  currentIdx === questions.length - 1 ? "bg-emerald-600 hover:bg-emerald-500" : ""
                }`}
              >
                {currentIdx < questions.length - 1
                  ? "Confirm & Move to Next Question →"
                  : "Confirm & Submit Interview ✓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
