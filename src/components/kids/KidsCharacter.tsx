"use client";

/**
 * KidsCharacter — four modern flat-design SVG characters for kids mode.
 * Pure SVG + CSS keyframes, no external dependencies, works offline.
 *
 * Characters: butterfly | flower | bee | bird
 * Each has its own internal motion animation (flap, spin, buzz, etc.)
 * The parent is responsible for the float up/down wrapper if desired.
 */

export type CharacterType = "butterfly" | "flower" | "bee" | "bird";

const CHARACTERS: CharacterType[] = ["butterfly", "flower", "bee", "bird"];

export function randomCharacter(): CharacterType {
  return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
}

// ─── Butterfly ────────────────────────────────────────────────────────────────
function Butterfly() {
  return (
    <>
      <style>{`
        @keyframes bfWingL {
          0%,100% { transform: scaleX(1) skewY(-2deg); }
          50%      { transform: scaleX(0.38) skewY(4deg); }
        }
        @keyframes bfWingR {
          0%,100% { transform: scaleX(1) skewY(2deg); }
          50%      { transform: scaleX(0.38) skewY(-4deg); }
        }
        @keyframes bfBody {
          0%,100% { transform: scaleY(1); }
          50%      { transform: scaleY(1.04); }
        }
      `}</style>
      <svg viewBox="0 0 120 110" width="160" height="146" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bfWingUL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8E063" />
            <stop offset="60%" stopColor="#56C135" />
            <stop offset="100%" stopColor="#2d8a1a" />
          </linearGradient>
          <linearGradient id="bfWingLL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7ED957" />
            <stop offset="100%" stopColor="#3aad1e" />
          </linearGradient>
          <linearGradient id="bfBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2d5a27" />
            <stop offset="100%" stopColor="#0f2d0b" />
          </linearGradient>
          <filter id="bfShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#193521" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Left upper wing */}
        <path
          d="M60,52 C54,32 28,14 16,30 C10,40 16,58 60,65 Z"
          fill="url(#bfWingUL)" filter="url(#bfShadow)"
          style={{ transformOrigin: "60px 58px", animation: "bfWingL 0.65s ease-in-out infinite" }}
        />
        {/* Left lower wing */}
        <path
          d="M60,60 C46,64 24,74 24,64 C24,55 42,56 60,58 Z"
          fill="url(#bfWingLL)"
          style={{ transformOrigin: "60px 59px", animation: "bfWingL 0.65s ease-in-out infinite" }}
        />
        {/* Left wing spots */}
        <ellipse cx="36" cy="38" rx="6" ry="4" fill="#fffde0" opacity="0.7"
          style={{ transformOrigin: "60px 58px", animation: "bfWingL 0.65s ease-in-out infinite" }} />
        <ellipse cx="28" cy="48" rx="4" ry="3" fill="#fffde0" opacity="0.5"
          style={{ transformOrigin: "60px 58px", animation: "bfWingL 0.65s ease-in-out infinite" }} />

        {/* Right upper wing */}
        <path
          d="M60,52 C66,32 92,14 104,30 C110,40 104,58 60,65 Z"
          fill="url(#bfWingUL)" filter="url(#bfShadow)"
          style={{ transformOrigin: "60px 58px", animation: "bfWingR 0.65s ease-in-out infinite" }}
        />
        {/* Right lower wing */}
        <path
          d="M60,60 C74,64 96,74 96,64 C96,55 78,56 60,58 Z"
          fill="url(#bfWingLL)"
          style={{ transformOrigin: "60px 59px", animation: "bfWingR 0.65s ease-in-out infinite" }}
        />
        {/* Right wing spots */}
        <ellipse cx="84" cy="38" rx="6" ry="4" fill="#fffde0" opacity="0.7"
          style={{ transformOrigin: "60px 58px", animation: "bfWingR 0.65s ease-in-out infinite" }} />
        <ellipse cx="92" cy="48" rx="4" ry="3" fill="#fffde0" opacity="0.5"
          style={{ transformOrigin: "60px 58px", animation: "bfWingR 0.65s ease-in-out infinite" }} />

        {/* Body */}
        <ellipse cx="60" cy="62" rx="5.5" ry="18" fill="url(#bfBody)"
          style={{ transformOrigin: "60px 62px", animation: "bfBody 0.65s ease-in-out infinite" }} />
        {/* Body segments */}
        <ellipse cx="60" cy="56" rx="4" ry="3" fill="#4a8c40" opacity="0.5" />
        <ellipse cx="60" cy="66" rx="4" ry="3" fill="#4a8c40" opacity="0.4" />
        <ellipse cx="60" cy="74" rx="3" ry="2.5" fill="#4a8c40" opacity="0.3" />

        {/* Head */}
        <circle cx="60" cy="44" r="9" fill="#193521" />
        <circle cx="60" cy="44" r="7.5" fill="#2d5a27" />
        {/* Eyes */}
        <circle cx="56.5" cy="42" r="3" fill="white" />
        <circle cx="63.5" cy="42" r="3" fill="white" />
        <circle cx="57" cy="42.5" r="1.6" fill="#0f1f0e" />
        <circle cx="64" cy="42.5" r="1.6" fill="#0f1f0e" />
        <circle cx="56.3" cy="41.5" r="0.8" fill="white" />
        <circle cx="63.3" cy="41.5" r="0.8" fill="white" />
        {/* Smile */}
        <path d="M57 47 Q60 50 63 47" stroke="#7ED957" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* Antennae */}
        <path d="M57.5,36 Q52,26 46,21" stroke="#193521" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="45.5" cy="20.5" r="3" fill="#7ED957" />
        <circle cx="45.5" cy="20.5" r="1.5" fill="#A8E063" />
        <path d="M62.5,36 Q68,26 74,21" stroke="#193521" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="74.5" cy="20.5" r="3" fill="#7ED957" />
        <circle cx="74.5" cy="20.5" r="1.5" fill="#A8E063" />
      </svg>
    </>
  );
}

