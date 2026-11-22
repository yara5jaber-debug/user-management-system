
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = "http://localhost:3007";

type Profile = {
  id: number | string;
  name?: string;
  email: string;
  role?: string;
  status?: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    let parsedUser: Profile;

    try {
      parsedUser = JSON.parse(storedUser);

      if (!parsedUser.id) {
        router.replace("/login");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }

    async function loadProfile() {
      try {
        const response = await fetch(
          `${API_URL}/users/${parsedUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load profile");
        }

        const data: Profile = await response.json();

        setUser(data);
        setName(data.name || "");
        setEmail(data.email);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [router]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) return;

    const token = sessionStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Failed to update profile");
      }

      const updatedUser: Profile = await response.json();

      setUser(updatedUser);
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save changes"
      );
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-gray-900 md:flex">
      <aside className="w-full border-b bg-white p-6 md:min-h-screen md:w-60 md:border-r">
        <h2 className="mb-10 text-xl font-bold text-violet-700">
          ◈ Json Server Auth
        </h2>

        <nav className="space-y-2">
          <Link
            href="/users"
            className="block rounded-lg px-4 py-3 hover:bg-violet-50"
          >
            👥 Users
          </Link>

          <Link
            href="/profile"
            className="block rounded-lg bg-violet-100 px-4 py-3 font-semibold text-violet-700"
          >
            👤 Profile
          </Link>

          <button
            onClick={logout}
            className="block w-full rounded-lg px-4 py-3 text-left text-red-600 hover:bg-red-50"
          >
            ↪ Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-gray-500">
            View and manage your account information
          </p>

          <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-5 border-b pb-7">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-700 text-3xl font-bold text-white">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  {user?.name || "User"}
                </h2>
                <p className="text-gray-500">{user?.email}</p>
                <span className="mt-2 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs text-violet-700">
                  {user?.role || "User"}
                </span>
              </div>
            </div>

            {error && (
              <p role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p className="mb-5 rounded-lg bg-green-50 p-4 text-green-700">
                {message}
              </p>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full Name
                </label>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  User ID
                </label>
                <input
                  disabled
                  value={user?.id || ""}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving || !user}
                className="rounded-lg bg-violet-700 px-6 py-3 font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
