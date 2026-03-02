"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

type Ticket = {
  id: string;
  qr_code: string;
  status: string;
  slot_id: string | null;
  order_id?: string;
  ticket_type_id?: string;
  created_at?: string;
  [key: string]: unknown;
};

type MyTicketsData = {
  currentTickets: Ticket[];
  pastTickets: Ticket[];
  visitCount: number;
};

export default function MyTicketsPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [data, setData] = useState<MyTicketsData | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [tab, setTab] = useState<"current" | "past">("current");

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      setUser(session.user);

      const res = await fetch("/api/my-tickets", { credentials: "include" });
      if (!res.ok) {
        setData({
          currentTickets: [],
          pastTickets: [],
          visitCount: 0,
        });
        return;
      }
      const json = await res.json();
      setData({
        currentTickets: json.currentTickets ?? [],
        pastTickets: json.pastTickets ?? [],
        visitCount: json.visitCount ?? 0,
      });
    };

    load();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  const currentTickets = data?.currentTickets ?? [];
  const pastTickets = data?.pastTickets ?? [];
  const visitCount = data?.visitCount ?? 0;

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Your Tickets</h1>
        <button
          onClick={handleLogout}
          className="text-red-500 underline text-sm"
        >
          Logout
        </button>
      </div>

      <div className="flex border border-gray-700 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setTab("current")}
          className={`flex-1 py-3 text-sm font-medium ${
            tab === "current"
              ? "bg-green-600 text-white"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          Current
        </button>
        <button
          type="button"
          onClick={() => setTab("past")}
          className={`flex-1 py-3 text-sm font-medium ${
            tab === "past"
              ? "bg-green-600 text-white"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          Past
        </button>
      </div>

      {tab === "current" && (
        <>
          {currentTickets.length === 0 ? (
            <p className="text-gray-500">No current tickets.</p>
          ) : (
            <div className="space-y-6">
              {currentTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} showQr />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "past" && (
        <>
          {visitCount > 0 && (
            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <p className="text-sm font-medium">
                Wow! You visited the garden {visitCount} time
                {visitCount === 1 ? "" : "s"} this year.
              </p>
            </div>
          )}
          <h2 className="text-lg font-medium">Past Tickets</h2>
          {pastTickets.length === 0 ? (
            <p className="text-gray-500">No past tickets yet.</p>
          ) : (
            <div className="space-y-4">
              {pastTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} showQr={false} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TicketCard({
  ticket,
  showQr,
}: {
  ticket: Ticket;
  showQr: boolean;
}) {
  const [qrImage, setQrImage] = useState<string>("");

  useEffect(() => {
    if (!showQr || !ticket.qr_code) return;
    QRCode.toDataURL(ticket.qr_code).then(setQrImage);
  }, [showQr, ticket.qr_code]);

  return (
    <div className="border border-gray-700 rounded-xl p-4 space-y-4 shadow-sm">
      <div>
        <p className="text-sm text-gray-500">Ticket ID</p>
        <p className="font-mono text-sm">{ticket.id}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Status</p>
        <p
          className={`font-semibold text-sm ${
            ticket.status === "unused"
              ? "text-green-500"
              : "text-gray-400"
          }`}
        >
          {ticket.status === "unused" ? "Unused" : "Used"}
        </p>
      </div>
      {showQr && qrImage && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500">Show this QR at entry</p>
          <img
            src={qrImage}
            alt="Ticket QR Code"
            className="w-40 h-40"
          />
        </div>
      )}
    </div>
  );
}
