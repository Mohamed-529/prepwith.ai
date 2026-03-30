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

const InterviewPage = () => {
  const [questions, setQuestions]     = useState([]);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [answers, setAnswers]         = useState({});
  const [timeLeft, setTimeLeft]       = useState(QUESTION_TIME);
  const [loadingQ, setLoadingQ]       = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const [started, setStarted]         = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQs = async () => {
      try {
        const { data } = await getQuestions();
        setQuestions(data.questions || []);
      } catch (err) {
        setError("Failed to load questions. Please refresh.");
      } finally {
        setLoadingQ(false);
      }
    };
    fetchQs();
  }, []);

  useEffect(() => {
    const fetchQs = async () => {
      try {
        const { data } = await getQuestions();
        setQuestions(data.questions || []);
      } catch (err) {
        setError("Failed to load questions. Please refresh.");
      } finally {
        setLoadingQ(false);
      }
    };
    fetchQs();
  }, []);

  const goNext = useCallback(() => {
    clearInterval(timerRef.current);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setTimeLeft(QUESTION_TIME);
    }
  }, [currentIdx, questions.length]);

  // Timer
  useEffect(() => {
    if (!started || loadingQ || questions.length === 0) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
  clearInterval(timerRef.current);

  if (currentIdx < questions.length - 1) {
    setCurrentIdx((i) => i + 1);
    setTimeLeft(QUESTION_TIME);
  } else {
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
  const answeredCount = Object.values(answers).filter((a) => a.trim()).length;
  const isAllAnswered = answeredCount === questions.length;

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
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            You will answer <strong className="text-white">{questions.length} questions</strong>.
            Each question has a <strong className="text-white">2-minute timer</strong>.
            Answer in your own words — the AI will evaluate your response and give feedback.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[["Questions", questions.length],["Time/Q","2 min"],["AI Feedback","✓"]].map(([label, val]) => (
              <div key={label} className="bg-dark-700 rounded-xl p-3 border border-dark-500">
                <p className="text-lg font-bold text-white font-display">{val}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
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
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400 font-medium">
            Question <span className="text-white">{currentIdx + 1}</span> of <span className="text-white">{questions.length}</span>
          </span>
          <span className="text-sm text-gray-400">{answeredCount} answered</span>
        </div>
        <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
        {/* Question dots */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`h-2 flex-1 min-w-[8px] rounded-full transition-colors ${
                i < currentIdx ? "bg-brand-600" :
                i === currentIdx ? "bg-brand-400 animate-pulse-slow" :
                "bg-dark-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className="card mb-6 animate-fade-in" key={currentIdx}>
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-indigo">{currentQ?.category}</span>
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
          value={answers[currentQ?.id] || ""}
          onChange={(e) => handleAnswerChange(currentQ?.id, e.target.value)}
          placeholder="Explain clearly with examples if possible..."
          className="input-field resize-none text-sm leading-relaxed"
          rows={7}
        />
        <p className="text-xs text-gray-500 mt-2">
          {(answers[currentQ?.id] || "").length} characters
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => { clearInterval(timerRef.current); setCurrentIdx((i) => Math.max(0, i - 1)); setTimeLeft(QUESTION_TIME); }}
          disabled={currentIdx === 0}
          className="btn-secondary disabled:opacity-40"
        >
          ← Previous
        </button>

        <div className="flex gap-3">
          {currentIdx < questions.length - 1 ? (
            <button onClick={goNext} className="btn-primary">
              Next Question →
            </button>
          ) : (
            <button
  onClick={handleSubmit}
  disabled={submitting || !isAllAnswered}
  className="btn-primary bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-400 disabled:opacity-50"
>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Submitting...
                </span>
              ) : `Submit Interview (${answeredCount}/${questions.length} answered)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
