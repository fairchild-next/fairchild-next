"use client";

import KidsCharacter, { type CharacterType } from "./KidsCharacter";

/**
 * KidsPlantMascot — wraps a KidsCharacter with the gentle float animation
 * used on the kids plant detail page.
 */
export default function KidsPlantMascot({
  type = "butterfly",
  label,
}: {
  type?: CharacterType;
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 select-none" aria-hidden>
      <style>{`
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
      `}</style>
      {/* 3s duration matches arFloat in LearnScanner so character looks identical in both contexts */}
      <div style={{ animation: "mascotFloat 3s ease-in-out infinite" }}>
        <KidsCharacter type={type} />
      </div>
      {label && (
        <p className="text-sm font-bold text-[#193521] opacity-60">{label}</p>
      )}
    </div>
  );
}
