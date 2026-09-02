"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import {
  suspendUser,
  unsuspendUser,
  banUser,
  unbanUser,
} from "@/features/admin/services/user-moderation.service";

interface User {
  id: string;

  full_name: string | null;

  email: string | null;

  role: string | null;

  verification_status: string | null;

  rating: number | null;

  avatar_url: string | null;

  is_banned: boolean | null;

  is_suspended: boolean | null;

  suspended_until: string | null;

  created_at: string | null;
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isNullableNumber(value: unknown): value is number | null {
  return typeof value === "number" || value === null;
}

function isNullableBoolean(value: unknown): value is boolean | null {
  return typeof value === "boolean" || value === null;
}

function isAdminUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (
    !("id" in value) ||
    !("full_name" in value) ||
    !("email" in value) ||
    !("role" in value) ||
    !("verification_status" in value) ||
    !("rating" in value) ||
    !("avatar_url" in value) ||
    !("is_banned" in value) ||
    !("is_suspended" in value) ||
    !("suspended_until" in value) ||
    !("created_at" in value)
  ) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    isNullableString(value.full_name) &&
    isNullableString(value.email) &&
    isNullableString(value.role) &&
    isNullableString(value.verification_status) &&
    isNullableNumber(value.rating) &&
    isNullableString(value.avatar_url) &&
    isNullableBoolean(value.is_banned) &&
    isNullableBoolean(value.is_suspended) &&
    isNullableString(value.suspended_until) &&
    isNullableString(value.created_at)
  );
}

function parseAdminUsers(value: unknown): User[] {
  if (!Array.isArray(value)) {
    throw new Error("Invalid get_admin_users response: expected an array.");
  }

  const users: User[] = [];

  for (const item of value) {
    if (!isAdminUser(item)) {
      throw new Error("Invalid get_admin_users response: invalid user row.");
    }

    users.push(item);
  }

  return users;
}

