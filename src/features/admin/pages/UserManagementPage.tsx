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

import {
  BadgeCheck,
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

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

type AccountFilter = "ALL" | "ACTIVE" | "SUSPENDED" | "BANNED";

type RoleFilter = "ALL" | "USER" | "HELPER" | "ADMIN";

type VerificationFilter =
  | "ALL"
  | "VERIFIED"
  | "PENDING"
  | "REJECTED"
  | "UNVERIFIED";

type SortOption = "NEWEST" | "OLDEST" | "RATING_HIGH" | "NAME";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<AccountFilter>("ALL");

  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

  const [verificationFilter, setVerificationFilter] =
    useState<VerificationFilter>("ALL");

  const [sort, setSort] = useState<SortOption>("NEWEST");

  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

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

  const normalizedSearch = search.trim().toLowerCase();

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.full_name?.toLowerCase().includes(normalizedSearch) ||
        user.email?.toLowerCase().includes(normalizedSearch) ||
        user.id.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }

      if (
        filter === "ACTIVE" &&
        (user.is_banned || isUserActivelySuspended(user))
      ) {
        return false;
      }

      if (
        filter === "SUSPENDED" &&
        (user.is_banned || !isUserActivelySuspended(user))
      ) {
        return false;
      }

      if (filter === "BANNED" && !user.is_banned) {
        return false;
      }

      if (roleFilter !== "ALL" && user.role !== roleFilter) {
        return false;
      }

      if (
        verificationFilter !== "ALL" &&
        (user.verification_status || "UNVERIFIED") !== verificationFilter
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sort === "OLDEST") {
        return (
          new Date(a.created_at || 0).getTime() -
          new Date(b.created_at || 0).getTime()
        );
      }

      if (sort === "RATING_HIGH") {
        return Number(b.rating ?? 0) - Number(a.rating ?? 0);
      }

      if (sort === "NAME") {
        return (a.full_name || "").localeCompare(b.full_name || "", "id-ID");
      }

      return (
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      );
    });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,

    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <main
      className="
      min-h-screen
      bg-slate-50/70
      p-4
      sm:p-6
      lg:p-8
    "
    >
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <header
          className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
        >
          <div className="max-w-3xl">
            <div
              className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-indigo-100
              bg-white
              px-3.5
              py-2
              text-xs
              font-bold
              text-indigo-700
              shadow-sm
            "
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={2} />
              User Operations
            </div>

            <h1
              className="
              mt-4
              text-3xl
              font-black
              tracking-[-0.03em]
              text-slate-950
              sm:text-4xl
            "
            >
              Manajemen Pengguna
            </h1>

            <p
              className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
            "
            >
              Pantau identitas, reputasi, status akun, serta lakukan moderasi
              pengguna HelpMe dari satu tempat.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadUsers();
            }}
            disabled={loading}
            className="
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-4
            text-sm
            font-bold
            text-slate-700
            shadow-sm
            transition
            hover:border-indigo-200
            hover:text-indigo-700
            disabled:opacity-50
          "
          >
            <RefreshCw
              className={`
              h-4
              w-4
              ${loading ? "animate-spin" : ""}
            `}
              strokeWidth={2}
            />
            Muat Ulang
          </button>
        </header>

        {/* STATISTICS */}
        <section
          className="
          mt-7
          grid
          grid-cols-2
          gap-3
          lg:grid-cols-4
          lg:gap-4
        "
        >
          {[
            {
              label: "Total Pengguna",
              value: totalUsers,
              icon: UsersRound,
              iconClass: "bg-indigo-50 text-indigo-600",
            },
            {
              label: "Aktif",
              value: activeUsers,
              icon: UserRoundCheck,
              iconClass: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Disuspend",
              value: suspendedUsers,
              icon: Clock3,
              iconClass: "bg-amber-50 text-amber-600",
            },
            {
              label: "Dibanned",
              value: bannedUsers,
              icon: Ban,
              iconClass: "bg-red-50 text-red-600",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-[0_8px_24px_rgba(15,23,42,0.035)]
                sm:p-5
              "
              >
                <div
                  className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-2xl
                  ${stat.iconClass}
                `}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>

                <p className="mt-4 text-xs font-semibold text-slate-500">
                  {stat.label}
                </p>

                <p className="mt-1 text-2xl font-black text-slate-950">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* FILTER PANEL */}
        <section
          className="
          mt-6
          rounded-[28px]
          border
          border-slate-200
          bg-white
          p-4
          shadow-[0_8px_24px_rgba(15,23,42,0.035)]
          sm:p-5
        "
        >
          <div
            className="
            grid
            gap-3
            xl:grid-cols-[minmax(280px,1fr)_180px_190px_170px]
          "
          >
            <div className="relative">
              <Search
                className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-400
              "
                strokeWidth={2}
              />

              <input
                type="search"
                value={search}
                placeholder="Cari nama, email, atau User ID..."
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="
                h-11
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                pl-10
                pr-4
                text-sm
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-indigo-300
                focus:bg-white
                focus:ring-4
                focus:ring-indigo-50
              "
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as RoleFilter);
                setCurrentPage(1);
              }}
              className="
              h-11
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              font-semibold
              text-slate-600
              outline-none
            "
            >
              <option value="ALL">Semua role</option>
              <option value="USER">User</option>
              <option value="HELPER">Helper</option>
              <option value="ADMIN">Admin</option>
            </select>

            <select
              value={verificationFilter}
              onChange={(e) => {
                setVerificationFilter(e.target.value as VerificationFilter);
                setCurrentPage(1);
              }}
              className="
              h-11
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              font-semibold
              text-slate-600
              outline-none
            "
            >
              <option value="ALL">Semua verifikasi</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortOption);
                setCurrentPage(1);
              }}
              className="
              h-11
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              font-semibold
              text-slate-600
              outline-none
            "
            >
              <option value="NEWEST">Terbaru</option>
              <option value="OLDEST">Terlama</option>
              <option value="RATING_HIGH">Rating tertinggi</option>
              <option value="NAME">Nama A–Z</option>
            </select>
          </div>

          <div
            className="
            mt-4
            flex
            flex-wrap
            gap-2
            border-t
            border-slate-100
            pt-4
          "
          >
            {(["ALL", "ACTIVE", "SUSPENDED", "BANNED"] as AccountFilter[]).map(
              (status) => {
                const selected = filter === status;

                const label =
                  status === "ALL"
                    ? "Semua"
                    : status === "ACTIVE"
                      ? "Aktif"
                      : status === "SUSPENDED"
                        ? "Suspended"
                        : "Banned";

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setFilter(status);
                      setCurrentPage(1);
                    }}
                    className={`
                  rounded-full
                  border
                  px-4
                  py-2
                  text-xs
                  font-bold
                  transition
                  ${
                    selected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }
                `}
                  >
                    {label}
                  </button>
                );
              },
            )}
          </div>
        </section>

        {/* RESULT HEADER */}
        <div className="mt-6">
          <h2 className="text-base font-black text-slate-900">
            Daftar Pengguna
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Menampilkan {paginatedUsers.length} dari {filteredUsers.length}{" "}
            pengguna.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            className="
            mt-4
            flex
            min-h-56
            items-center
            justify-center
            rounded-[28px]
            border
            border-slate-200
            bg-white
          "
          >
            <div className="text-center">
              <LoaderCircle
                className="
                mx-auto
                h-7
                w-7
                animate-spin
                text-indigo-600
              "
                strokeWidth={2}
              />

              <p className="mt-3 text-sm font-bold text-slate-700">
                Memuat pengguna
              </p>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredUsers.length === 0 && (
          <div
            className="
            mt-4
            flex
            min-h-64
            items-center
            justify-center
            rounded-[28px]
            border
            border-slate-200
            bg-white
            px-6
            text-center
          "
          >
            <div>
              <CircleUserRound
                className="
                mx-auto
                h-9
                w-9
                text-slate-300
              "
                strokeWidth={1.7}
              />

              <h3 className="mt-3 text-sm font-black text-slate-800">
                Pengguna tidak ditemukan
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Coba ubah pencarian atau filter.
              </p>
            </div>
          </div>
        )}

        {/* USERS */}
        {!loading && paginatedUsers.length > 0 && (
          <div className="mt-4 space-y-3">
            {paginatedUsers.map((user) => {
              const suspended = isUserActivelySuspended(user);

              const processing = processingUserId === user.id;

              return (
                <article
                  key={user.id}
                  className="
                  rounded-[28px]
                  border
                  border-slate-200
                  bg-white
                  p-4
                  shadow-[0_8px_24px_rgba(15,23,42,0.03)]
                  sm:p-5
                "
                >
                  <div
                    className="
                    flex
                    flex-col
                    gap-5
                    xl:flex-row
                    xl:items-center
                    xl:justify-between
                  "
                  >
                    <Link
                      href={`/users/${user.id}`}
                      className="
                      group
                      flex
                      min-w-0
                      items-start
                      gap-4
                    "
                    >
                      <div
                        className="
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-100
                        text-lg
                        font-black
                        text-slate-600
                      "
                      >
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={`Foto profil ${user.full_name || "pengguna"}`}
                            className="
                            h-full
                            w-full
                            object-cover
                          "
                          />
                        ) : (
                          user.full_name?.charAt(0).toUpperCase() || "U"
                        )}
                      </div>

                      <div className="min-w-0">
                        <div
                          className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        "
                        >
                          <p
                            className="
                            truncate
                            text-sm
                            font-black
                            text-slate-900
                            transition
                            group-hover:text-indigo-600
                          "
                          >
                            {user.full_name || "Tanpa Nama"}
                          </p>

                          {user.verification_status === "VERIFIED" && (
                            <BadgeCheck
                              className="
                              h-4
                              w-4
                              shrink-0
                              text-indigo-600
                            "
                              strokeWidth={2.2}
                            />
                          )}
                        </div>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {user.email || "Email tidak tersedia"}
                        </p>

                        <p
                          className="
                          mt-1
                          max-w-72
                          truncate
                          font-mono
                          text-[9px]
                          text-slate-400
                        "
                        >
                          {user.id}
                        </p>
                      </div>
                    </Link>

                    <div
                      className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                      xl:justify-end
                    "
                    >
                      <span
                        className="
                        rounded-full
                        bg-slate-100
                        px-3
                        py-1.5
                        text-[10px]
                        font-bold
                        text-slate-600
                      "
                      >
                        {user.role || "USER"}
                      </span>

                      <span
                        className={`
                        rounded-full
                        px-3
                        py-1.5
                        text-[10px]
                        font-bold
                        ${
                          user.verification_status === "VERIFIED"
                            ? "bg-indigo-50 text-indigo-700"
                            : user.verification_status === "PENDING"
                              ? "bg-amber-50 text-amber-700"
                              : user.verification_status === "REJECTED"
                                ? "bg-red-50 text-red-600"
                                : "bg-slate-100 text-slate-500"
                        }
                      `}
                      >
                        {user.verification_status || "UNVERIFIED"}
                      </span>

                      <span
                        className="
                        inline-flex
                        items-center
                        gap-1
                        rounded-full
                        bg-amber-50
                        px-3
                        py-1.5
                        text-[10px]
                        font-bold
                        text-amber-700
                      "
                      >
                        <Star
                          className="
                          h-3
                          w-3
                          fill-amber-400
                          text-amber-400
                        "
                        />

                        {Number(user.rating ?? 0).toFixed(1)}
                      </span>

                      {user.is_banned ? (
                        <span
                          className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          bg-red-50
                          px-3
                          py-1.5
                          text-[10px]
                          font-black
                          text-red-600
                        "
                        >
                          <Ban className="h-3 w-3" strokeWidth={2} />
                          Banned
                        </span>
                      ) : suspended ? (
                        <span
                          className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          bg-amber-50
                          px-3
                          py-1.5
                          text-[10px]
                          font-black
                          text-amber-700
                        "
                        >
                          <Clock3 className="h-3 w-3" strokeWidth={2} />
                          Suspended
                        </span>
                      ) : (
                        <span
                          className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          bg-emerald-50
                          px-3
                          py-1.5
                          text-[10px]
                          font-black
                          text-emerald-700
                        "
                        >
                          <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="
                    mt-5
                    flex
                    flex-wrap
                    gap-x-5
                    gap-y-2
                    border-t
                    border-slate-100
                    pt-4
                    text-[10px]
                    text-slate-400
                  "
                  >
                    <span
                      className="
                      inline-flex
                      items-center
                      gap-1.5
                    "
                    >
                      <CalendarDays className="h-3.5 w-3.5" strokeWidth={2} />
                      Bergabung{" "}
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              dateStyle: "medium",
                            },
                          )
                        : "-"}
                    </span>

                    {suspended && user.suspended_until && (
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          text-amber-600
                        "
                      >
                        <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
                        Suspend sampai{" "}
                        {new Date(user.suspended_until).toLocaleString(
                          "id-ID",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        )}
                      </span>
                    )}
                  </div>

                  <div
                    className="
                    mt-4
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                  >
                    {user.is_banned ? (
                      <button
                        type="button"
                        disabled={processing}
                        onClick={async () => {
                          if (
                            !window.confirm(
                              `Aktifkan kembali akun ${
                                user.full_name || "user ini"
                              }?`,
                            )
                          ) {
                            return;
                          }

                          try {
                            setProcessingUserId(user.id);

                            await unbanUser(user.id);

                            alert("User berhasil di-unban.");

                            await loadUsers();
                          } catch (error) {
                            console.error(error);

                            alert("Gagal melakukan unban user.");
                          } finally {
                            setProcessingUserId(null);
                          }
                        }}
                        className="
                        inline-flex
                        h-9
                        items-center
                        gap-2
                        rounded-xl
                        bg-emerald-600
                        px-3
                        text-xs
                        font-bold
                        text-white
                        transition
                        hover:bg-emerald-700
                        disabled:opacity-50
                      "
                      >
                        {processing && (
                          <LoaderCircle
                            className="
                            h-3.5
                            w-3.5
                            animate-spin
                          "
                          />
                        )}
                        Unban
                      </button>
                    ) : suspended ? (
                      <>
                        <button
                          type="button"
                          disabled={processing}
                          onClick={async () => {
                            if (
                              !window.confirm(
                                `Hapus suspend ${
                                  user.full_name || "user ini"
                                }?`,
                              )
                            ) {
                              return;
                            }

                            try {
                              setProcessingUserId(user.id);

                              await unsuspendUser(user.id);

                              alert("Suspend user berhasil dihapus.");

                              await loadUsers();
                            } catch (error) {
                              console.error(error);

                              alert("Gagal melakukan unsuspend user.");
                            } finally {
                              setProcessingUserId(null);
                            }
                          }}
                          className="
                          inline-flex
                          h-9
                          items-center
                          rounded-xl
                          bg-emerald-600
                          px-3
                          text-xs
                          font-bold
                          text-white
                          disabled:opacity-50
                        "
                        >
                          Unsuspend
                        </button>

                        <button
                          type="button"
                          disabled={processing}
                          onClick={async () => {
                            if (
                              !window.confirm(
                                `Ban permanen ${user.full_name || "user ini"}?`,
                              )
                            ) {
                              return;
                            }

                            try {
                              setProcessingUserId(user.id);

                              await banUser(user.id);

                              alert("User berhasil dibanned.");

                              await loadUsers();
                            } catch (error) {
                              console.error(error);

                              alert("Gagal ban user.");
                            } finally {
                              setProcessingUserId(null);
                            }
                          }}
                          className="
                          inline-flex
                          h-9
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-red-200
                          bg-red-50
                          px-3
                          text-xs
                          font-bold
                          text-red-600
                          transition
                          hover:bg-red-100
                          disabled:opacity-50
                        "
                        >
                          <Ban className="h-3.5 w-3.5" strokeWidth={2} />
                          Ban Permanen
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={processing}
                          onClick={async () => {
                            if (
                              !window.confirm(
                                `Suspend ${
                                  user.full_name || "user ini"
                                } selama 3 hari?`,
                              )
                            ) {
                              return;
                            }

                            try {
                              setProcessingUserId(user.id);

                              await suspendUser(
                                user.id,
                                3,
                                "Admin Manual Action",
                              );

                              alert("User berhasil disuspend 3 hari.");

                              await loadUsers();
                            } catch (error) {
                              console.error(error);

                              alert("Gagal suspend user.");
                            } finally {
                              setProcessingUserId(null);
                            }
                          }}
                          className="
                          inline-flex
                          h-9
                          items-center
                          gap-2
                          rounded-xl
                          bg-amber-50
                          px-3
                          text-xs
                          font-bold
                          text-amber-700
                          transition
                          hover:bg-amber-100
                          disabled:opacity-50
                        "
                        >
                          <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
                          Suspend 3 Hari
                        </button>

                        <button
                          type="button"
                          disabled={processing}
                          onClick={async () => {
                            if (
                              !window.confirm(
                                `Suspend ${
                                  user.full_name || "user ini"
                                } selama 7 hari?`,
                              )
                            ) {
                              return;
                            }

                            try {
                              setProcessingUserId(user.id);

                              await suspendUser(
                                user.id,
                                7,
                                "Admin Manual Action",
                              );

                              alert("User berhasil disuspend 7 hari.");

                              await loadUsers();
                            } catch (error) {
                              console.error(error);

                              alert("Gagal suspend user.");
                            } finally {
                              setProcessingUserId(null);
                            }
                          }}
                          className="
                          inline-flex
                          h-9
                          items-center
                          gap-2
                          rounded-xl
                          bg-orange-50
                          px-3
                          text-xs
                          font-bold
                          text-orange-700
                          transition
                          hover:bg-orange-100
                          disabled:opacity-50
                        "
                        >
                          <ShieldAlert
                            className="h-3.5 w-3.5"
                            strokeWidth={2}
                          />
                          Suspend 7 Hari
                        </button>

                        <button
                          type="button"
                          disabled={processing}
                          onClick={async () => {
                            if (
                              !window.confirm(
                                `Ban permanen ${user.full_name || "user ini"}?`,
                              )
                            ) {
                              return;
                            }

                            try {
                              setProcessingUserId(user.id);

                              await banUser(user.id);

                              alert("User berhasil dibanned.");

                              await loadUsers();
                            } catch (error) {
                              console.error(error);

                              alert("Gagal ban user.");
                            } finally {
                              setProcessingUserId(null);
                            }
                          }}
                          className="
                          inline-flex
                          h-9
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-red-200
                          bg-red-50
                          px-3
                          text-xs
                          font-bold
                          text-red-600
                          transition
                          hover:bg-red-100
                          disabled:opacity-50
                        "
                        >
                          <Ban className="h-3.5 w-3.5" strokeWidth={2} />
                          Ban Permanen
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && filteredUsers.length > 0 && (
          <div
            className="
            mt-7
            flex
            items-center
            justify-center
            gap-3
          "
          >
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              aria-label="Halaman sebelumnya"
              className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-600
              disabled:opacity-40
            "
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div
              className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-xs
              font-bold
              text-slate-600
            "
            >
              Halaman {currentPage} dari {totalPages || 1}
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              aria-label="Halaman berikutnya"
              className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-600
              disabled:opacity-40
            "
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}