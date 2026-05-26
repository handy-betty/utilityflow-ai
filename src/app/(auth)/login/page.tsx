"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function copyToClipboard(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    setMessage(`${label} copied to clipboard.`);
  } catch {
    setMessage(`Could not copy ${label}. Please copy it manually.`);
  }
}

function fillDemoLogin() {
  setEmail("demo@utilityflow.gosenterprises.com");
  setPassword("DemoAccess123!");
  setMessage(null);
}

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 rounded-2xl bg-brand-700 p-5 text-white">
          <p className="text-sm font-medium text-blue-100">
            Dakota Plains Utility
          </p>
          <h1 className="text-2xl font-bold">UtilityFlow AI</h1>
          <p className="mt-2 text-sm leading-6 text-blue-100">
            Sign in to access the work management dashboard.
          </p>
        </div>

        <h2 className="text-xl font-bold text-slate-950">Login</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
  Use your assigned account, or use the read-only demo credentials below to
  explore the system safely.
</p>

<div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
  <p className="font-bold text-slate-900">Read-Only Demo Access</p>

  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Email
      </p>
      <p className="break-all font-mono text-sm text-slate-900">
        demo@utilityflow.gosenterprises.com
      </p>
    </div>

    <button
      type="button"
      onClick={() =>
        copyToClipboard("demo@utilityflow.gosenterprises.com", "Email")
      }
      className="shrink-0 rounded-lg border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
    >
      Copy
    </button>
  </div>

  <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Password
      </p>
      <p className="font-mono text-sm text-slate-900">DemoAccess123!</p>
    </div>

    <button
      type="button"
      onClick={() => copyToClipboard("DemoAccess123!", "Password")}
      className="shrink-0 rounded-lg border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
    >
      Copy
    </button>
  </div>

  <button
    type="button"
    onClick={fillDemoLogin}
    className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
  >
    Use Demo Login
  </button>

  <p className="mt-2 text-xs leading-5 text-slate-500">
    Demo access is read-only. Visitors can explore the system without changing
    live data.
  </p>
</div>
        

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}