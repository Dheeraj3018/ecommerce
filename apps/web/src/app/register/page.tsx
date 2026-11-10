import Link from "next/link";
import { signUp } from "@/app/auth/actions";

export const instant = false;

export default async function Register({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="mx-auto w-full max-w-md px-6 py-20">
    <h1 className="text-3xl font-bold">Create account</h1>
    <p className="mt-2 text-zinc-600">Register to shop and manage your orders.</p>
    {error && <p role="alert" className="mt-4 text-red-700">Registration failed. Check your email and password.</p>}
    <form action={signUp} className="mt-8 grid gap-4">
      <label className="grid gap-1">Email<input required type="email" name="email" autoComplete="email" className="rounded-lg border p-3" /></label>
      <label className="grid gap-1">Password (8+ characters)<input required minLength={8} type="password" name="password" autoComplete="new-password" className="rounded-lg border p-3" /></label>
      <button className="rounded-lg bg-green-800 p-3 font-semibold text-white">Create account</button>
    </form>
    <p className="mt-5">Already registered? <Link className="underline" href="/login">Sign in</Link></p>
  </main>;
}
