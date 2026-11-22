
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = "http://localhost:3007";

type User = {
  id: number | string;
  name?: string;
  email: string;
  role?: string;
  status?: string;
  createdAt?: string;
};

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
};

const emptyForm: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "User",
  status: "Active",
};

function formatDate(date?: string) {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleString();
}

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<
    User["id"] | null
  >(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState<UserForm>({
    ...emptyForm,
  });

  const [editingId, setEditingId] = useState<
    User["id"] | null
  >(null);

  const [showForm, setShowForm] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(
    null
  );

  const [page, setPage] = useState(1);

  const pageSize = 5;

  function getToken() {
    return sessionStorage.getItem("token");
  }

  async function loadUsers(token: string) {

    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            "Session expired or access denied. Please log in again."
          );
        }

        throw new Error(
          `Failed to load users (${response.status})`
        );
      }

      const data: User[] = await response.json();
      setError("");

      if (!Array.isArray(data)) {
        throw new Error("Invalid server response");
      }

      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  }


useEffect(() => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    router.replace("/login");
    return;
  }

  async function fetchInitialUsers() {
    try {
      const response = await fetch(
        `${API_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load users (${response.status})`
        );
      }

      const data: User[] = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid server response");
      }

      setUsers(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  }

  void fetchInitialUsers();
}, [router]);

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users.filter((user) => {
      const name = (user.name || "").toLowerCase();
      const email = user.email.toLowerCase();

      return (
        name.includes(query) || email.includes(query)
      );
    });
  }, [users, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalUsers = users.length;

  const admins = users.filter(
    (user) => user.role?.toLowerCase() === "admin"
  ).length;

  const activeUsers = users.filter(
    (user) =>
      (user.status || "Active").toLowerCase() ===
      "active"
  ).length;

  const inactiveUsers = users.filter(
    (user) =>
      user.status?.toLowerCase() === "inactive"
  ).length;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: "👥",
      bg: "bg-violet-100",
      color: "text-violet-700",
    },
    {
      label: "Admins",
      value: admins,
      icon: "👑",
      bg: "bg-purple-100",
      color: "text-purple-700",
    },
    {
      label: "Active Users",
      value: activeUsers,
      icon: "✅",
      bg: "bg-green-100",
      color: "text-green-700",
    },
    {
      label: "Inactive Users",
      value: inactiveUsers,
      icon: "❌",
      bg: "bg-red-100",
      color: "text-red-700",
    },
  ];

  function openCreate() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function openEdit(user: User) {
    setForm({
      name: user.name || "",
      email: user.email,
      password: "",
      role: user.role || "User",
      status: user.status || "Active",
    });

    setEditingId(user.id);
    setError("");
    setNotice("");
    setShowForm(true);
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setNotice("");

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const isEditing = editingId !== null;

    if (!form.name.trim()) {
      setError("Full name is required");
      return;
    }

    if (
      (!isEditing || form.password) &&
      form.password.length < 6
    ) {
      setError(
        "Password must contain at least 6 characters"
      );
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, string> = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        status: form.status,
      };

      if (!isEditing || form.password) {
        payload.password = form.password;
      }

      const url = isEditing
        ? `${API_URL}/users/${editingId}`
        : `${API_URL}/register`;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Request failed (${response.status})`
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      await loadUsers(token);

      setNotice(
        isEditing
          ? "User updated successfully!"
          : "User created successfully!"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save user"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: User["id"]) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setError("");
    setNotice("");
    setDeletingId(id);

    try {
      const response = await fetch(
        `${API_URL}/users/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Delete failed (${response.status})`
        );
      }

      await loadUsers(token);
      setNotice("User deleted successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete user"
      );
    } finally {
      setDeletingId(null);
    }
  }

  function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-gray-900 md:flex">

      {/* SIDEBAR */}
      <aside className="flex w-full flex-col border-b border-gray-200 bg-white p-6 md:min-h-screen md:w-60 md:border-b-0 md:border-r">

        <Link
          href="/dashboard"
          className="mb-10 flex items-center gap-3 text-xl font-bold text-violet-700"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
            ◈
          </span>
          <span>Json Server Auth</span>
        </Link>

        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-600 hover:bg-violet-50"
          >
            🏠 Dashboard
          </Link>

          <Link
            href="/users"
            className="flex items-center gap-3 rounded-lg bg-violet-100 px-4 py-3 font-semibold text-violet-700"
          >
            👥 Users
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-600 hover:bg-violet-50"
          >
            👤 Profile
          </Link>

          <div className="my-4 border-t border-gray-100" />

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-red-600 hover:bg-red-50"
          >
            ↪ Logout
          </button>
        </nav>

        <div className="mt-auto pt-10">
          <div className="rounded-xl bg-violet-50 p-4">
            <p className="text-xs text-gray-500">
              User Management
            </p>
            <p className="mt-1 font-semibold text-violet-700">
              Json Server Auth
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 p-5 md:p-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Users Management
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage all users in the system. Create,
              view, update, and delete users.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-violet-700 px-5 py-3 font-semibold text-white hover:bg-violet-800"
          >
            + Create User
          </button>
        </div>

        {/* ALERTS */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 rounded-lg bg-green-50 p-4 text-green-700"
          >
            {notice}
          </div>
        )}

        {/* STATISTICS */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${stat.bg}`}
              >
                {stat.icon}
              </div>

              <p className="text-sm text-gray-500">
                {stat.label}
              </p>

              <p
                className={`mt-2 text-3xl font-bold ${stat.color}`}
              >
                {loading ? "..." : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* USERS TABLE */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">
              Users List
            </h2>

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-violet-500 sm:w-72"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-gray-500"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : visibleUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-3">
                        {user.id}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                            {(user.name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <span className="font-medium">
                            {user.name || "Unknown"}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        {user.email}
                      </td>

                      <td className="p-3">
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">
                          {user.role || "User"}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 ${
                            (user.status || "Active")
                              .toLowerCase() === "active"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {user.status || "Active"}
                        </span>
                      </td>

                      <td className="p-3 text-xs text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">

                          {/* VIEW */}
                          <button
                            type="button"
                            title="View User"
                            onClick={() => setViewUser(user)}
                            className="rounded-lg bg-violet-50 px-3 py-2 text-violet-700 hover:bg-violet-100"
                          >
                            👁️
                          </button>

                          {/* EDIT */}
                          <button
                            type="button"
                            title="Edit User"
                            onClick={() => openEdit(user)}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-blue-700 hover:bg-blue-100"
                          >
                            ✏️
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            title="Delete User"
                            disabled={deletingId === user.id}
                            onClick={() =>
                              handleDelete(user.id)
                            }
                            className="rounded-lg bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
            <span>
              Showing {visibleUsers.length} of{" "}
              {filteredUsers.length} users
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setPage(currentPage - 1)
                }
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
              >
                Prev
              </button>

              <span className="px-2">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage(currentPage + 1)
                }
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* CREATE / EDIT MODAL */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="user-form-title"
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            >
              <h2
                id="user-form-title"
                className="mb-5 text-2xl font-bold"
              >
                {editingId !== null
                  ? "Edit User"
                  : "Create User"}
              </h2>

              <form
                onSubmit={handleSave}
                className="space-y-4"
              >
                <label className="block text-sm">
                  Full Name
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border p-3"
                  />
                </label>

                <label className="block text-sm">
                  Email
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border p-3"
                  />
                </label>

                <label className="block text-sm">
                  Password{" "}
                  {editingId !== null &&
                    "(leave blank to keep current)"}
                  <input
                    type="password"
                    required={editingId === null}
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border p-3"
                  />
                </label>

                <label className="block text-sm">
                  Role
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border p-3"
                  >
                    <option value="User">
                      User
                    </option>
                    <option value="Admin">
                      Admin
                    </option>
                  </select>
                </label>

                <label className="block text-sm">
                  Status
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border p-3"
                  >
                    <option value="Active">
                      Active
                    </option>
                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </label>

                {error && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                  >
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setError("");
                    }}
                    className="flex-1 rounded-lg border py-3"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-lg bg-violet-700 py-3 font-semibold text-white disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : "Save User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW USER MODAL */}
        {viewUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setViewUser(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="view-user-title"
              className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2
                  id="view-user-title"
                  className="text-2xl font-bold"
                >
                  User Details
                </h2>

                <button
                  type="button"
                  onClick={() => setViewUser(null)}
                  className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 flex flex-col items-center">
                <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-3xl font-bold text-violet-700">
                  {(viewUser.name || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <h3 className="text-xl font-bold">
                  {viewUser.name || "Unknown User"}
                </h3>

                <p className="break-all text-sm text-gray-500">
                  {viewUser.email}
                </p>
              </div>

              <div className="space-y-4 rounded-xl bg-gray-50 p-5 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    User ID
                  </span>
                  <span className="font-semibold">
                    {viewUser.id}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Full Name
                  </span>
                  <span className="text-right font-semibold">
                    {viewUser.name || "Not provided"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Email
                  </span>
                  <span className="break-all text-right font-medium">
                    {viewUser.email}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Role
                  </span>
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-700">
                    {viewUser.role || "User"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Status
                  </span>
                  <span
                    className={
                      (viewUser.status || "Active")
                        .toLowerCase() === "active"
                        ? "font-semibold text-green-700"
                        : "font-semibold text-red-700"
                    }
                  >
                    {viewUser.status || "Active"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Created At
                  </span>
                  <span className="text-right font-medium">
                    {formatDate(viewUser.createdAt)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="mt-6 w-full rounded-lg bg-violet-700 py-3 font-semibold text-white hover:bg-violet-800"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
