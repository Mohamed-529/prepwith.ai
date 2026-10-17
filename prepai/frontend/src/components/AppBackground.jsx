import React from "react";

/**
 * AppBackground - High-tech ambient background layer shared across every page.
 * Includes dynamic cosmic aurora gradients, subtle cyber grid overlay,
 * and ambient lighting accents.
 */
const AppBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Top Center Indigo/Violet Aurora Glow */}
      <div
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full opacity-35 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(139, 92, 246, 0.25) 45%, transparent 70%)",
        }}
      />

      {/* Top Left Cyber Cyan Ambient Beam */}
      <div
        className="absolute top-[15%] -left-[10%] w-[550px] h-[550px] rounded-full opacity-25 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(56, 189, 248, 0.15) 50%, transparent 70%)",
        }}
      />

      {/* Bottom Right Cyber Violet Ambient Orb */}
      <div
        className="absolute bottom-[5%] -right-[10%] w-[650px] h-[650px] rounded-full opacity-25 blur-[150px]"
        style={{
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 70%)",
        }}
      />

      {/* Center Subtle Vignette Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] opacity-15 blur-[160px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(79, 70, 229, 0.3) 0%, transparent 70%)",
        }}
      />

      {/* Ultra-fine Cyber Grid Mask Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* Tech Accent Horizontal Horizon Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
    </div>
  );
};

export default AppBackground;
