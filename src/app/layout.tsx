import "./globals.css";
import { Libre_Baskerville } from "next/font/google";
import Providers from "./providers";
import ThemeWrapper from "@/components/ThemeWrapper";
import AppShell from "@/components/AppShell";
import RootShell from "@/components/RootShell";

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
  themeColor: "#1a2f26",
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
      <body className={`bg-[var(--background)] text-[var(--text-primary)] ${libreBaskerville.className}`}>
        <Providers>
          <ThemeWrapper>
            <RootShell>
              <AppShell>{children}</AppShell>
            </RootShell>
          </ThemeWrapper>
        </Providers>
      </body>
    </html>
  );
}