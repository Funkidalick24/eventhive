import { redirect } from "next/navigation";

export default function DashboardEventsRedirectPage() {
  redirect("/dashboard?tab=events");
}
