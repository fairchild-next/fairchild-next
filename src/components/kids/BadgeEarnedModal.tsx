"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

type BadgeEarnedModalProps = {
  badge: { badge_name: string; description: string; icon_url?: string | null };
  onClose: () => void;
};

const CONFETTI_COLORS = ["#6A8468", "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"];

function MiniConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const pieces = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 80,
      size: 5 + Math.random() * 7,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      speedX: -2 + Math.random() * 4,
      speedY: 2.5 + Math.random() * 3,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
    }));

    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.spin;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      }
      frame = requestAnimationFrame(draw);
    };
    draw();

    const timeout = setTimeout(() => cancelAnimationFrame(frame), 3500);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full rounded-2xl"
    />
  );
}

export default function BadgeEarnedModal({ badge, onClose }: BadgeEarnedModalProps) {
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="relative rounded-2xl bg-white max-w-sm w-full shadow-2xl text-center overflow-hidden">
        <MiniConfetti />

        {/* Green celebration header */}
        <div className="bg-[#6A8468] px-6 pt-6 pb-4 relative">
          <p className="text-3xl mb-1">🎉</p>
          <p className="text-white font-extrabold text-xl tracking-tight">
            Wow! New Badge Earned!
          </p>
        </div>

        {/* Badge detail */}
        <div className="px-6 py-5 relative">
          <div className="w-24 h-24 mx-auto mb-3 rounded-2xl bg-[#6A8468]/10 border-2 border-[#6A8468]/30 flex items-center justify-center overflow-hidden shadow-inner">
            {badge.icon_url ? (
              <img
                src={badge.icon_url}
                alt={badge.badge_name}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <span className="text-5xl">🏅</span>
            )}
          </div>

          <h3 className="font-extrabold text-xl text-[#193521] mb-1">
            {badge.badge_name}
          </h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {badge.description}
          </p>

          {/* Primary CTA: plain link — no router dependency */}
          <Link
            href="/badges"
            onClick={onClose}
            className="block w-full py-3 rounded-xl bg-[#6A8468] text-white font-bold text-base mb-3 active:scale-95 transition-transform"
          >
            View My Badges →
          </Link>

          {/* Secondary: keep exploring */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border-2 border-[#6A8468] text-[#6A8468] font-semibold text-sm active:scale-95 transition-transform"
          >
            Keep Exploring!
          </button>
        </div>
      </div>
    </div>
  );
}
