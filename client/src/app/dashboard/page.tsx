
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const API_URL = "http://localhost:3007";

type User = {
  id: number | string;
  name?: string;
  email: string;
  role?: string;
  status?: string;
  createdAt?: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  
useEffect(() => {
  let cancelled = false;

  async function loadDashboard() {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      setCurrentUser({
        id: user.id,
        name:
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : "User",
        email: user.email || "",
        role: "User",
        status: "Active",
      });

      // User statistics will be connected to
      // the Supabase profiles table later.
      
const { data: profiles, error: profilesError } =
  await supabase
    .from("profiles")
    .select("id, name, email, role, status, created_at")
    .order("created_at", { ascending: false });

if (profilesError) {
  throw profilesError;
}

if (cancelled) return;

    setUsers(
    (profiles ?? []).map((profile) => ({
        id: profile.id,
        name: profile.name,
        email: profile.email ?? "",
        role: profile.role,
        status: profile.status,
        createdAt: profile.created_at,
    }))
    );

    } catch (err) {
      if (!cancelled) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard"
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void loadDashboard();

  return () => {
    cancelled = true;
  };
}, [router]);


  const totalUsers = users.length;

  const admins = users.filter(
    (user) => user.role?.toLowerCase() === "admin"
  ).length;

  const activeUsers = users.filter(
    (user) => (user.status || "Active").toLowerCase() === "active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status?.toLowerCase() === "inactive"
  ).length;

  const recentUsers = [...users].reverse().slice(0, 5);

  async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    setError(error.message);
    return;
  }

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");

  router.replace("/login");
  router.refresh();
}

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: "👥",
      background: "bg-violet-100",
      color: "text-violet-700",
    },
    {
      title: "Admins",
      value: admins,
      icon: "👑",
      background: "bg-purple-100",
      color: "text-purple-700",
    },
    {
      title: "Active Users",
      value: activeUsers,
      icon: "✅",
      background: "bg-green-100",
      color: "text-green-700",
    },
    {
      title: "Inactive Users",
      value: inactiveUsers,
      icon: "❌",
      background: "bg-red-100",
      color: "text-red-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-gray-900 md:flex">
      {/* Sidebar */}
      <aside className="w-full border-b border-gray-200 bg-white p-6 md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <h2 className="mb-10 text-xl font-bold text-violet-700">
          ◈ User Management System
        </h2>

        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block rounded-lg bg-violet-100 px-4 py-3 font-semibold text-violet-700"
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
            className="block rounded-lg px-4 py-3 hover:bg-violet-50"
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

        <div className="mt-12 rounded-xl bg-violet-50 p-4">
          <p className="text-xs text-gray-500">
            Logged in as
          </p>
          <p className="mt-1 break-words font-semibold">
            {currentUser?.name || "User"}
          </p>
          <p className="mt-1 break-all text-xs text-gray-500">
            {currentUser?.email || ""}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-5 md:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Dashboard
            </h1>
            <p className="mt-2 text-gray-500">
              Welcome back, {currentUser?.name || "User"}!
            </p>
          </div>

          <Link
            href="/users"
            className="rounded-lg bg-violet-700 px-5 py-3 font-semibold text-white hover:bg-violet-800"
          >
            Manage Users →
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
            <button
              onClick={() => window.location.reload()}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${stat.background}`}
              >
                {stat.icon}
              </div>

              <p className="text-sm text-gray-500">
                {stat.title}
              </p>

              <p className={`mt-2 text-3xl font-bold ${stat.color}`}>
                {loading ? "..." : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Overview */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold">
              Users Overview
            </h2>

            {loading ? (
              <p className="text-gray-500">
                Loading statistics...
              </p>
            ) : totalUsers === 0 ? (
              <p className="text-gray-500">
                No users available.
              </p>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Active Users</span>
                    <span className="font-semibold">
                      {activeUsers} / {totalUsers}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width: `${(activeUsers / totalUsers) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Inactive Users</span>
                    <span className="font-semibold">
                      {inactiveUsers} / {totalUsers}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-red-400"
                      style={{
                        width: `${(inactiveUsers / totalUsers) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Admin Accounts</span>
                    <span className="font-semibold">
                      {admins} / {totalUsers}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-violet-600"
                      style={{
                        width: `${(admins / totalUsers) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold">
              Quick Actions
            </h2>

            <div className="space-y-3">
              <Link
                href="/users"
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:bg-violet-50"
              >
                <span>👥 View All Users</span>
                <span>→</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:bg-violet-50"
              >
                <span>👤 Manage My Profile</span>
                <span>→</span>
              </Link>

              <Link
                href="/register"
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:bg-violet-50"
              >
                <span>➕ Register New Account</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              Recently Added Users
            </h2>

            <Link
              href="/users"
              className="text-sm font-semibold text-violet-700 hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-gray-500"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : recentUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100"
                    >
                      <td className="p-4 font-medium">
                        {user.name || "Unknown"}
                      </td>

                      <td className="p-4">
                        {user.email}
                      </td>

                      <td className="p-4">
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">
                          {user.role || "User"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 ${
                            (user.status || "Active").toLowerCase() === "active"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {user.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
