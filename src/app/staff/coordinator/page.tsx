import { redirect } from "next/navigation";

/** Staff shortcut into the wedding coordinator portal. */
export default function StaffCoordinatorPage() {
  redirect("/couple/coordinator");
}
