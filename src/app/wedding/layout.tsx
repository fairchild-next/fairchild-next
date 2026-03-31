import WeddingModeGuard from "@/components/wedding/WeddingModeGuard";

export default function WeddingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WeddingModeGuard>{children}</WeddingModeGuard>;
}
