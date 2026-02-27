import "./globals.css";
import Providers from "./providers";
import BottomNav from "@/components/BottomNav";

export const metadata = {
  title: "Fairchild",
  description: "Botanical Garden App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Providers>
          <div className="min-h-screen flex justify-center">

            {/* Mobile App Container */}
            <div className="w-full max-w-md flex flex-col relative">

              <main className="flex-1 overflow-y-auto pb-16">
                {children}
              </main>

              <BottomNav />

            </div>

          </div>
        </Providers>
      </body>
    </html>
  );
}