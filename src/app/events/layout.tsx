import EventsModeGuard from "@/components/events/EventsModeGuard";
import { getCurrentEventAccentColor } from "@/lib/clients/fairchild/eventModeContent";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const accent = getCurrentEventAccentColor();
  return (
    <EventsModeGuard>
      <div style={{ ["--event-accent" as string]: accent }}>{children}</div>
    </EventsModeGuard>
  );
}
