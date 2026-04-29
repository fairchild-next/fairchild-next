"use client";

import { usePathname } from "next/navigation";

/** Applies guest theme (light bg, sage green) when not on /staff.
 *  Member routes (/member) also get this theme so profile etc. match the app UI. */
export default function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  // All pages use the light guest theme, including the map editor
  const useLightTheme = true;
  return (
    <div
      className={`h-dvh flex justify-center overflow-hidden ${
        useLightTheme ? "guest-theme bg-[var(--background)] text-[var(--text-primary)]" : ""
      }`}
    >
      {children}
    </div>
  );
}
