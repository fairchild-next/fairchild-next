import { redirect } from "next/navigation";

// Homepage CMS is planned for Phase B — redirect to the more page for now
export default function StaffHomepageRedirect() {
  redirect("/staff/more");
}
