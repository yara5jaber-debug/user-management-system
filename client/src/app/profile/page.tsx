"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Profile = {
  id: number | string;
  name?: string;
  email: string;
  role?: string;
  status?: string;
};

const API_URL = "http://localhost:3007";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const stored = sessionStorage.getItem("user");
    if (!token || !stored) {
      router.replace("/login");
      return;
    }

    let userId: number | string;
    try {
      const parsed = JSON.parse(stored) as Profile;
      if (parsed.id === undefined || parsed.id === null) {
        throw new Error("Missing user ID");
      }
      userId = parsed.id;
    } catch {
      router.replace("/login");
      return;
    }

    let active = true;
    async function fetchProfile() {
      try {
        const response = await fetch(`${API_URL}/users/${encodeURIComponent(String(userId))}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Could not load profile (${response.status})`);
        }
        const data = (await response.json()) as Profile;
        if (active) {
          setProfile(data);
          setName(data.name ?? "");
          setEmail(data.email);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchProfile();
    return () => { active = false; };
  }, [router]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/users/${encodeURIComponent(String(profile.id))}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `Update failed (${response.status})`);
      }
      const updated = data as Profile;
      setProfile(updated);
      setName(updated.name ?? "");
      setEmail(updated.email);
      const stored = sessionStorage.getItem("user");
      const oldUser = stored ? JSON.parse(stored) : {};
      sessionStorage.setItem("user", JSON.stringify({ ...oldUser, ...updated }));
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-gray-900 md:flex">
      <aside className="w-full border-b bg-white p-6 md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="mb-10 text-xl font-bold text-violet-700">◈ Json Server Auth</div>
        <nav className="space-y-2">

            <Link
            href="/dashboard"
            className="block rounded-lg px-4 py-3 text-left hover:bg-violet-50"
            >
            🏠 Dashboard
            </Link>

          <Link href="/users" className="block rounded-lg px-4 py-3 hover:bg-violet-50">👥 Users</Link>
          <Link href="/profile" className="block rounded-lg bg-violet-100 px-4 py-3 font-semibold text-violet-700">👤 Profile</Link>
          <button type="button" onClick={logout} className="block w-full rounded-lg px-4 py-3 text-left text-red-600 hover:bg-red-50">↪ Logout</button>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-gray-500">View and manage your account information</p>
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">
            {loading ? (
              <p className="text-gray-500">Loading profile...</p>
            ) : (
              <>
                <div className="mb-8 flex items-center gap-5 border-b pb-7">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-violet-700 text-3xl font-bold text-white">
                    {(profile?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="break-words text-2xl font-bold">{profile?.name || "User"}</h2>
                    <p className="break-all text-gray-500">{profile?.email || ""}</p>
                    {profile && <span className="mt-2 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs text-violet-700">{profile.role || "User"}</span>}
                  </div>
                </div>
                {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
                {success && <p role="status" className="mb-5 rounded-lg bg-green-50 p-4 text-green-700">{success}</p>}
                {profile && (
                  <form onSubmit={handleSave} className="space-y-5">
                    <label className="block text-sm font-medium">
                      Full Name
                      <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3" />
                    </label>
                    <label className="block text-sm font-medium">
                      Email Address
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3" />
                    </label>
                    <label className="block text-sm font-medium">
                      User ID
                      <input disabled value={String(profile.id)} className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500" />
                    </label>
                    <button type="submit" disabled={saving} className="rounded-lg bg-violet-700 px-6 py-3 font-semibold text-white hover:bg-violet-800 disabled:opacity-50">
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
