import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";

const SESSION_COOKIE = "eventhive_session";

export default async function NewEventPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = token ? verifyJwt(token) : null;

  if (!payload) {
    redirect("/signin");
  }

  redirect("/dashboard/events/new");
}
