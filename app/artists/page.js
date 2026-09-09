import { redirect } from "next/navigation";

// Bare /artists forwards into the dashboard, which checks auth + role
// + whether this account is linked to an artist profile.
export default function ArtistsIndexPage() {
  redirect("/artists/overview");
}
