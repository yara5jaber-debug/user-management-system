
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = "http://localhost:3007";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          `Login failed (${response.status})`
        );
      }

      if (!data.accessToken) {
        throw new Error("Access token was not returned");
      }

      sessionStorage.setItem("token", data.accessToken);
      sessionStorage.setItem(
        "user",
        JSON.stringify(data.user || {})
      );

      // Remember email only, never the password
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6fb] px-4 py-8 text-gray-900">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl md:min-h-[620px] md:grid-cols-2">

        {/* LEFT: Purple Branding Panel */}
        <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#25205c] via-[#39318c] to-[#201a50] p-9 text-white md:p-12">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500 text-2xl font-bold">
                ◈
              </div>
              <span className="text-lg font-bold">
                Json Server Auth
              </span>
            </div>
          </div>

          <div className="relative z-10 my-12 text-center">
            <div className="mx-auto mb-9 flex h-44 w-44 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-2xl">
              <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-2xl bg-violet-500/40">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500 text-3xl">
                  🔒
                </div>
                <div className="mb-2 h-2 w-20 rounded-full bg-white/60" />
                <div className="h-2 w-14 rounded-full bg-white/30" />
              </div>
            </div>

            <h2 className="mb-3 text-3xl font-bold">
              Json Server Auth
            </h2>

            <p className="mx-auto max-w-xs text-sm leading-7 text-violet-200">
              Single authentication and user management
              using JSON Server.
            </p>
          </div>

          <div className="relative z-10 space-y-5">
            {[
              ["🔐", "Authentication", "Register & Login"],
              ["👥", "User Management", "CRUD Operations"],
              ["⚡", "REST API Ready", "For Front-End Integration"],
            ].map(([icon, title, subtitle]) => (
              <div key={title} className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl">
                  {icon}
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-xs text-violet-200">
                    {subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
        </section>

        {/* RIGHT: Login Form */}
        <section className="flex flex-col justify-center p-8 sm:p-12">
          <div className="mb-10 text-center">
            <div className="mb-3 text-3xl font-bold text-violet-700">
              ◈
            </div>
            <h1 className="text-3xl font-bold">
              Welcome Back 👋
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              Login to your account to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pr-16 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-violet-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-violet-700"
                />
                Remember email
              </label>
              <span className="text-xs text-gray-400">
                Secure Login
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-700 py-3.5 font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login →"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-violet-700 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
