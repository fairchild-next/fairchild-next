import { redirect } from "next/navigation";

// /staff/safety was the old name — now /staff/garden-status
export default function StaffSafetyRedirect() {
  redirect("/staff/garden-status");
}
