import Link from "next/link";
import { signIn } from "@/app/auth/actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; registered?: string }> }) {
  const params = await searchParams;
  return <main className="mx-auto w-full max-w-md px-6 py-20">
    <h1 className="text-3xl font-bold">Sign in</h1>
    <p className="mt-2 text-zinc-600">Access your orders and account.</p>
    {params.error && <p role="alert" className="mt-4 text-red-700">Unable to sign in. Check your details.</p>}
    {params.registered && <p className="mt-4 text-green-700">Account created. Check your email to confirm your address if required.</p>}
    <form action={signIn} className="mt-8 grid gap-4">
      <label className="grid gap-1">Email<input required type="email" name="email" autoComplete="email" className="rounded-lg border p-3" /></label>
      <label className="grid gap-1">Password<input required type="password" name="password" autoComplete="current-password" className="rounded-lg border p-3" /></label>
      <button className="rounded-lg bg-green-800 p-3 font-semibold text-white">Sign in</button>
    </form>
    <p className="mt-5">New here? <Link className="underline" href="/register">Create an account</Link></p>
  </main>;
}
