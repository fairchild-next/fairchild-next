"use client";

/**
 * KidsCharacter — five botanical-themed animated SVG characters.
 * Pure SVG + CSS keyframes. No external dependencies. Works offline.
 *
 * Characters: butterfly | flower | bee | hummingbird | frog
 *
 * Keyframe naming convention: each character prefixes its own animations
 * (bf_, fl_, bee_, hm_, fg_) so global CSS names never collide.
 */

export type CharacterType = "butterfly" | "flower" | "bee" | "hummingbird" | "frog";

const CHARACTERS: CharacterType[] = ["butterfly", "flower", "bee", "hummingbird", "frog"];

export function randomCharacter(): CharacterType {
  return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
}

// ─── Butterfly ────────────────────────────────────────────────────────────────
function Butterfly() {
  return (
    <>
      <style>{`
        @keyframes bf_WingL {
          0%,100% { transform: scaleX(1) skewY(-2deg); }
          50%      { transform: scaleX(0.38) skewY(4deg); }
        }
        @keyframes bf_WingR {
          0%,100% { transform: scaleX(1) skewY(2deg); }
          50%      { transform: scaleX(0.38) skewY(-4deg); }
        }
      `}</style>
      <svg viewBox="0 0 120 110" width="160" height="146" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bf_WingUL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8E063" />
            <stop offset="60%" stopColor="#56C135" />
            <stop offset="100%" stopColor="#2d8a1a" />
          </linearGradient>
          <linearGradient id="bf_WingLL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7ED957" />
            <stop offset="100%" stopColor="#3aad1e" />
          </linearGradient>
          <linearGradient id="bf_Body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2d5a27" />
            <stop offset="100%" stopColor="#0f2d0b" />
          </linearGradient>
          <filter id="bf_Shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#193521" floodOpacity="0.25" />
          </filter>
        </defs>
        {/* Left wings */}
        <path d="M60,52 C54,32 28,14 16,30 C10,40 16,58 60,65 Z"
          fill="url(#bf_WingUL)" filter="url(#bf_Shadow)"
          style={{ transformOrigin:"60px 58px", animation:"bf_WingL 0.65s ease-in-out infinite" }} />
        <path d="M60,60 C46,64 24,74 24,64 C24,55 42,56 60,58 Z"
          fill="url(#bf_WingLL)"
          style={{ transformOrigin:"60px 59px", animation:"bf_WingL 0.65s ease-in-out infinite" }} />
        <ellipse cx="36" cy="38" rx="6" ry="4" fill="#fffde0" opacity="0.7"
          style={{ transformOrigin:"60px 58px", animation:"bf_WingL 0.65s ease-in-out infinite" }} />
        <ellipse cx="28" cy="48" rx="4" ry="3" fill="#fffde0" opacity="0.5"
          style={{ transformOrigin:"60px 58px", animation:"bf_WingL 0.65s ease-in-out infinite" }} />
        {/* Right wings */}
        <path d="M60,52 C66,32 92,14 104,30 C110,40 104,58 60,65 Z"
          fill="url(#bf_WingUL)" filter="url(#bf_Shadow)"
          style={{ transformOrigin:"60px 58px", animation:"bf_WingR 0.65s ease-in-out infinite" }} />
        <path d="M60,60 C74,64 96,74 96,64 C96,55 78,56 60,58 Z"
          fill="url(#bf_WingLL)"
          style={{ transformOrigin:"60px 59px", animation:"bf_WingR 0.65s ease-in-out infinite" }} />
        <ellipse cx="84" cy="38" rx="6" ry="4" fill="#fffde0" opacity="0.7"
          style={{ transformOrigin:"60px 58px", animation:"bf_WingR 0.65s ease-in-out infinite" }} />
        <ellipse cx="92" cy="48" rx="4" ry="3" fill="#fffde0" opacity="0.5"
          style={{ transformOrigin:"60px 58px", animation:"bf_WingR 0.65s ease-in-out infinite" }} />
        {/* Body */}
        <ellipse cx="60" cy="62" rx="5.5" ry="18" fill="url(#bf_Body)" />
        <ellipse cx="60" cy="56" rx="4" ry="3" fill="#4a8c40" opacity="0.5" />
        <ellipse cx="60" cy="66" rx="4" ry="3" fill="#4a8c40" opacity="0.4" />
        {/* Head */}
        <circle cx="60" cy="44" r="9" fill="#193521" />
        <circle cx="60" cy="44" r="7.5" fill="#2d5a27" />
        <circle cx="56.5" cy="42" r="3" fill="white" />
        <circle cx="63.5" cy="42" r="3" fill="white" />
        <circle cx="57" cy="42.5" r="1.6" fill="#0f1f0e" />
        <circle cx="64" cy="42.5" r="1.6" fill="#0f1f0e" />
        <circle cx="56.3" cy="41.5" r="0.8" fill="white" />
        <circle cx="63.3" cy="41.5" r="0.8" fill="white" />
        <path d="M57 47 Q60 50 63 47" stroke="#7ED957" strokeWidth="1.4" fill="none" strokeLinecap="round" />
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
        @keyframes fl_Sway {
          0%   { transform: rotate(-5deg); }
          25%  { transform: rotate(1deg); }
          50%  { transform: rotate(5deg); }
          75%  { transform: rotate(-1deg); }
          100% { transform: rotate(-5deg); }
        }
        @keyframes fl_Blink {
          0%,88%,100% { transform: scaleY(1); }
          93%          { transform: scaleY(0.1); }
        }
        @keyframes fl_Breath {
          0%,100% { opacity: 0.88; }
          50%      { opacity: 1; }
        }
      `}</style>
      <svg viewBox="0 0 100 110" width="148" height="163" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="fl_Petal" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFB3D9" />
            <stop offset="100%" stopColor="#FF6BAF" />
          </radialGradient>
          <radialGradient id="fl_Center" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFE566" />
            <stop offset="100%" stopColor="#FFB400" />
          </radialGradient>
          <radialGradient id="fl_Leaf" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#A8E063" />
            <stop offset="100%" stopColor="#3aad1e" />
          </radialGradient>
          <filter id="fl_Shadow">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#9b3070" floodOpacity="0.18" />
          </filter>
        </defs>
        {/* Static stem + leaves */}
        <path d="M50,80 Q46,92 44,102" stroke="#3aad1e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="90" rx="10" ry="5" fill="url(#fl_Leaf)" transform="rotate(-35,38,90)" />
        <ellipse cx="53" cy="93" rx="9" ry="4.5" fill="url(#fl_Leaf)" transform="rotate(20,53,93)" />
        {/* Entire flower head sways as one unit */}
        <g style={{ transformOrigin:"50px 72px", animation:"fl_Sway 3.5s cubic-bezier(0.45,0.05,0.55,0.95) infinite" }}>
          {[0,60,120,180,240,300].map((deg, i) => (
            <ellipse key={deg} cx="50" cy="28" rx="9" ry="16"
              fill="url(#fl_Petal)" transform={`rotate(${deg},50,48)`}
              filter="url(#fl_Shadow)"
              style={{ animation:`fl_Breath 3.5s ease-in-out ${i * 0.58}s infinite` }} />
          ))}
          <circle cx="50" cy="48" r="18" fill="url(#fl_Center)" />
          <circle cx="50" cy="48" r="14" fill="#FFD43B" />
          {([[-5,-4],[5,-4],[0,2],[-4,5],[4,5]] as [number,number][]).map(([x,y],i) => (
            <circle key={i} cx={50+x} cy={48+y} r="1.8" fill="#e8a000" opacity="0.55" />
          ))}
          <ellipse cx="45.5" cy="45" rx="3" ry="3.5" fill="white"
            style={{ transformOrigin:"45.5px 45px", animation:"fl_Blink 4.2s ease-in-out infinite" }} />
          <ellipse cx="54.5" cy="45" rx="3" ry="3.5" fill="white"
            style={{ transformOrigin:"54.5px 45px", animation:"fl_Blink 4.2s ease-in-out 0.12s infinite" }} />
          <circle cx="46" cy="45.5" r="1.6" fill="#1a0a00" />
          <circle cx="55" cy="45.5" r="1.6" fill="#1a0a00" />
          <circle cx="45.3" cy="44.5" r="0.8" fill="white" />
          <circle cx="54.3" cy="44.5" r="0.8" fill="white" />
          <ellipse cx="43" cy="49.5" rx="3" ry="2" fill="#FF8BC8" opacity="0.5" />
          <ellipse cx="57" cy="49.5" rx="3" ry="2" fill="#FF8BC8" opacity="0.5" />
          <path d="M45 51.5 Q50 56 55 51.5" stroke="#c0560a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    </>
  );
}

// ─── Bee ──────────────────────────────────────────────────────────────────────
function Bee() {
  return (
    <>
      <style>{`
        @keyframes bee_Buzz {
          0%,100% { transform: translateX(0) rotate(-2deg); }
          33%      { transform: translateX(2.5px) rotate(2deg); }
          66%      { transform: translateX(-2.5px) rotate(-2deg); }
        }
        @keyframes bee_WingL {
          0%,100% { transform: scaleY(1) rotate(-15deg); opacity: 0.72; }
          50%      { transform: scaleY(0.45) rotate(-15deg); opacity: 0.9; }
        }
        @keyframes bee_WingR {
          0%,100% { transform: scaleY(1) rotate(15deg); opacity: 0.72; }
          50%      { transform: scaleY(0.45) rotate(15deg); opacity: 0.9; }
        }
      `}</style>
      <svg viewBox="0 0 100 110" width="148" height="163" xmlns="http://www.w3.org/2000/svg"
        style={{ animation:"bee_Buzz 0.28s ease-in-out infinite" }}>
        <defs>
          <linearGradient id="bee_Body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE566" />
            <stop offset="100%" stopColor="#FFB400" />
          </linearGradient>
          <linearGradient id="bee_Head" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD43B" />
            <stop offset="100%" stopColor="#e8a000" />
          </linearGradient>
          <radialGradient id="bee_Wing" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#dff6ff" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#aaddff" stopOpacity="0.5" />
          </radialGradient>
          <filter id="bee_Shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#7a5800" floodOpacity="0.2" />
          </filter>
        </defs>
        <ellipse cx="34" cy="42" rx="16" ry="9" fill="url(#bee_Wing)" stroke="#aaddff" strokeWidth="0.8"
          style={{ transformOrigin:"44px 46px", animation:"bee_WingL 0.14s linear infinite" }} />
        <ellipse cx="66" cy="42" rx="16" ry="9" fill="url(#bee_Wing)" stroke="#aaddff" strokeWidth="0.8"
          style={{ transformOrigin:"56px 46px", animation:"bee_WingR 0.14s linear infinite" }} />
        <ellipse cx="50" cy="68" rx="18" ry="24" fill="url(#bee_Body)" filter="url(#bee_Shadow)" />
        <rect x="32.5" y="58" width="35" height="6" rx="3" fill="#1a1a00" opacity="0.85" />
        <rect x="32.5" y="68" width="35" height="6" rx="3" fill="#1a1a00" opacity="0.85" />
        <rect x="33.5" y="78" width="33" height="5" rx="2.5" fill="#1a1a00" opacity="0.75" />
        <ellipse cx="44" cy="56" rx="6" ry="3" fill="white" opacity="0.22" transform="rotate(-15,44,56)" />
        <path d="M50,92 L47,101 L53,101 Z" fill="#e8a000" />
        <circle cx="50" cy="44" r="14" fill="url(#bee_Head)" filter="url(#bee_Shadow)" />
        <circle cx="50" cy="44" r="12" fill="#FFD43B" />
        {[-6,-3,0,3,6].map((x,i) => (
          <ellipse key={i} cx={50+x} cy={32} rx="2" ry="3.5" fill="#e8a000" opacity="0.7"
            transform={`rotate(${x*3},${50+x},32)`} />
        ))}
        <circle cx="44.5" cy="43" r="4" fill="#1a1a00" />
        <circle cx="55.5" cy="43" r="4" fill="#1a1a00" />
        <circle cx="43.5" cy="41.5" r="1.5" fill="white" />
        <circle cx="54.5" cy="41.5" r="1.5" fill="white" />
        <ellipse cx="41" cy="48" rx="3.5" ry="2.2" fill="#FFB347" opacity="0.6" />
        <ellipse cx="59" cy="48" rx="3.5" ry="2.2" fill="#FFB347" opacity="0.6" />
        <path d="M45 50 Q50 54.5 55 50" stroke="#7a5800" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M46,31 Q42,24 38,20" stroke="#1a1a00" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="37.5" cy="19.5" r="2.5" fill="#FFB400" />
        <path d="M54,31 Q58,24 62,20" stroke="#1a1a00" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="62.5" cy="19.5" r="2.5" fill="#FFB400" />
      </svg>
    </>
  );
}

// ─── Hummingbird ──────────────────────────────────────────────────────────────
function Hummingbird() {
  return (
    <>
      <style>{`
        @keyframes hm_Hover {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          30%      { transform: translateY(-5px) rotate(-2deg); }
          70%      { transform: translateY(3px) rotate(1deg); }
        }
        @keyframes hm_Wing {
          0%,100% { transform: scaleY(1); opacity: 0.55; }
          50%      { transform: scaleY(0.2); opacity: 0.8; }
        }
        @keyframes hm_Tail {
          0%,100% { transform: rotate(-4deg); }
          50%      { transform: rotate(4deg); }
        }
      `}</style>
      <svg viewBox="0 0 130 100" width="175" height="135" xmlns="http://www.w3.org/2000/svg"
        style={{ animation:"hm_Hover 2s ease-in-out infinite" }}>
        <defs>
          <linearGradient id="hm_Body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>
          <linearGradient id="hm_Head" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
          <linearGradient id="hm_Throat" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F0ABFC" />
            <stop offset="100%" stopColor="#C026D3" />
          </linearGradient>
          <radialGradient id="hm_Wing" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0.35" />
          </radialGradient>
          <linearGradient id="hm_Tail" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#052e16" />
          </linearGradient>
          <filter id="hm_Shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#052e16" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Tail fan */}
        <g style={{ transformOrigin:"42px 64px", animation:"hm_Tail 2s ease-in-out infinite" }}>
          <ellipse cx="28" cy="66" rx="7" ry="16" fill="url(#hm_Tail)" transform="rotate(-40,28,66)" opacity="0.9" />
          <ellipse cx="34" cy="70" rx="6" ry="14" fill="url(#hm_Tail)" transform="rotate(-25,34,70)" opacity="0.8" />
          <ellipse cx="40" cy="72" rx="5" ry="12" fill="url(#hm_Tail)" transform="rotate(-8,40,72)" opacity="0.7" />
        </g>

        {/* Body */}
        <ellipse cx="58" cy="64" rx="22" ry="12" fill="url(#hm_Body)"
          transform="rotate(-18,58,64)" filter="url(#hm_Shadow)" />

        {/* Wings — fast blur above and below body */}
        <ellipse cx="58" cy="48" rx="24" ry="8" fill="url(#hm_Wing)"
          style={{ transformOrigin:"58px 56px", animation:"hm_Wing 0.1s linear infinite" }} />
        <ellipse cx="58" cy="72" rx="20" ry="6" fill="url(#hm_Wing)"
          style={{ transformOrigin:"58px 64px", animation:"hm_Wing 0.1s linear infinite 0.05s" }} />

        {/* Ruby throat patch */}
        <ellipse cx="76" cy="60" rx="10" ry="7" fill="url(#hm_Throat)" opacity="0.92" />

        {/* Head */}
        <circle cx="88" cy="50" r="13" fill="url(#hm_Head)" filter="url(#hm_Shadow)" />
        {/* Head shine */}
        <ellipse cx="84" cy="44" rx="4" ry="2.5" fill="#86efac" opacity="0.5" transform="rotate(-20,84,44)" />

        {/* Beak */}
        <path d="M99,50 Q114,47 125,44" stroke="#1a3320" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M99,51 Q114,48.5 125,46" stroke="#2d6a40" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Eye */}
        <circle cx="94" cy="47" r="4.5" fill="#1a1a00" />
        <circle cx="94" cy="47" r="3" fill="#0f0f00" />
        <circle cx="92.8" cy="45.8" r="1.5" fill="white" />

        {/* Cheek iridescence */}
        <ellipse cx="86" cy="53" rx="5" ry="3" fill="#86efac" opacity="0.35" />
      </svg>
    </>
  );
}

// ─── Frog ─────────────────────────────────────────────────────────────────────
function Frog() {
  return (
    <>
      <style>{`
        @keyframes fg_Bob {
          0%,100% { transform: translateY(0px) scaleY(1); }
          45%      { transform: translateY(-8px) scaleY(1.03); }
          55%      { transform: translateY(-8px) scaleY(1.03); }
        }
        @keyframes fg_Blink {
          0%,85%,100% { transform: scaleY(1); }
          92%          { transform: scaleY(0.08); }
        }
        @keyframes fg_Smile {
          0%,100% { transform: scaleX(1); }
          50%      { transform: scaleX(1.06); }
        }
      `}</style>
      <svg viewBox="0 0 100 110" width="148" height="163" xmlns="http://www.w3.org/2000/svg"
        style={{ animation:"fg_Bob 2.2s cubic-bezier(0.36,0.07,0.19,0.97) infinite" }}>
        <defs>
          <radialGradient id="fg_Body" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#16A34A" />
          </radialGradient>
          <radialGradient id="fg_Belly" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#DCFCE7" />
            <stop offset="100%" stopColor="#86EFAC" />
          </radialGradient>
          <radialGradient id="fg_Eye" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#CA8A04" />
          </radialGradient>
          <filter id="fg_Shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#052e16" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Body */}
        <ellipse cx="50" cy="80" rx="33" ry="22" fill="url(#fg_Body)" filter="url(#fg_Shadow)" />
        {/* Belly */}
        <ellipse cx="50" cy="80" rx="20" ry="14" fill="url(#fg_Belly)" opacity="0.85" />

        {/* Back legs peeking out */}
        <ellipse cx="20" cy="86" rx="11" ry="7" fill="#16A34A" transform="rotate(-25,20,86)" />
        <ellipse cx="80" cy="86" rx="11" ry="7" fill="#16A34A" transform="rotate(25,80,86)" />

        {/* Head — wide round, sits on body */}
        <circle cx="50" cy="57" r="26" fill="url(#fg_Body)" />

        {/* Big eye bumps on top */}
        <circle cx="33" cy="39" r="13" fill="url(#fg_Body)" filter="url(#fg_Shadow)" />
        <circle cx="67" cy="39" r="13" fill="url(#fg_Body)" filter="url(#fg_Shadow)" />
        {/* Eye whites */}
        <circle cx="33" cy="38" r="10" fill="white" />
        <circle cx="67" cy="38" r="10" fill="white" />
        {/* Iris */}
        <circle cx="33" cy="38" r="7" fill="url(#fg_Eye)" />
        <circle cx="67" cy="38" r="7" fill="url(#fg_Eye)" />
        {/* Pupils — blink */}
        <ellipse cx="33" cy="38" rx="4" ry="5" fill="#1a0a00"
          style={{ transformOrigin:"33px 38px", animation:"fg_Blink 3.8s ease-in-out infinite" }} />
        <ellipse cx="67" cy="38" rx="4" ry="5" fill="#1a0a00"
          style={{ transformOrigin:"67px 38px", animation:"fg_Blink 3.8s ease-in-out 0.15s infinite" }} />
        {/* Eye highlights */}
        <circle cx="30" cy="34" r="2.5" fill="white" />
        <circle cx="64" cy="34" r="2.5" fill="white" />

        {/* Nostrils */}
        <circle cx="46" cy="52" r="2" fill="#0f5c2a" opacity="0.6" />
        <circle cx="54" cy="52" r="2" fill="#0f5c2a" opacity="0.6" />

        {/* Wide smile */}
        <path d="M32 63 Q50 76 68 63" stroke="#0f5c2a" strokeWidth="2.5" fill="none" strokeLinecap="round"
          style={{ transformOrigin:"50px 65px", animation:"fg_Smile 2.2s ease-in-out infinite" }} />
        {/* Mouth opening hint */}
        <path d="M35 64 Q50 74 65 64" stroke="#86efac" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />

        {/* Cheek spots */}
        <ellipse cx="28" cy="60" rx="5" ry="3.5" fill="#22c55e" opacity="0.4" />
        <ellipse cx="72" cy="60" rx="5" ry="3.5" fill="#22c55e" opacity="0.4" />

        {/* Front feet */}
        <ellipse cx="24" cy="78" rx="8" ry="5" fill="#16A34A" transform="rotate(-15,24,78)" />
        <ellipse cx="76" cy="78" rx="8" ry="5" fill="#16A34A" transform="rotate(15,76,78)" />
      </svg>
    </>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
export default function KidsCharacter({ type }: { type: CharacterType }) {
  switch (type) {
    case "flower":      return <Flower />;
    case "bee":         return <Bee />;
    case "hummingbird": return <Hummingbird />;
    case "frog":        return <Frog />;
    default:            return <Butterfly />;
  }
}
