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
  // Map editor stays full-screen dark; everything else (incl. staff portal) uses light guest theme
  const useLightTheme = !pathname.startsWith("/staff/map/edit");

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
