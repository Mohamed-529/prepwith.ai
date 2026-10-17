import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const InterviewLockContext = createContext(null);

export const InterviewLockProvider = ({ children }) => {
  const [isInterviewLocked, setIsInterviewLocked] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [pendingTarget, setPendingTarget] = useState(null);
  const onQuitCallbackRef = useRef(null);

  const navigate = useNavigate();
  const { logout } = useAuth();

  // Open modal requesting user confirmation to quit
  const openQuitModal = useCallback((target = null, onQuitCallback = null) => {
    setPendingTarget(target);
    onQuitCallbackRef.current = onQuitCallback;
    setShowQuitModal(true);
  }, []);

  const closeQuitModal = useCallback(() => {
    setShowQuitModal(false);
    setPendingTarget(null);
    onQuitCallbackRef.current = null;
  }, []);

  // User confirms quitting the interview
  const confirmQuit = useCallback(() => {
    // Stop all speech synthesis and cancel audio
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    if (onQuitCallbackRef.current) {
      try {
        onQuitCallbackRef.current();
      } catch (_) {}
    }

    const dest = pendingTarget;
    setIsInterviewLocked(false);
    setShowQuitModal(false);
    setPendingTarget(null);
    onQuitCallbackRef.current = null;

    if (dest === "logout") {
      logout();
      navigate("/login");
    } else if (dest) {
      navigate(dest);
    } else {
      navigate("/dashboard");
    }
  }, [pendingTarget, logout, navigate]);

  // Intercept Browser Close / Refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isInterviewLocked) {
        e.preventDefault();
        e.returnValue = "You have an active interview session in progress. Progress will be lost.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isInterviewLocked]);

  // Intercept Browser Back Button (popstate)
  useEffect(() => {
    if (!isInterviewLocked) return;

    // Push dummy state to capture back button
    window.history.pushState({ interviewLock: true }, "", window.location.href);

    const handlePopState = (e) => {
      if (isInterviewLocked) {
        // Re-push state so user doesn't leave automatically
        window.history.pushState({ interviewLock: true }, "", window.location.href);
        openQuitModal("/dashboard");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isInterviewLocked, openQuitModal]);

  return (
    <InterviewLockContext.Provider
      value={{
        isInterviewLocked,
        setIsInterviewLocked,
        openQuitModal,
        closeQuitModal,
        confirmQuit,
        showQuitModal,
      }}
    >
      {children}

      {/* Global Quit Notice Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="card max-w-sm w-full bg-dark-900 border-rose-500/40 shadow-2xl p-6 relative animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-2xl mb-4 text-rose-400 shadow-sm">
              ⚠️
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Quit Interview?</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-5">
              Active interview in progress. Your recorded voice answers and score will not be saved if you leave now.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeQuitModal}
                className="btn-secondary text-xs py-2 px-3.5"
              >
                Keep Interviewing
              </button>
              <button
                type="button"
                onClick={confirmQuit}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 transition-colors"
              >
                Quit & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </InterviewLockContext.Provider>
  );
};

export const useInterviewLock = () => {
  const ctx = useContext(InterviewLockContext);
  if (!ctx) throw new Error("useInterviewLock must be used within InterviewLockProvider");
  return ctx;
};
