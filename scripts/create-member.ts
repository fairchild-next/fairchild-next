/**
 * Create a member account in Supabase.
 * Run: npx tsx scripts/create-member.ts [email] [password] [memberId] [membershipType] [displayName] [expiresAt]
 *
 * Example: npx tsx scripts/create-member.ts you@email.com mypassword 2457893 "Individual Membership" "Your Name" 2026-12-31
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env.local if present
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  const email = process.argv[2] || "member@fairchild.org";
  const password = process.argv[3] || "changeme123";
  const memberId = process.argv[4] || "2457893";
  const membershipType = process.argv[5] || "Individual Membership";
  const displayName = process.argv[6] || "Fairchild Member";
  const expiresAt = process.argv[7] || "2026-12-31";

  console.log("Creating member account...");
  console.log("  Email:", email);
  console.log("  Member ID:", memberId);
  console.log("  Type:", membershipType);
  console.log("  Display name:", displayName);
  console.log("  Expires:", expiresAt);

  const { data: userData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      console.log("\nUser already exists. Looking up existing user to add member record...");
      const { data: users } = await admin.auth.admin.listUsers();
      const existing = users?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!existing) {
        console.error("Could not find existing user:", authError.message);
        process.exit(1);
      }
      const userId = existing.id;

      const { error: memberError } = await admin.from("members").upsert(
        {
          user_id: userId,
          member_id: memberId,
          membership_type: membershipType,
          display_name: displayName,
          expires_at: expiresAt,
        },
        { onConflict: "user_id" }
      );

      if (memberError) {
        console.error("Failed to add member record:", memberError.message);
        process.exit(1);
      }
      console.log("\n✓ Member record linked to existing user. You can sign in at /login");
      return;
    }
    console.error("Auth error:", authError.message);
    process.exit(1);
  }

  const userId = userData.user?.id;
  if (!userId) {
    console.error("User created but no ID returned");
    process.exit(1);
  }

  const { error: memberError } = await admin.from("members").insert({
    user_id: userId,
    member_id: memberId,
    membership_type: membershipType,
    display_name: displayName,
    expires_at: expiresAt,
  });

  if (memberError) {
    console.error("User created but failed to add member record:", memberError.message);
    process.exit(1);
  }

  console.log("\n✓ Member account created successfully!");
  console.log("  Sign in at /login with:", email);
  console.log("  Password:", password);
  console.log("\n  Change the password after first login.");
}

main();
