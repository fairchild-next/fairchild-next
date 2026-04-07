"use client";

/**
 * KidsPlantMascot — pure CSS animated butterfly.
 * No external dependencies, no network requests, works offline.
 * Rendered entirely with SVG + Tailwind keyframes via inline styles.
 */

export default function KidsPlantMascot({ name = "Butterfly" }: { name?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 select-none" aria-hidden>
      <div style={{ animation: "floatUpDown 3s ease-in-out infinite" }}>
        <svg
          viewBox="0 0 120 100"
          width="160"
          height="130"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left upper wing */}
          <ellipse
            cx="42" cy="38" rx="34" ry="26"
            fill="#7ED957"
            style={{ transformOrigin: "60px 55px", animation: "wingFlapLeft 0.7s ease-in-out infinite alternate" }}
          />
          {/* Left lower wing */}
          <ellipse
            cx="46" cy="68" rx="22" ry="16"
            fill="#5DBF3E"
            style={{ transformOrigin: "60px 55px", animation: "wingFlapLeft 0.7s ease-in-out infinite alternate" }}
          />
          {/* Right upper wing */}
          <ellipse
            cx="78" cy="38" rx="34" ry="26"
            fill="#7ED957"
            style={{ transformOrigin: "60px 55px", animation: "wingFlapRight 0.7s ease-in-out infinite alternate" }}
          />
          {/* Right lower wing */}
          <ellipse
            cx="74" cy="68" rx="22" ry="16"
            fill="#5DBF3E"
            style={{ transformOrigin: "60px 55px", animation: "wingFlapRight 0.7s ease-in-out infinite alternate" }}
          />
          {/* Wing pattern dots */}
          <circle cx="38" cy="34" r="5" fill="#FFFDE7" opacity="0.7" />
          <circle cx="82" cy="34" r="5" fill="#FFFDE7" opacity="0.7" />
          <circle cx="44" cy="66" r="3.5" fill="#FFFDE7" opacity="0.6" />
          <circle cx="76" cy="66" r="3.5" fill="#FFFDE7" opacity="0.6" />
          {/* Body */}
          <ellipse cx="60" cy="55" rx="6" ry="20" fill="#193521" />
          {/* Head */}
          <circle cx="60" cy="33" r="8" fill="#193521" />
          {/* Eyes */}
          <circle cx="57" cy="31" r="2" fill="white" />
          <circle cx="63" cy="31" r="2" fill="white" />
          <circle cx="57.5" cy="31.5" r="1" fill="#193521" />
          <circle cx="63.5" cy="31.5" r="1" fill="#193521" />
          {/* Smile */}
          <path d="M56 36 Q60 39 64 36" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Antennae */}
          <path d="M57 26 Q50 16 44 12" stroke="#193521" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="44" cy="11" r="3" fill="#7ED957" />
          <path d="M63 26 Q70 16 76 12" stroke="#193521" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="76" cy="11" r="3" fill="#7ED957" />
        </svg>
      </div>

      <p className="text-sm font-bold text-[#193521] opacity-70">{name}</p>

      <style>{`
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes wingFlapLeft {
          from { transform: scaleX(1) rotate(-5deg); }
          to   { transform: scaleX(0.55) rotate(5deg); }
        }
        @keyframes wingFlapRight {
          from { transform: scaleX(1) rotate(5deg); }
          to   { transform: scaleX(0.55) rotate(-5deg); }
        }
      `}</style>
    </div>
  );
}
