import SignUp from "@/components//Auth/SignUp";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }
  return <SignUp />;
}