// ─── Flower ───────────────────────────────────────────────────────────────────
function Flower() {
  return (
    <>
      <style>{`
        @keyframes flowerSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes flowerBob {
          0%,100% { transform: scaleY(1); }
          50%      { transform: scaleY(1.06); }
        }
        @keyframes flowerBlink {
          0%,90%,100% { transform: scaleY(1); }
          95%          { transform: scaleY(0.15); }
        }
      `}</style>
      <svg viewBox="0 0 100 110" width="148" height="163" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="flPetal" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFB3D9" />
            <stop offset="100%" stopColor="#FF6BAF" />
          </radialGradient>
          <radialGradient id="flCenter" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFE566" />
            <stop offset="100%" stopColor="#FFB400" />
          </radialGradient>
          <radialGradient id="flLeaf" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#A8E063" />
            <stop offset="100%" stopColor="#3aad1e" />
          </radialGradient>
          <filter id="flShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#9b3070" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Stem */}
        <path d="M50,80 Q46,90 44,100" stroke="#3aad1e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* Leaves */}
        <ellipse cx="38" cy="90" rx="10" ry="5" fill="url(#flLeaf)" transform="rotate(-35,38,90)" />
        <ellipse cx="52" cy="93" rx="9" ry="4.5" fill="url(#flLeaf)" transform="rotate(20,52,93)" />

        {/* Petals — spinning group */}
        <g style={{ transformOrigin: "50px 48px", animation: "flowerSpin 8s linear infinite" }}
           filter="url(#flShadow)">
          {[0,60,120,180,240,300].map((deg) => (
            <ellipse
              key={deg}
              cx="50" cy="28" rx="9" ry="16"
              fill="url(#flPetal)"
              transform={`rotate(${deg},50,48)`}
              opacity="0.92"
            />
          ))}
        </g>

        {/* Center disc */}
        <circle cx="50" cy="48" r="18" fill="url(#flCenter)"
          style={{ transformOrigin: "50px 48px", animation: "flowerBob 2s ease-in-out infinite" }} />
        <circle cx="50" cy="48" r="14" fill="#FFD43B" />
        {/* Texture dots on center */}
        {[[-5,-4],[5,-4],[0,2],[-4,5],[4,5]].map(([x,y],i) => (
          <circle key={i} cx={50+x} cy={48+y} r="1.8" fill="#e8a000" opacity="0.6" />
        ))}

        {/* Face */}
        {/* Eyes */}
        <ellipse cx="45.5" cy="45" rx="3" ry="3.5" fill="white"
          style={{ transformOrigin: "45.5px 45px", animation: "flowerBlink 4s ease-in-out infinite" }} />
        <ellipse cx="54.5" cy="45" rx="3" ry="3.5" fill="white"
          style={{ transformOrigin: "54.5px 45px", animation: "flowerBlink 4s ease-in-out 0.1s infinite" }} />
        <circle cx="46" cy="45.5" r="1.6" fill="#1a0a00" />
        <circle cx="55" cy="45.5" r="1.6" fill="#1a0a00" />
        <circle cx="45.3" cy="44.5" r="0.8" fill="white" />
        <circle cx="54.3" cy="44.5" r="0.8" fill="white" />
        {/* Cheeks */}
        <ellipse cx="43" cy="49.5" rx="3" ry="2" fill="#FF8BC8" opacity="0.5" />
        <ellipse cx="57" cy="49.5" rx="3" ry="2" fill="#FF8BC8" opacity="0.5" />
        {/* Smile */}
        <path d="M45 51.5 Q50 56 55 51.5" stroke="#c0560a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </>
  );
}

