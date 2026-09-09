import { redirect } from "next/navigation";

// Bare /internal just forwards into the dashboard, which itself checks
// auth + staff role and bounces to /internal/login if needed.
export default function InternalIndexPage() {
  redirect("/internal/overview");
}
