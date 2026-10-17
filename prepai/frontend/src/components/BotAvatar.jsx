import React from "react";
import botSvg from "../assets/bot-avatar.svg";

/**
 * BotAvatar - Dummy image and avatar component for the AI Interviewer bot.
 * Supports speaking animation effects, live audio wave rings, and size variants.
 */
const BotAvatar = ({
  size = "md", // "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
  isSpeaking = false,
  showStatus = false,
  className = "",
}) => {
  const sizeMap = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
    "2xl": "w-28 h-28",
  };

  const ringMap = {
    xs: "ring-1",
    sm: "ring-2",
    md: "ring-2",
    lg: "ring-3",
    xl: "ring-4",
    "2xl": "ring-4",
  };

  const dimClass = sizeMap[size] || sizeMap.md;
  const ringClass = ringMap[size] || ringMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${dimClass} ${className}`}>
      {/* Outer audio pulse ring when speaking */}
      {isSpeaking && (
        <>
          <span className="absolute -inset-1 rounded-2xl bg-cyan-500/30 animate-ping duration-1000" />
          <span className="absolute -inset-2 rounded-2xl bg-brand-500/20 animate-pulse duration-700" />
        </>
      )}

      {/* Main Avatar Image Container */}
      <div
        className={`relative w-full h-full rounded-2xl overflow-hidden bg-dark-900 border transition-all duration-300 shadow-lg ${
          isSpeaking
            ? `border-cyan-400 ${ringClass} ring-cyan-400/40 shadow-cyan-500/30 scale-105`
            : "border-dark-600 hover:border-brand-500/50 shadow-black/40"
        }`}
      >
        <img
          src={botSvg}
          alt="AI Interviewer Bot"
          className="w-full h-full object-cover select-none pointer-events-none"
          loading="eager"
        />

        {/* Dynamic Speaking Scanline overlay */}
        {isSpeaking && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Optional online indicator dot */}
      {showStatus && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-dark-900 ${
            isSpeaking ? "bg-cyan-400 animate-pulse" : "bg-emerald-400"
          }`}
          title={isSpeaking ? "AI Speaking" : "AI Ready"}
        />
      )}
    </div>
  );
};

export default BotAvatar;
