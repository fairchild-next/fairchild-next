"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

export default function MyTicketsPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [tickets, setTickets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

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

      const { data } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", session.user.id) // 👈 if using user_id instead change to user_id
        .order("created_at", { ascending: false });

      setTickets(data || []);
    };

    load();
  }, [supabase, router]);

  const generateQR = async (text: string) => {
    return await QRCode.toDataURL(text);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">My Tickets</h1>
        <button
          onClick={handleLogout}
          className="text-red-500 underline"
        >
          Logout
        </button>
      </div>

      {tickets.length === 0 && (
        <p className="text-gray-500">No tickets found.</p>
      )}

      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} generateQR={generateQR} />
      ))}
    </div>
  );
}

function TicketCard({ ticket, generateQR }: any) {
  const [qrImage, setQrImage] = useState<string>("");

  useEffect(() => {
    const createQR = async () => {
      const url = await generateQR(ticket.qr_code);
      setQrImage(url);
    };

    createQR();
  }, [ticket.qr_code, generateQR]);

  return (
    <div className="border rounded-xl p-4 space-y-4 shadow-sm">
      <div>
        <p className="text-sm text-gray-500">Ticket ID</p>
        <p className="font-mono text-sm">{ticket.id}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Status</p>
        <p
          className={`font-semibold ${
            ticket.status === "unused"
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          {ticket.status}
        </p>
      </div>

      {qrImage && (
        <div className="flex justify-center">
          <img
            src={qrImage}
            alt="QR Code"
            className="w-40 h-40"
          />
        </div>
      )}
    </div>
  );
}