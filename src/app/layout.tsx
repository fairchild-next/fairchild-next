import "./globals.css";
import { Libre_Baskerville } from "next/font/google";
import Providers from "./providers";
import ThemeWrapper from "@/components/ThemeWrapper";
import AppShell from "@/components/AppShell";

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-baskerville",
  display: "swap",
});

export const metadata = {
  title: "Fairchild",
  description: "Botanical Garden App",
  manifest: "/manifest.json",
};

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={libreBaskerville.variable}>
      <body className={`bg-black text-white ${libreBaskerville.className}`}>
        <Providers>
          <ThemeWrapper>
            <div className="w-full max-w-[28rem] h-full flex flex-col relative mx-auto overflow-hidden min-w-0 pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
              <AppShell>{children}</AppShell>
            </div>
          </ThemeWrapper>
        </Providers>
      </body>
    </html>
  );
}