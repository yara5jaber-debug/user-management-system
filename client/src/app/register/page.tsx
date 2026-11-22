
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = "http://localhost:3007";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (name.trim().length < 3) {
      setError("Full name must be at least 3 characters.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          `Registration failed (${response.status})`
        );
      }

      if (!data.accessToken) {
        throw new Error("No access token returned.");
      }

      sessionStorage.setItem("token", data.accessToken);

      sessionStorage.setItem(
        "user",
        JSON.stringify(data.user || {})
      );

      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6fb] px-4 py-8 text-gray-900">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl md:min-h-[650px] md:grid-cols-2">

        {/* LEFT PANEL */}
        <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#25205c] via-[#39318c] to-[#201a50] p-9 text-white md:p-12">

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500 text-2xl font-bold">
              ◈
            </div>

            <span className="text-lg font-bold">
              Json Server Auth
            </span>
          </div>

          <div className="relative z-10 my-10 text-center">
            <div className="mx-auto mb-8 flex h-44 w-44 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-2xl">
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-2xl bg-violet-500/40">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500 text-3xl">
                  👤
                </div>

                <div className="mb-2 h-2 w-20 rounded-full bg-white/60" />
                <div className="h-2 w-14 rounded-full bg-white/30" />
              </div>
            </div>

            <h2 className="mb-3 text-3xl font-bold">
              Json Server Auth
            </h2>

            <p className="mx-auto max-w-xs text-sm leading-7 text-violet-200">
              Create your account and get started
              in seconds.
            </p>
          </div>

          <div className="relative z-10 space-y-5">
            {[
              ["✓", "Create your account"],
              ["✓", "Secure authentication"],
              ["✓", "Manage users & data"],
            ].map(([icon, title]) => (
              <div
                key={title}
                className="flex items-center gap-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/40 font-bold">
                  {icon}
                </div>

                <p className="font-medium text-violet-100">
                  {title}
                </p>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
        </section>

        {/* RIGHT PANEL */}
        <section className="flex flex-col justify-center p-8 sm:p-12">

          <div className="mb-8 text-center">
            <div className="mb-3 text-3xl font-bold text-violet-700">
              ◈
            </div>

            <h1 className="text-3xl font-bold">
              Create Account ✨
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              Join now and start managing users.
            </p>
          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >
            {/* NAME */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* EMAIL */}
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
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* PASSWORD */}
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
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
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

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm your password"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-700 py-3.5 font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating account..."
                : "Create Account →"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-violet-700 hover:underline"
            >
              Login
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
