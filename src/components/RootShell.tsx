"use client";

/**
 * Root container — all portals use the same narrow mobile shell.
 */
export default function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[28rem] h-full flex flex-col relative mx-auto overflow-hidden min-w-0 pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
      {children}
    </div>
  );
}
