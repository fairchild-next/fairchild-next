"use client";

type BadgeEarnedModalProps = {
  badge: { badge_name: string; description: string; icon_url?: string | null };
  onClose: () => void;
};

export default function BadgeEarnedModal({ badge, onClose }: BadgeEarnedModalProps) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-6">
      <div className="rounded-2xl bg-white p-6 max-w-sm w-full shadow-xl text-center">
        <p className="text-2xl mb-2">🎉 Badge Earned!</p>
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#6A8468]/20 flex items-center justify-center">
          {badge.icon_url ? (
            <img src={badge.icon_url} alt="" className="w-10 h-10 object-contain" />
          ) : (
            <span className="text-2xl">🏅</span>
          )}
        </div>
        <h3 className="font-bold text-lg text-[#193521] mb-1">{badge.badge_name}</h3>
        <p className="text-sm text-[var(--text-muted)] mb-6">{badge.description}</p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#6A8468] text-white font-semibold"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
