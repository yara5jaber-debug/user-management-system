
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchProfile() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (!active) return;

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select("role, status")
            .eq("id", user.id)
            .single();

        if (profileError) {
          throw profileError;
        }

        if (!active) return;

        const fullName =
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : "User";

        const currentProfile: Profile = {
          id: user.id,
          name: fullName,
          email: user.email ?? "",
          role: profileData.role ?? "user",
          status: profileData.status ?? "Active",
        };

        setProfile(currentProfile);
        setName(fullName);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load profile"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchProfile();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!profile) return;

    const cleanName = name.trim();

    if (cleanName.length < 3) {
      setError("Full name must be at least 3 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data, error: updateError } =
        await supabase.auth.updateUser({
          data: {
            full_name: cleanName,
          },
        });

      if (updateError) {
        throw updateError;
      }

      if (!data.user) {
        throw new Error("Unable to update account.");
      }

      setProfile((previous) =>
        previous
          ? {
              ...previous,
              name: cleanName,
            }
          : null
      );

      setName(cleanName);
      setSuccess("Your account name was updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save changes"
      );
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    setLoggingOut(true);
    setError("");

    try {
      const { error: logoutError } =
        await supabase.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to log out"
      );
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-gray-900 md:flex">

      {/* SIDEBAR */}
      <aside className="w-full border-b bg-white p-6 md:min-h-screen md:w-60 md:border-b-0 md:border-r">

        <div className="mb-10 text-xl font-bold text-violet-700">
          ◈ User Management System
        </div>

        <nav className="space-y-2">

          <Link
            href="/dashboard"
            className="block rounded-lg px-4 py-3 text-left hover:bg-violet-50"
          >
            🏠 Dashboard
          </Link>

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
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="block w-full rounded-lg px-4 py-3 text-left text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "↪ Logout"}
          </button>

        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-3xl">

          <h1 className="text-3xl font-bold">
            My Profile
          </h1>

          <p className="mt-2 text-gray-500">
            View and manage your account information
          </p>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

            {loading ? (
              <p className="text-gray-500">
                Loading profile...
              </p>
            ) : (
              <>
                {error && (
                  <p
                    role="alert"
                    className="mb-5 rounded-lg bg-red-50 p-4 text-red-700"
                  >
                    {error}
                  </p>
                )}

                {success && (
                  <p
                    role="status"
                    className="mb-5 rounded-lg bg-green-50 p-4 text-green-700"
                  >
                    {success}
                  </p>
                )}

                {profile && (
                  <>
                    <div className="mb-8 flex items-center gap-5 border-b pb-7">

                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-violet-700 text-3xl font-bold text-white">
                        {(profile.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h2 className="break-words text-2xl font-bold">
                          {profile.name}
                        </h2>

                        <p className="break-all text-gray-500">
                          {profile.email}
                        </p>

                        <span className="mt-2 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs capitalize text-violet-700">
                          {profile.role}
                        </span>

                        <p className="mt-2 text-xs text-gray-500">
                          Status: {profile.status}
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={handleSave}
                      className="space-y-5"
                    >
                      <label className="block text-sm font-medium">
                        Full Name
                        <input
                          required
                          minLength={3}
                          value={name}
                          onChange={(e) =>
                            setName(e.target.value)
                          }
                          className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-violet-500"
                        />
                      </label>

                      <label className="block text-sm font-medium">
                        Email Address
                        <input
                          type="email"
                          readOnly
                          value={profile.email}
                          className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600"
                        />
                      </label>

                      <p className="text-xs text-gray-500">
                        Email changes require a separate verification process.
                      </p>

                      <label className="block text-sm font-medium">
                        User ID
                        <input
                          disabled
                          value={profile.id}
                          className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
                        />
                      </label>

                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-violet-700 px-6 py-3 font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </form>
                  </>
                )}
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
