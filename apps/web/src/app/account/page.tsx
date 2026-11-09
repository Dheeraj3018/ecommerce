import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function Account() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return <main className="mx-auto w-full max-w-3xl px-6 py-20">
    <h1 className="text-3xl font-bold">Your account</h1>
    <p className="mt-4">Signed in as {user.email}</p>
    <form action={signOut} className="mt-8"><button className="rounded-lg border px-5 py-3">Sign out</button></form>
  </main>;
}
