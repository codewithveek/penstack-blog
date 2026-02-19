export const metadata: Metadata = {};
import SignIn from "@/components//Auth/SignIn";
import { getSession } from "@/lib/auth/session";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }
  return <SignIn />;
}
