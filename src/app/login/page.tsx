"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [email, setEmail] = useState("");

const handleLogin = async () => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: "http://192.168.1.68:3000",
    },
  });

  if (error) {
    alert("Login failed: " + error.message);
  } else {
    alert("Check your email for login link.");
  }
};

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Login</h1>

      <input
        type="email"
        placeholder="Email"
        className="w-full border p-3 rounded-lg"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="w-full bg-green-700 text-white py-3 rounded-lg"
      >
        Send Magic Link
      </button>
    </div>
  );
}