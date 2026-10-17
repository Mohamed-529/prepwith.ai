import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestions, submitAnswers } from "../utils/api";
import BotAvatar from "../components/BotAvatar";
import { useInterviewLock } from "../context/InterviewLockContext";

const QUESTION_TIME = 120; // seconds per question

// Sound Wave Equalizer Component for active voice recording
const VoiceWaveVisualizer = ({ isRecording, audioLevel = 50 }) => {
  return (
    <div className="flex items-center justify-center gap-1.5 h-9 px-3 py-1.5 bg-dark-900/80 rounded-xl border border-brand-500/30">
      <span className="text-xs font-mono text-brand-300 mr-2 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        Live Voice:
      </span>
      {[24, 48, 72, 36, 88, 54, 78, 42, 66, 30, 92, 60].map((h, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${
            isRecording ? "bg-gradient-to-t from-brand-500 to-emerald-400" : "bg-dark-500"
          }`}
          style={{
            height: isRecording ? `${Math.max(6, (h * audioLevel) / 60)}px` : "5px",
            animation: isRecording ? `pulse 1.2s ease-in-out infinite ${i * 0.1}s` : "none",
          }}
        />
      ))}
    </div>
  );
};

// Countdown Timer Ring
const TimerRing = ({ timeLeft, total }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / total;
  const offset = circumference * (1 - progress);
  const color = timeLeft > 60 ? "#818cf8" : timeLeft > 30 ? "#eab308" : "#ef4444";

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="#1f2430" strokeWidth="3.5" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
        />
      </svg>
      <div className="text-center z-10">
        <span className="text-xs font-bold font-mono" style={{ color }}>
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

const CATEGORIES = ["All", "JavaScript", "React", "Node.js", "Database", "General CS", "CSS"];

const WISH_MESSAGE =
  "Welcome! Wishing you the very best of luck in your technical interview today. Stay calm, speak clearly, and trust your preparation. Whenever you are ready, click Proceed to begin.";

const InterviewPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [loadingQ, setLoadingQ] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Phases: "setup" (pre-room) -> "wishing" (in room, wish spoken, waiting for proceed) -> "active" (questions ongoing)
  const [phase, setPhase] = useState("setup");
  const [submittedIndices, setSubmittedIndices] = useState(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showHint, setShowHint] = useState(false);

  // Voice Selection & Synthesis States
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(
    () => localStorage.getItem("prepai_voice_uri") || ""
  );
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(true);

  // Speech Recognition States
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micAudioLevel, setMicAudioLevel] = useState(50);
  const [manualFallbackActive, setManualFallbackActive] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const recordIntervalRef = useRef(null);
  const chatBottomRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const navigate = useNavigate();

  const { isInterviewLocked, setIsInterviewLocked, openQuitModal } = useInterviewLock();

  const scrollToBottom = () => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Populate System Speech Synthesis Voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (!allVoices || allVoices.length === 0) return;

      // Filter for English or primary voices
      const enVoices = allVoices.filter((v) => v.lang.startsWith("en"));
      const list = enVoices.length > 0 ? enVoices : allVoices;
      setAvailableVoices(list);

      // Default preferred voice selection if none saved
      const saved = localStorage.getItem("prepai_voice_uri");
      const matchedSaved = list.find((v) => v.voiceURI === saved);

      if (!matchedSaved) {
        const preferred =
          list.find(
            (v) =>
              v.name.includes("Natural") ||
              v.name.includes("Google UK English Female") ||
              v.name.includes("Google US English") ||
              v.name.includes("Samantha") ||
              v.name.includes("Daniel") ||
              v.name.includes("Jenny")
          ) || list[0];

        if (preferred) {
          setSelectedVoiceURI(preferred.voiceURI);
          localStorage.setItem("prepai_voice_uri", preferred.voiceURI);
        }
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Fetch Questions for Selected Category
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
      setError("Failed to load interview questions.");
    } finally {
      setLoadingQ(false);
    }
  }, []);

  useEffect(() => {
    fetchQs(selectedCategory);
  }, [fetchQs, selectedCategory]);

  // Clean up lock state on unmount
  useEffect(() => {
    return () => {
      setIsInterviewLocked(false);
      stopAiVoice();
      stopRecording();
      clearInterval(timerRef.current);
      clearInterval(recordIntervalRef.current);
    };
  }, [setIsInterviewLocked]);

  // Speak AI Text using current selected voice
  const speakAI = useCallback(
    (text, onEndCallback = null) => {
      if (!aiVoiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
        if (onEndCallback) onEndCallback();
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = voiceRate;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        let targetVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);

        if (!targetVoice) {
          targetVoice =
            voices.find(
              (v) =>
                v.lang.startsWith("en") &&
                (v.name.includes("Natural") ||
                  v.name.includes("Google") ||
                  v.name.includes("Samantha") ||
                  v.name.includes("Daniel") ||
                  v.name.includes("Jenny"))
            ) || voices[0];
        }

        if (targetVoice) utterance.voice = targetVoice;

        utterance.onstart = () => setIsAiSpeaking(true);
        utterance.onend = () => {
          setIsAiSpeaking(false);
          if (onEndCallback) onEndCallback();
        };
        utterance.onerror = () => {
          setIsAiSpeaking(false);
          if (onEndCallback) onEndCallback();
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        setIsAiSpeaking(false);
        if (onEndCallback) onEndCallback();
      }
    },
    [aiVoiceEnabled, voiceRate, selectedVoiceURI]
  );

  const stopAiVoice = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    setIsAiSpeaking(false);
  };

  // Speech Recognition Initialization
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let finalTranscripts = "";
        let interimTranscripts = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscripts += item[0].transcript + " ";
          } else {
            interimTranscripts += item[0].transcript;
          }
        }

        if (finalTranscripts) {
          setAnswers((prev) => {
            const currentQId = questions[currentIdx]?.id;
            if (!currentQId) return prev;
            const existing = prev[currentQId] || "";
            const updated = (existing + " " + finalTranscripts).trim();
            return { ...prev, [currentQId]: updated };
          });
          setInterimText("");
          scrollToBottom();
        } else {
          setInterimText(interimTranscripts);
        }
      };

      recognition.onerror = (e) => {
        if (e.error === "no-speech") return;
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          setIsRecording(false);
          showToast("Microphone access denied. Please grant permission.");
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimText("");
      };

      recognitionRef.current = recognition;
    } catch (err) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [currentIdx, questions]);

  const startVisualizerMeter = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!mediaStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const avg = sum / dataArray.length;
        setMicAudioLevel(Math.min(100, Math.max(10, avg * 1.5)));
        requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (err) {
      setMicAudioLevel(60);
    }
  };

  const startRecording = () => {
    stopAiVoice();
    if (!recognitionRef.current) {
      setManualFallbackActive(true);
      showToast("Voice typing helper active.");
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      startVisualizerMeter();

      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsRecording(false);
    setInterimText("");
    clearInterval(recordIntervalRef.current);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const clearVoiceAnswer = () => {
    stopRecording();
    const currentQId = questions[currentIdx]?.id;
    if (currentQId) {
      setAnswers((prev) => ({ ...prev, [currentQId]: "" }));
      setInterimText("");
      showToast("Answer cleared.");
    }
  };

  const playbackSpokenAnswer = () => {
    const currentQId = questions[currentIdx]?.id;
    const text = answers[currentQId];
    if (!text || !text.trim()) {
      showToast("No answer recorded.");
      return;
    }
    stopRecording();
    speakAI(`Your recorded answer: ${text}`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Change Voice Helper
  const handleSelectVoice = (uri) => {
    setSelectedVoiceURI(uri);
    localStorage.setItem("prepai_voice_uri", uri);
    showToast("Voice updated.");

    // Quick audio preview
    setTimeout(() => {
      speakAI("Hello! I am your AI Interviewer.");
    }, 150);
  };

  // Step 1: User enters the interview room -> Bot gives wish & locks navigation
  const handleEnterInterviewRoom = () => {
    setPhase("wishing");
    setIsInterviewLocked(true); // Lock navigation immediately upon entering
    scrollToBottom();

    // Give warm wish via AI voice
    setTimeout(() => {
      speakAI(WISH_MESSAGE);
    }, 250);
  };

  // Step 2: User proceeds from the wish -> Start Questions & Countdown Timer
  const handleProceedToQuestions = () => {
    stopAiVoice();
    setPhase("active");
    setTimeLeft(QUESTION_TIME);
    scrollToBottom();

    if (questions.length > 0 && questions[0]) {
      const phrase = `Question 1. ${questions[0].question}`;
      speakAI(phrase);
    }
  };

  // Speak AI question when currentIdx changes during active phase
  useEffect(() => {
    if (phase !== "active" || questions.length === 0 || !questions[currentIdx]) return;
    setShowHint(false);
    stopRecording();

    const q = questions[currentIdx];
    const phrase = `Question ${currentIdx + 1}. ${q.question}`;
    speakAI(phrase);
    scrollToBottom();

    return () => {
      stopAiVoice();
      stopRecording();
    };
  }, [phase, currentIdx, questions, speakAI]);

  // Question Timer (ONLY runs during active phase!)
  useEffect(() => {
    if (phase !== "active" || loadingQ || questions.length === 0) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          stopRecording();
          stopAiVoice();

          setSubmittedIndices((prev) => {
            const nextSet = new Set(prev);
            nextSet.add(currentIdx);
            return nextSet;
          });

          if (currentIdx < questions.length - 1) {
            showToast(`Time up for Q${currentIdx + 1}. Auto-submitted.`);
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
  }, [phase, currentIdx, loadingQ, questions.length]);

  const handleConfirmNext = () => {
    stopRecording();
    stopAiVoice();
    clearInterval(timerRef.current);

    setSubmittedIndices((prev) => {
      const nextSet = new Set(prev);
      nextSet.add(currentIdx);
      return nextSet;
    });

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setTimeLeft(QUESTION_TIME);
      setRecordingSeconds(0);
      scrollToBottom();
    }
  };

  const handleSubmit = async () => {
    stopRecording();
    stopAiVoice();
    clearInterval(timerRef.current);
    setSubmitting(true);

    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        questionText: q.question,
        userAnswer: (answers[q.id] || "").trim(),
      }));

      // Release navigation lock before moving to results
      setIsInterviewLocked(false);
      const { data } = await submitAnswers({ answers: payload });
      navigate("/results", { state: { result: data } });
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
      setSubmitting(false);
    }
  };

  // Helper to quit interview cleanly if confirmed
  const handleQuitInterview = () => {
    openQuitModal("/dashboard", () => {
      stopRecording();
      stopAiVoice();
      clearInterval(timerRef.current);
      setPhase("setup");
      setIsInterviewLocked(false);
    });
  };

  const currentQ = questions[currentIdx];
  const currentAnswer = (answers[currentQ?.id] || "").trim();
  const answeredCount = Object.values(answers).filter((a) => a && a.trim()).length;
  const isCurrentAnswered = Boolean(currentAnswer);
  const wordCount = currentAnswer ? currentAnswer.split(/\s+/).length : 0;
  const activeVoiceObj = availableVoices.find((v) => v.voiceURI === selectedVoiceURI);

  if (loadingQ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-sm">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary text-sm py-2">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // PHASE 1: PRE-INTERVIEW SETUP SCREEN
  // ==========================================
  if (phase === "setup") {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 relative">
        {/* Subtle ambient light behind setup card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-600/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="card bg-dark-900/80 backdrop-blur-2xl border-white/[0.08] shadow-2xl p-6 sm:p-8 animate-slide-up relative z-10">
          {/* Header with Bot Avatar dummy image */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/[0.06]">
            <BotAvatar size="lg" isSpeaking={isAiSpeaking} showStatus={true} />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold mb-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI Interviewer Connected
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Voice Mock Interview</h2>
              <p className="text-gray-400 text-xs">Spoken technical interview evaluated by real-time RAG</p>
            </div>
          </div>

          {/* Domain Track Selection */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2.5">
              Select Practice Track:
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/30 border border-brand-400/40 scale-105"
                      : "bg-dark-950/70 text-gray-400 hover:text-gray-200 border border-white/[0.06] hover:border-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Engine & Customization */}
          <div className="p-4 rounded-2xl bg-dark-950/80 border border-white/[0.08] mb-6 shadow-inner">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-sm">
                  🎙️
                </div>
                <div>
                  <p className="text-xs font-bold text-white">AI Spoken Voice</p>
                  <p className="text-[11px] text-cyan-300 font-mono truncate max-w-[190px]">
                    {activeVoiceObj ? activeVoiceObj.name : "System Natural Voice"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    speakAI("PrepAI is ready for your technical interview.");
                    showToast("Audio test played.");
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/10 text-xs text-gray-200 font-medium shrink-0 transition-colors"
                >
                  🔊 Test
                </button>
                <button
                  type="button"
                  onClick={() => setShowVoiceModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shrink-0 shadow-sm shadow-brand-500/20 transition-all"
                >
                  Change Voice
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-white/[0.06]">
              <span className="font-medium text-gray-300">Speech Speed:</span>
              <div className="flex items-center gap-1.5">
                {[0.9, 1.0, 1.1].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setVoiceRate(r)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors ${
                      voiceRate === r
                        ? "bg-brand-600 text-white shadow-sm"
                        : "bg-dark-900 text-gray-400 hover:text-white border border-white/5"
                    }`}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rules / Badges */}
          <div className="grid grid-cols-3 gap-3 mb-6 text-center">
            <div className="bg-dark-950/70 p-3 rounded-xl border border-white/[0.06]">
              <span className="text-base">👋</span>
              <p className="text-xs font-bold text-white mt-1">Warm Wish</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Greeting first</p>
            </div>
            <div className="bg-dark-950/70 p-3 rounded-xl border border-white/[0.06]">
              <span className="text-base">🎙️</span>
              <p className="text-xs font-bold text-emerald-400 mt-1">Voice Only</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Spoken answers</p>
            </div>
            <div className="bg-dark-950/70 p-3 rounded-xl border border-white/[0.06]">
              <span className="text-base">🔒</span>
              <p className="text-xs font-bold text-purple-400 mt-1">Locked</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Focus mode</p>
            </div>
          </div>

          <button
            onClick={handleEnterInterviewRoom}
            className="btn-primary w-full text-sm py-3.5 flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30"
          >
            <span>Enter Interview Room →</span>
          </button>
        </div>

        {/* Voice Selection Modal */}
        {showVoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="card max-w-md w-full bg-dark-900 border-white/[0.1] shadow-2xl p-6 relative animate-scale-up">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🎙️</span>
                  <h3 className="text-base font-bold text-white">Select AI Voice</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVoiceModal(false)}
                  className="p-1 rounded-lg hover:bg-dark-800 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-400 mb-3">
                Choose the natural voice you prefer for the interviewer bot:
              </p>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 mb-5">
                {availableVoices.map((v) => {
                  const isSelected = v.voiceURI === selectedVoiceURI;
                  return (
                    <button
                      key={v.voiceURI}
                      type="button"
                      onClick={() => handleSelectVoice(v.voiceURI)}
                      className={`w-full text-left p-3 rounded-xl text-xs flex items-center justify-between transition-all border ${
                        isSelected
                          ? "bg-brand-950/80 border-brand-500 text-white font-semibold shadow-glow"
                          : "bg-dark-950/70 border-white/[0.06] text-gray-300 hover:bg-dark-850 hover:text-white"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="truncate font-semibold text-white">{v.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{v.lang}</p>
                      </div>
                      {isSelected && <span className="text-cyan-400 text-base font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVoiceModal(false)}
                  className="btn-primary text-xs py-2.5 px-5 shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // PHASE 2: WISHING ROOM (BOT WISHES USER, WAITING FOR CANDIDATE TO PROCEED)
  // ==========================================
  if (phase === "wishing") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in relative">
        {/* Ambient glow behind bot in wishing room */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Focus & Quit Header */}
        <div className="card bg-dark-900/80 backdrop-blur-xl border-white/[0.08] p-3.5 mb-6 flex items-center justify-between gap-3 shadow-lg relative z-10">
          <div className="flex items-center gap-3">
            <BotAvatar size="sm" isSpeaking={isAiSpeaking} showStatus={true} />
            <div>
              <p className="text-xs font-bold text-white">AI Interview Studio Room</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Session Initialized • Focus Locked
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVoiceModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/10 text-xs text-gray-200 transition-colors"
            >
              🎙️ Voice
            </button>
            <button
              type="button"
              onClick={handleQuitInterview}
              className="px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors"
            >
              🚪 Quit
            </button>
          </div>
        </div>

        {/* Central Greeting & Wish Card */}
        <div className="card bg-dark-900/85 backdrop-blur-2xl border-brand-500/40 p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden z-10">
          {/* Subtle top gradient bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-brand-500 to-purple-500" />

          {/* Prominent Bot Avatar Dummy Image */}
          <div className="flex flex-col items-center justify-center mb-6">
            <BotAvatar size="xl" isSpeaking={isAiSpeaking} showStatus={true} />
            <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-950/90 border border-brand-500/40 text-brand-300 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{isAiSpeaking ? "Interviewer Speaking..." : "Interviewer Ready"}</span>
            </div>
          </div>

          {/* Warm Wish Title & Text */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
            Best of Luck on Your Interview!
          </h2>
          <div className="p-5 rounded-2xl bg-dark-950/90 border border-white/[0.08] text-gray-200 text-sm leading-relaxed max-w-lg mx-auto mb-6 shadow-inner">
            <p className="italic">"{WISH_MESSAGE}"</p>
          </div>

          {/* Track Summary Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs text-gray-300">
            <span className="px-3 py-1 rounded-xl bg-dark-950 border border-white/10">
              Track: <strong className="text-white">{selectedCategory}</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-dark-950 border border-white/10">
              Questions: <strong className="text-white">{questions.length} Total</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-dark-950 border border-white/10">
              Voice: <strong className="text-cyan-300">{activeVoiceObj ? activeVoiceObj.name.split(" ")[0] : "AI"}</strong>
            </span>
          </div>

          {/* Action Buttons: Re-listen or Proceed to First Question */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => speakAI(WISH_MESSAGE)}
              className="btn-secondary w-full sm:w-auto text-xs py-3 px-5 flex items-center justify-center gap-2"
            >
              <span>🔊 Replay Wish</span>
            </button>

            <button
              type="button"
              onClick={handleProceedToQuestions}
              className="btn-primary w-full sm:w-auto text-sm py-3 px-7 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 shadow-xl shadow-brand-500/30"
            >
              <span>Proceed to First Question →</span>
            </button>
          </div>

          <p className="text-[11px] text-gray-400 mt-5">
            Navigation is locked during the interview. The 120s timer begins when you click Proceed.
          </p>
        </div>

        {/* Voice Selection Modal */}
        {showVoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="card max-w-md w-full bg-dark-900 border-white/[0.1] shadow-2xl p-6 relative animate-scale-up">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🎙️</span>
                  <h3 className="text-base font-bold text-white">Select AI Voice</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVoiceModal(false)}
                  className="p-1 rounded-lg hover:bg-dark-800 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 mb-5">
                {availableVoices.map((v) => {
                  const isSelected = v.voiceURI === selectedVoiceURI;
                  return (
                    <button
                      key={v.voiceURI}
                      type="button"
                      onClick={() => handleSelectVoice(v.voiceURI)}
                      className={`w-full text-left p-3 rounded-xl text-xs flex items-center justify-between transition-all border ${
                        isSelected
                          ? "bg-brand-950/80 border-brand-500 text-white font-semibold shadow-glow"
                          : "bg-dark-950/70 border-white/[0.06] text-gray-300 hover:bg-dark-850 hover:text-white"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="truncate font-semibold text-white">{v.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{v.lang}</p>
                      </div>
                      {isSelected && <span className="text-cyan-400 text-base font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVoiceModal(false)}
                  className="btn-primary text-xs py-2.5 px-5"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // PHASE 3: ACTIVE QUESTIONS & SPOKEN ANSWERS
  // ==========================================
  return (
    <div className="max-w-3xl mx-auto px-4 py-5 pb-20 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 px-4 py-2.5 rounded-xl bg-dark-900/95 border border-brand-500/50 text-brand-200 text-xs flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-slide-up">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="card bg-dark-900/85 border-white/[0.08] p-3.5 mb-5 shadow-2xl backdrop-blur-2xl sticky top-16 z-30">
        <div className="flex items-center justify-between gap-3">
          {/* AI Persona with Bot Avatar dummy image */}
          <div className="flex items-center gap-3">
            <BotAvatar size="md" isSpeaking={isAiSpeaking} showStatus={true} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">AI Interviewer</span>
                <span className="badge-cyan text-[10px] py-0 px-2">{currentQ?.category}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {isAiSpeaking ? (
                  <span className="text-cyan-300 font-semibold animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Speaking question...
                  </span>
                ) : (
                  <span>Awaiting spoken response</span>
                )}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVoiceModal(true)}
              className="p-1.5 px-2.5 rounded-xl text-xs font-semibold border border-white/10 bg-dark-850 hover:bg-dark-800 text-gray-200 transition-colors"
              title="Change Voice"
            >
              🎙️ Voice
            </button>

            <button
              type="button"
              onClick={() => {
                if (aiVoiceEnabled) {
                  stopAiVoice();
                  setAiVoiceEnabled(false);
                  showToast("Muted.");
                } else {
                  setAiVoiceEnabled(true);
                  showToast("Voice enabled.");
                }
              }}
              className="p-1.5 px-2.5 rounded-xl text-xs font-semibold border border-white/10 bg-dark-850 hover:bg-dark-800 text-gray-200 transition-colors"
            >
              {aiVoiceEnabled ? "🔊 Sound" : "🔇 Muted"}
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentQ) speakAI(`Question ${currentIdx + 1}. ${currentQ.question}`);
              }}
              className="p-1.5 px-2.5 rounded-xl text-xs font-semibold border border-white/10 bg-dark-850 hover:bg-dark-800 text-gray-200 transition-colors"
            >
              🔁 Repeat
            </button>

            <button
              type="button"
              onClick={handleQuitInterview}
              className="p-1.5 px-2.5 rounded-xl text-xs font-semibold border border-rose-500/40 bg-rose-950/70 text-rose-300 hover:bg-rose-900 transition-colors"
              title="Quit Session"
            >
              🚪 Quit
            </button>

            <TimerRing timeLeft={timeLeft} total={QUESTION_TIME} />
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
            <span>
              Question <span className="text-white font-bold">{currentIdx + 1}</span> of{" "}
              <span className="text-white font-bold">{questions.length}</span>
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-emerald-400 font-semibold">🔒 {submittedIndices.size} locked</span>
              <span className="text-gray-400">• {answeredCount} spoken</span>
            </div>
          </div>
          <div className="h-1.5 bg-dark-950 rounded-full overflow-hidden p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-brand-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Conversational Chat Feed */}
      <div className="space-y-4 mb-6">
        {/* System Initial Wishing Message with Bot Avatar */}
        <div className="flex items-start gap-3 animate-fade-in">
          <BotAvatar size="sm" isSpeaking={false} />
          <div className="bg-dark-900/80 border border-brand-500/30 rounded-2xl rounded-tl-sm p-4 max-w-xl text-xs text-gray-200 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-white">AI Interviewer</span>
              <span className="text-[10px] text-cyan-300 font-mono">Greeting & Wish</span>
            </div>
            <p className="italic text-gray-300">"{WISH_MESSAGE}"</p>
          </div>
        </div>

        {/* Past Questions & Answers (Locked) */}
        {questions.slice(0, currentIdx).map((q, idx) => {
          const pastAnswer = answers[q.id] || "";
          return (
            <div key={q.id} className="space-y-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-start gap-3 opacity-80">
                <BotAvatar size="sm" isSpeaking={false} />
                <div className="bg-dark-900/70 border border-white/10 rounded-2xl rounded-tl-sm p-4 max-w-xl text-xs">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-gray-400">
                    <span className="font-bold">Q{idx + 1}</span>
                    <span className="badge-indigo text-[10px] py-0 px-1.5">{q.category}</span>
                    <span className="text-emerald-400 ml-auto font-semibold">🔒 Locked</span>
                  </div>
                  <p className="font-semibold text-white">{q.question}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 justify-end opacity-85">
                <div className="bg-dark-850/80 border border-white/10 rounded-2xl rounded-tr-sm p-3.5 max-w-xl text-xs">
                  <div className="flex items-center justify-between gap-3 mb-1 text-[11px] text-gray-400">
                    <span className="text-emerald-400 font-semibold">🎙️ Candidate Voice</span>
                    <span>{pastAnswer ? pastAnswer.split(/\s+/).length : 0} words</span>
                  </div>
                  <p className="text-gray-200 italic font-mono text-[11px]">"{pastAnswer || "No answer recorded."}"</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-dark-950 border border-white/10 flex items-center justify-center text-white text-xs shrink-0 font-bold shadow-sm">
                  You
                </div>
              </div>
            </div>
          );
        })}

        {/* Current Active Question */}
        {currentQ && (
          <div className="space-y-4 pt-2 animate-fade-in" key={currentQ.id}>
            <div className="flex items-start gap-3">
              <BotAvatar size="sm" isSpeaking={isAiSpeaking} />
              <div className="bg-dark-900/90 border border-brand-500/40 rounded-2xl rounded-tl-sm p-5 max-w-xl text-xs shadow-glow">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="badge-cyan text-[10px] py-0 px-2">{currentQ.category}</span>
                    <span className="text-[11px] font-mono text-gray-400 font-bold">Q{currentIdx + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakAI(currentQ.question)}
                    className="text-[11px] text-brand-300 hover:text-white flex items-center gap-1 bg-brand-950/80 px-2.5 py-1 rounded-lg border border-brand-500/40 font-semibold"
                  >
                    <span>🔊 Listen</span>
                  </button>
                </div>

                <h3 className="text-base font-bold text-white leading-relaxed mb-2.5">{currentQ.question}</h3>

                {currentQ.hint && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="text-[11px] text-brand-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>💡 {showHint ? "Hide Hint" : "Need a Hint?"}</span>
                    </button>
                    {showHint && (
                      <p className="mt-2 p-2.5 rounded-xl bg-dark-950 text-[11px] text-brand-200 border border-brand-500/30">
                        {currentQ.hint}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Candidate Voice Answer Block */}
            <div className="flex items-start gap-3 justify-end">
              <div className="bg-dark-900/90 border border-brand-500/50 rounded-2xl rounded-tr-sm p-5 max-w-xl w-full text-xs space-y-3 shadow-2xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Your Spoken Answer</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-dark-950 text-gray-400 font-mono border border-white/5">
                      {wordCount} words
                    </span>
                  </div>

                  <VoiceWaveVisualizer isRecording={isRecording} audioLevel={micAudioLevel} />
                </div>

                {/* Spoken Text Box */}
                <div className="min-h-24 p-3.5 rounded-xl bg-dark-950/90 border border-white/10 text-gray-200 text-xs leading-relaxed font-sans relative shadow-inner">
                  {currentAnswer ? (
                    <p className="whitespace-pre-wrap">{currentAnswer}</p>
                  ) : (
                    <span className="text-gray-500 italic">
                      Click "Record Answer" and speak clearly into your microphone...
                    </span>
                  )}
                  {interimText && <span className="text-cyan-300 italic font-medium"> {interimText}...</span>}
                </div>

                {/* Microphone Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-md ${
                        isRecording
                          ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-600/30"
                          : "bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30"
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <span>Stop Recording ({recordingSeconds}s)</span>
                        </>
                      ) : (
                        <>
                          <span>🎙️</span>
                          <span>{isCurrentAnswered ? "Resume Recording" : "Record Answer"}</span>
                        </>
                      )}
                    </button>

                    {isCurrentAnswered && !isRecording && (
                      <button
                        type="button"
                        onClick={clearVoiceAnswer}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-dark-850 hover:bg-dark-800 text-gray-200 border border-white/10"
                      >
                        🔄 Re-speak
                      </button>
                    )}

                    {isCurrentAnswered && !isRecording && (
                      <button
                        type="button"
                        onClick={playbackSpokenAnswer}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-dark-850 hover:bg-dark-800 text-gray-200 border border-white/10"
                      >
                        ▶️ Listen
                      </button>
                    )}
                  </div>

                  {!speechSupported && (
                    <button
                      type="button"
                      onClick={() => setManualFallbackActive(!manualFallbackActive)}
                      className="text-xs text-brand-400 hover:underline"
                    >
                      {manualFallbackActive ? "Hide Helper" : "Dictation Helper"}
                    </button>
                  )}
                </div>

                {manualFallbackActive && (
                  <div className="p-3 bg-dark-950 rounded-xl border border-white/10 text-xs space-y-2">
                    <input
                      type="text"
                      placeholder="Type what you spoke & press Enter..."
                      className="input-field text-xs py-1.5"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          const val = e.target.value.trim();
                          const currentQId = currentQ.id;
                          setAnswers((prev) => ({
                            ...prev,
                            [currentQId]: ((prev[currentQId] || "") + " " + val).trim(),
                          }));
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="w-8 h-8 rounded-xl bg-dark-950 border border-white/10 flex items-center justify-center text-white text-xs shrink-0 font-bold shadow-sm">
                You
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Dock Bar */}
      <div className="card bg-dark-900/90 border-white/[0.08] p-3.5 shadow-2xl flex items-center justify-between gap-3 sticky bottom-4 z-40 backdrop-blur-2xl">
        <button
          type="button"
          onClick={handleQuitInterview}
          className="px-3.5 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-semibold transition-colors shadow-sm"
        >
          🚪 Quit Interview
        </button>

        <div>
          {currentIdx < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                if (isRecording) stopRecording();
                setShowConfirmModal(true);
              }}
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 shadow-lg shadow-brand-500/25"
            >
              <span>Next Question →</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (isRecording) stopRecording();
                setShowConfirmModal(true);
              }}
              disabled={submitting}
              className="btn-primary bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs py-2.5 px-6 flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/25"
            >
              {submitting ? "Evaluating with RAG..." : `Submit Interview (${answeredCount}/${questions.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="card max-w-md w-full bg-dark-900 border-white/10 shadow-2xl p-6 relative animate-scale-up">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-base font-bold text-white">
                  {currentIdx < questions.length - 1 ? "Submit Answer & Lock?" : "Submit Interview Evaluation?"}
                </h3>
                <p className="text-xs text-amber-300 mt-0.5">Answer is permanently locked after submission.</p>
              </div>
            </div>

            <div className="bg-dark-950/90 rounded-xl p-3.5 border border-white/10 mb-5 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Transcript Check:</span>
                <span className={isCurrentAnswered ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                  {isCurrentAnswered ? `${wordCount} words recorded` : "No voice answer detected"}
                </span>
              </div>
              <div className="max-h-24 overflow-y-auto rounded-lg bg-dark-900 p-2.5 text-gray-200 font-mono text-[11px] border border-white/5">
                {currentAnswer || <span className="text-rose-400 italic">No answer spoken yet.</span>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Review Answer
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
                className={`btn-primary text-xs py-2 px-5 ${
                  currentIdx === questions.length - 1 ? "bg-emerald-600 hover:bg-emerald-500" : ""
                }`}
              >
                Confirm & Proceed →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Selection Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="card max-w-md w-full bg-dark-900 border-white/10 shadow-2xl p-6 relative animate-scale-up">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🎙️</span>
                <h3 className="text-base font-bold text-white">Change AI Voice</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVoiceModal(false)}
                className="p-1 rounded-lg hover:bg-dark-800 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-3">
              Select another natural voice for the interviewer bot:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 mb-5">
              {availableVoices.map((v) => {
                const isSelected = v.voiceURI === selectedVoiceURI;
                return (
                  <button
                    key={v.voiceURI}
                    type="button"
                    onClick={() => handleSelectVoice(v.voiceURI)}
                    className={`w-full text-left p-3 rounded-xl text-xs flex items-center justify-between transition-all border ${
                      isSelected
                        ? "bg-brand-950/80 border-brand-500 text-white font-semibold shadow-glow"
                        : "bg-dark-950/70 border-white/[0.06] text-gray-300 hover:bg-dark-850 hover:text-white"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="truncate font-semibold text-white">{v.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{v.lang}</p>
                    </div>
                    {isSelected && <span className="text-cyan-400 text-base font-bold">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowVoiceModal(false)}
                className="btn-primary text-xs py-2 px-5"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