// ─── Bee ──────────────────────────────────────────────────────────────────────
function Bee() {
  return (
    <>
      <style>{`
        @keyframes beeBuzz {
          0%,100% { transform: translateX(0) rotate(-3deg); }
          25%      { transform: translateX(2px) rotate(3deg); }
          75%      { transform: translateX(-2px) rotate(-3deg); }
        }
        @keyframes beeWing {
          0%,100% { transform: scaleY(1) rotate(-15deg); opacity: 0.7; }
          50%      { transform: scaleY(0.5) rotate(-15deg); opacity: 0.9; }
        }
        @keyframes beeWingR {
          0%,100% { transform: scaleY(1) rotate(15deg); opacity: 0.7; }
          50%      { transform: scaleY(0.5) rotate(15deg); opacity: 0.9; }
        }
      `}</style>
      <svg viewBox="0 0 100 110" width="148" height="163" xmlns="http://www.w3.org/2000/svg"
           style={{ animation: "beeBuzz 0.3s ease-in-out infinite" }}>
        <defs>
          <linearGradient id="beeBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE566" />
            <stop offset="100%" stopColor="#FFB400" />
          </linearGradient>
          <linearGradient id="beeHead" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD43B" />
            <stop offset="100%" stopColor="#e8a000" />
          </linearGradient>
          <radialGradient id="beeWingGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#dff6ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#aaddff" stopOpacity="0.5" />
          </radialGradient>
          <filter id="beeShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#7a5800" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Wings */}
        <ellipse cx="34" cy="42" rx="16" ry="9" fill="url(#beeWingGrad)" stroke="#aaddff" strokeWidth="0.8"
          style={{ transformOrigin: "44px 46px", animation: "beeWing 0.15s linear infinite" }} />
        <ellipse cx="66" cy="42" rx="16" ry="9" fill="url(#beeWingGrad)" stroke="#aaddff" strokeWidth="0.8"
          style={{ transformOrigin: "56px 46px", animation: "beeWingR 0.15s linear infinite" }} />

        {/* Body */}
        <ellipse cx="50" cy="68" rx="18" ry="24" fill="url(#beeBody)" filter="url(#beeShadow)" />
        {/* Stripes */}
        <rect x="32.5" y="58" width="35" height="6" rx="3" fill="#1a1a00" opacity="0.85" />
        <rect x="32.5" y="68" width="35" height="6" rx="3" fill="#1a1a00" opacity="0.85" />
        <rect x="33.5" y="78" width="33" height="5" rx="2.5" fill="#1a1a00" opacity="0.75" />
        {/* Body shine */}
        <ellipse cx="44" cy="56" rx="6" ry="3" fill="white" opacity="0.25" transform="rotate(-15,44,56)" />

        {/* Stinger */}
        <path d="M50,92 L47,100 L53,100 Z" fill="#e8a000" />
        <path d="M50,92 L50,100" stroke="#c07800" strokeWidth="1.2" fill="none" />

        {/* Head */}
        <circle cx="50" cy="44" r="14" fill="url(#beeHead)" filter="url(#beeShadow)" />
        <circle cx="50" cy="44" r="12" fill="#FFD43B" />
        {/* Fuzz on top */}
        {[-6,-3,0,3,6].map((x,i) => (
          <ellipse key={i} cx={50+x} cy={32} rx="2" ry="3.5" fill="#e8a000" opacity="0.7"
            transform={`rotate(${x*3},${50+x},32)`} />
        ))}
        {/* Eyes */}
        <circle cx="44.5" cy="43" r="4" fill="#1a1a00" />
        <circle cx="55.5" cy="43" r="4" fill="#1a1a00" />
        <circle cx="43.5" cy="41.5" r="1.5" fill="white" />
        <circle cx="54.5" cy="41.5" r="1.5" fill="white" />
        {/* Cheeks */}
        <ellipse cx="41" cy="48" rx="3.5" ry="2.2" fill="#FFB347" opacity="0.6" />
        <ellipse cx="59" cy="48" rx="3.5" ry="2.2" fill="#FFB347" opacity="0.6" />
        {/* Smile */}
        <path d="M45 50 Q50 54.5 55 50" stroke="#7a5800" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Antennae */}
        <path d="M46,31 Q42,24 38,20" stroke="#1a1a00" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="37.5" cy="19.5" r="2.5" fill="#FFB400" />
        <path d="M54,31 Q58,24 62,20" stroke="#1a1a00" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="62.5" cy="19.5" r="2.5" fill="#FFB400" />
      </svg>
    </>
  );
}