function isUserActivelySuspended(user: User): boolean {
  if (!user.is_suspended || !user.suspended_until) {
    return false;
  }

  return new Date(user.suspended_until).getTime() > Date.now();
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "ALL" | "ACTIVE" | "SUSPENDED" | "BANNED"
  >("ALL");

  const [totalUsers, setTotalUsers] = useState(0);

  const [activeUsers, setActiveUsers] = useState(0);

  const [suspendedUsers, setSuspendedUsers] = useState(0);

  const [bannedUsers, setBannedUsers] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc("get_admin_users");

      if (error) {
        console.error(error);

        return;
      }

      const allUsers = parseAdminUsers(data);

      setUsers(allUsers);

      setTotalUsers(allUsers.length);

      setBannedUsers(allUsers.filter((user) => user.is_banned).length);

      setSuspendedUsers(
        allUsers.filter(
          (user) => !user.is_banned && isUserActivelySuspended(user),
        ).length,
      );

      setActiveUsers(
        allUsers.filter(
          (user) => !user.is_banned && !isUserActivelySuspended(user),
        ).length,
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchSearch = user.full_name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    if (!matchSearch) {
      return false;
    }

    if (filter === "ACTIVE") {
      return !user.is_banned && !isUserActivelySuspended(user);
    }

    if (filter === "SUSPENDED") {
      return !user.is_banned && isUserActivelySuspended(user);
    }

    if (filter === "BANNED") {
      return !!user.is_banned;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,

    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <main className="p-8">
      <h1
        className="
                text-3xl
                font-black
                text-slate-900
            "
      >
        User Management
      </h1>

      <div
        className="
        mt-8
        grid
        grid-cols-4
        gap-4
    "
      >
        <div
          className="
            rounded-3xl
            bg-white
            p-5
            shadow-sm
        "
        >
          <p className="text-sm text-slate-500">Total User</p>

          <h2 className="mt-2 text-3xl font-black">{totalUsers}</h2>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active</p>

          <h2 className="mt-2 text-3xl font-black text-emerald-600">
            {activeUsers}
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Suspended</p>

          <h2 className="mt-2 text-3xl font-black text-amber-600">
            {suspendedUsers}
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Banned</p>

          <h2 className="mt-2 text-3xl font-black text-red-600">
            {bannedUsers}
          </h2>
        </div>
      </div>

      <input
        type="text"
        placeholder="Cari user..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 w-full rounded-2xl border p-4"
      />

      <div className="mt-4 flex gap-3 flex-wrap">
        <button
          onClick={() => setFilter("ALL")}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold

            ${filter === "ALL" ? "bg-slate-900 text-white" : "bg-white"}
        `}
        >
          All
        </button>

        <button
          onClick={() => setFilter("ACTIVE")}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold

            ${filter === "ACTIVE" ? "bg-emerald-600 text-white" : "bg-white"}
        `}
        >
          Active
        </button>

        <button
          onClick={() => setFilter("SUSPENDED")}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold

            ${filter === "SUSPENDED" ? "bg-amber-500 text-white" : "bg-white"}
        `}
        >
          Suspended
        </button>

        <button
          onClick={() => setFilter("BANNED")}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold

            ${filter === "BANNED" ? "bg-red-600 text-white" : "bg-white"}
        `}
        >
          Banned
        </button>
      </div>

      {loading && <p className="mt-6">Loading...</p>}

      <p className="mt-6 text-sm text-slate-500">
        Menampilkan {paginatedUsers.length} user
      </p>

      <div className=" mt-8 space-y-4">
        {paginatedUsers.map((user) => (
          <div key={user.id} className="rounded-3xl bg-white p-6 shadow-sm">
            {/* USER PROFILE LINK */}
            <Link
              href={`/users/${user.id}`}
              className="group flex items-center gap-4 rounded-2xl transition hover:bg-slate-50"
            >
              <img
                src={user.avatar_url || "/avatar.png"}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900 transition group-hover:text-blue-600">
                      {user.full_name || "Tanpa Nama"}
                    </p>

                    <p className="truncate text-sm text-slate-500">
                      {user.email || "-"}
                    </p>
                  </div>

                  <span
                    className="
                        shrink-0
                        text-xs
                        font-semibold
                        text-slate-400
                        transition
                        group-hover:text-blue-600
                    "
                  >
                    Lihat Profil →
                  </span>
                </div>

                <div
                  className="
                    mt-2
                    flex
                    flex-wrap
                    gap-2
                "
                >
                  <span
                    className="
                        rounded-full
                        bg-slate-100
                        px-3
                        py-1
                        text-xs
                    "
                  >
                    {user.role || "USER"}
                  </span>

                  <span
                    className="
                        rounded-full
                        bg-emerald-100
                        px-3
                        py-1
                        text-xs
                    "
                  >
                    {user.verification_status || "UNVERIFIED"}
                  </span>

                  <span className="rounded-xl bg-amber-100 px-2 py-1 text-xs">
                    ⭐ {Number(user.rating ?? 0).toFixed(1)}
                  </span>

                  {user.is_banned ? (
                    <span
                      className="
                                rounded-full
                                bg-red-100
                                px-3
                                py-1
                                text-xs
                                font-bold
                                text-red-700
                            "
                    >
                      BANNED
                    </span>
                  ) : isUserActivelySuspended(user) ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      SUSPENDED
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* ADMIN ACTIONS */}
            <div
              className="
            mt-5
            flex
            flex-wrap
            gap-2
            border-t
            border-slate-100
            pt-4
        "
            >
              {user.is_banned ? (
                <button
                  onClick={async () => {
                    const confirmAction = window.confirm(
                      `Unban ${user.full_name || "user ini"}?`,
                    );

                    if (!confirmAction) {
                      return;
                    }

                    try {
                      await unbanUser(user.id);

                      alert("User berhasil di-unban.");

                      await loadUsers();
                    } catch (error) {
                      console.error(error);

                      alert("Gagal melakukan unban user.");
                    }
                  }}
                  className="
                        rounded-xl
                        bg-emerald-600
                        px-4
                        py-2
                        text-xs
                        font-semibold
                        text-white
                    "
                >
                  Unban
                </button>
              ) : isUserActivelySuspended(user) ? (
                <>
                  <button
                    onClick={async () => {
                      const confirmAction = window.confirm(
                        `Hapus suspend ${user.full_name || "user ini"}?`,
                      );

                      if (!confirmAction) {
                        return;
                      }

                      try {
                        await unsuspendUser(user.id);

                        alert("Suspend user berhasil dihapus.");

                        await loadUsers();
                      } catch (error) {
                        console.error(error);

                        alert("Gagal melakukan unsuspend user.");
                      }
                    }}
                    className="
                            rounded-xl
                            bg-emerald-600
                            px-4
                            py-2
                            text-xs
                            font-semibold
                            text-white
                        "
                  >
                    Unsuspend
                  </button>

                  <button
                    onClick={async () => {
                      const confirmAction = window.confirm(
                        `Ban permanen ${user.full_name || "user ini"}?`,
                      );

                      if (!confirmAction) {
                        return;
                      }

                      try {
                        await banUser(user.id);

                        alert("User berhasil dibanned.");

                        await loadUsers();
                      } catch (error) {
                        console.error(error);

                        alert("Gagal ban user.");
                      }
                    }}
                    className="
                            rounded-xl
                            bg-red-600
                            px-4
                            py-2
                            text-xs
                            font-semibold
                            text-white
                        "
                  >
                    Ban
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={async () => {
                      const confirmAction = window.confirm(
                        `Suspend ${
                          user.full_name || "user ini"
                        } selama 3 hari?`,
                      );

                      if (!confirmAction) {
                        return;
                      }

                      try {
                        await suspendUser(user.id, 3, "Admin Manual Action");

                        alert("User berhasil disuspend 3 hari.");

                        await loadUsers();
                      } catch (error) {
                        console.error(error);

                        alert("Gagal suspend user.");
                      }
                    }}
                    className="
                            rounded-xl
                            bg-amber-500
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-white
                        "
                  >
                    Suspend 3 Hari
                  </button>

                  <button
                    onClick={async () => {
                      const confirmAction = window.confirm(
                        `Suspend ${
                          user.full_name || "user ini"
                        } selama 7 hari?`,
                      );

                      if (!confirmAction) {
                        return;
                      }

                      try {
                        await suspendUser(user.id, 7, "Admin Manual Action");

                        alert("User berhasil disuspend 7 hari.");

                        await loadUsers();
                      } catch (error) {
                        console.error(error);

                        alert("Gagal suspend user.");
                      }
                    }}
                    className="
                            rounded-xl
                            bg-orange-500
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-white
                        "
                  >
                    Suspend 7 Hari
                  </button>

                  <button
                    onClick={async () => {
                      const confirmAction = window.confirm(
                        `Ban permanen ${user.full_name || "user ini"}?`,
                      );

                      if (!confirmAction) {
                        return;
                      }

                      try {
                        await banUser(user.id);

                        alert("User berhasil dibanned.");

                        await loadUsers();
                      } catch (error) {
                        console.error(error);

                        alert("Gagal ban user.");
                      }
                    }}
                    className="
                            rounded-xl
                            bg-red-600
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-white
                        "
                  >
                    Ban
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="rounded-xl border px-4 py-2 disabled:opacity-50"
        >
          ← Prev
        </button>

        <span className="px-4 py-2 text-sm font-semibold">
          Page {currentPage} / {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="rounded-xl border px-4 py-2 disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </main>
  );
}