"use client";

import { AdminNavigation } from "../constants/admin-navigation";

import AdminDashboardCard from "../components/dashboard/AdminDashboardCard";

export default function AdminDashboardPage() {
  const menus = AdminNavigation.filter(
    (item) => item.enabled && item.showOnDashboard,
  );

  return (
    <div>
      <div
        className="
                    grid
                    gap-6
                    md:grid-cols-2
                    xl:grid-cols-3
                "
      >
        {menus.map((item) => (
          <AdminDashboardCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}