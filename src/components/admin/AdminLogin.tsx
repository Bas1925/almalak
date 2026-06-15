"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn } from "lucide-react";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-sage-50 to-cream-100 p-6">
      <form
        onSubmit={submit}
        className="card w-full max-w-sm space-y-5 p-8 text-center"
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sage-500 text-white">
          <Lock className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-sage-800">
            لوحة تحكم الملاك
          </h1>
          <p className="mt-1 text-sm text-ink-soft">أدخل كلمة المرور للمتابعة</p>
        </div>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة المرور"
          className="w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-center text-sm outline-none transition focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
        />
        {error && (
          <p className="text-sm font-medium text-blossom-500">
            كلمة المرور غير صحيحة
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="btn-primary w-full justify-center disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" />
          {loading ? "جارٍ الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
