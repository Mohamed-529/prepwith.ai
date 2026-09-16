import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestions, submitAnswers } from "../utils/api";

const QUESTION_TIME = 120; // seconds per question

const TimerRing = ({ timeLeft, total }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / total;
  const offset = circumference * (1 - progress);
  const color = timeLeft > 60 ? "#2f93a8" : timeLeft > 30 ? "#d06b3f" : "#e11d48";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#e8efe9" strokeWidth="6" />
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
  const [loadError, setLoadError]     = useState("");
  const [submitError, setSubmitError] = useState("");
  const [started, setStarted]         = useState(false);
  const timerRef = useRef(null);
  const answersRef = useRef(answers);
  const submittingRef = useRef(false);
  const expireHandledRef = useRef(false);
  const navigate = useNavigate();

  answersRef.current = answers;

  useEffect(() => {
    const fetchQs = async () => {
      try {
        const { data } = await getQuestions();
        setQuestions(data.questions || []);
      } catch (err) {
        setLoadError("Failed to load questions. Please refresh.");
      } finally {
        setLoadingQ(false);
      }
    };
    fetchQs();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        questionText: q.question,
        userAnswer: answersRef.current[q.id] || "",
      }));
      const { data } = await submitAnswers({ answers: payload });
      navigate("/results", { state: { result: data } });
    } catch (err) {
      submittingRef.current = false;
      setSubmitError(err.response?.data?.message || "Failed to submit. Please try again.");
      setSubmitting(false);
    }
  }, [questions, navigate]);

  const goNext = useCallback(() => {
    clearInterval(timerRef.current);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setTimeLeft(QUESTION_TIME);
    } else {
      handleSubmit();
    }
  }, [currentIdx, questions.length, handleSubmit]);

  // Countdown timer — side effects run after tick, not inside setState
  useEffect(() => {
    if (!started || loadingQ || questions.length === 0 || submitting) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, currentIdx, loadingQ, questions.length, submitting]);

  useEffect(() => {
    if (timeLeft > 0) {
      expireHandledRef.current = false;
      return;
    }
    if (!started || submitting || expireHandledRef.current) return;
    expireHandledRef.current = true;
    goNext();
  }, [timeLeft, started, submitting, goNext]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const currentQ = questions[currentIdx];
  const answeredCount = Object.values(answers).filter((a) => a && a.trim()).length;

  if (loadingQ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <p className="text-rose-600 mb-4">{loadError || "No questions available. Please refresh."}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  // Start screen
  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-lg w-full text-center animate-slide-up shadow-lg shadow-mist-400/30">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Mock Interview Ready</h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">
            You will answer <strong className="text-slate-800">{questions.length} questions</strong>.
            Each question has a <strong className="text-slate-800">2-minute timer</strong>.
            Answer in your own words — the AI will evaluate your response and give feedback.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[["Questions", questions.length],["Time/Q","2 min"],["AI Feedback","✓"]].map(([label, val]) => (
              <div key={label} className="bg-mist-100 rounded-xl p-3 border border-mist-200">
                <p className="text-lg font-bold text-slate-800 font-display">{val}</p>
                <p className="text-xs text-slate-500">{label}</p>
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
          <span className="text-sm text-slate-500 font-medium">
            Question <span className="text-slate-800">{currentIdx + 1}</span> of <span className="text-slate-800">{questions.length}</span>
          </span>
          <span className="text-sm text-slate-500">{answeredCount} answered</span>
        </div>
        <div className="h-2 bg-mist-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-peach-400 rounded-full transition-all duration-500"
            style={{ width: `${questions.length ? ((currentIdx + 1) / questions.length) * 100 : 0}%` }}
          />
        </div>
        {/* Question dots */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`h-2 flex-1 min-w-[8px] rounded-full transition-colors ${
                i < currentIdx ? "bg-brand-500" :
                i === currentIdx ? "bg-peach-400 animate-pulse-slow" :
                "bg-mist-200"
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
            <h2 className="text-xl font-semibold text-slate-800 leading-relaxed">
              {currentQ?.question}
            </h2>
          </div>
          <TimerRing timeLeft={timeLeft} total={QUESTION_TIME} />
        </div>

        {currentQ?.hint && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-peach-50 border border-peach-100 mb-5">
            <svg className="w-4 h-4 text-peach-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
            <p className="text-sm text-peach-500">{currentQ.hint}</p>
          </div>
        )}

        <textarea
          value={answers[currentQ?.id] || ""}
          onChange={(e) => handleAnswerChange(currentQ?.id, e.target.value)}
          placeholder="Explain clearly with examples if possible..."
          className="input-field resize-none text-sm leading-relaxed"
          rows={7}
        />
        <p className="text-xs text-slate-400 mt-2">
          {(answers[currentQ?.id] || "").length} characters
        </p>
      </div>

      {submitError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {submitError}
        </div>
      )}

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
              disabled={submitting}
              className="btn-primary bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-300 disabled:opacity-50"
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