// ─── Bird ─────────────────────────────────────────────────────────────────────
function Bird() {
  return (
    <>
      <style>{`
        @keyframes birdWing {
          0%,100% { transform: rotate(-15deg); }
          50%      { transform: rotate(25deg); }
        }
        @keyframes birdTail {
          0%,100% { transform: rotate(-8deg); }
          50%      { transform: rotate(8deg); }
        }
        @keyframes birdBob {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-4px); }
        }
      `}</style>
      <svg viewBox="0 0 100 110" width="148" height="163" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="birdBody" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#4ECDC4" />
            <stop offset="100%" stopColor="#1a9e94" />
          </radialGradient>
          <radialGradient id="birdHead" cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFE566" />
            <stop offset="100%" stopColor="#f5c800" />
          </radialGradient>
          <radialGradient id="birdWing" cx="30%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#7ED957" />
            <stop offset="100%" stopColor="#2d8a1a" />
          </radialGradient>
          <filter id="birdShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0a4a46" floodOpacity="0.25" />
          </filter>
        </defs>

        <g style={{ animation: "birdBob 1.8s ease-in-out infinite" }}>
          {/* Tail feathers */}
          <ellipse cx="28" cy="76" rx="8" ry="18" fill="#FF6B9D" opacity="0.9"
            transform="rotate(-30,28,76)"
            style={{ transformOrigin: "36px 70px", animation: "birdTail 1.8s ease-in-out infinite" }} />
          <ellipse cx="24" cy="78" rx="6" ry="16" fill="#c0396b" opacity="0.7"
            transform="rotate(-45,24,78)"
            style={{ transformOrigin: "36px 70px", animation: "birdTail 1.8s ease-in-out infinite" }} />
          <ellipse cx="33" cy="75" rx="7" ry="16" fill="#FF8BC8" opacity="0.8"
            transform="rotate(-15,33,75)"
            style={{ transformOrigin: "36px 70px", animation: "birdTail 1.8s ease-in-out infinite" }} />

          {/* Wing */}
          <ellipse cx="62" cy="62" rx="20" ry="12" fill="url(#birdWing)" filter="url(#birdShadow)"
            transform="rotate(20,62,62)"
            style={{ transformOrigin: "46px 65px", animation: "birdWing 0.8s ease-in-out infinite" }} />

          {/* Body */}
          <ellipse cx="50" cy="68" rx="22" ry="20" fill="url(#birdBody)" filter="url(#birdShadow)" />
          {/* Belly */}
          <ellipse cx="52" cy="72" rx="12" ry="10" fill="#7fded8" opacity="0.5" />

          {/* Head */}
          <circle cx="60" cy="46" r="16" fill="url(#birdHead)" filter="url(#birdShadow)" />
          {/* Crest feathers */}
          <ellipse cx="64" cy="30" rx="4" ry="10" fill="#FF6B9D" transform="rotate(15,64,30)" />
          <ellipse cx="60" cy="29" rx="3.5" ry="9" fill="#FFB3D9" transform="rotate(3,60,29)" />
          <ellipse cx="56" cy="31" rx="3" ry="8" fill="#FF6B9D" transform="rotate(-12,56,31)" />

          {/* Eye */}
          <circle cx="65" cy="44" r="6" fill="white" />
          <circle cx="66" cy="44" r="4" fill="#1a0a00" />
          <circle cx="64.5" cy="42.5" r="1.8" fill="white" />
          {/* Beak */}
          <path d="M72,48 L82,44 L72,52 Z" fill="#FF8C00" />
          <path d="M72,50 L82,48" stroke="#c06000" strokeWidth="1" fill="none" />
          {/* Cheek patch */}
          <ellipse cx="61" cy="50" rx="5" ry="3.5" fill="#FF8BC8" opacity="0.45" />
        </g>
      </svg>
    </>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
export default function KidsCharacter({ type }: { type: CharacterType }) {
  switch (type) {
    case "flower":  return <Flower />;
    case "bee":     return <Bee />;
    case "bird":    return <Bird />;
    default:        return <Butterfly />;
  }
}
