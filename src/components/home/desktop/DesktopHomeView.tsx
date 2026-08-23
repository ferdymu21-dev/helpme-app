"use client";

import { useState } from "react";

import type { NearbyTask } from "@/features/tasks/types/nearby-task";

import DesktopHomeHeader from "@/components/layout/desktop/DesktopHomeHeader";

import DesktopQuickActions from "@/components/home/desktop/DesktopQuickActions";

import DesktopAdsBanner from "@/components/home/desktop/DesktopAdsBanner";

import DesktopTaskFeed from "@/components/home/desktop/DesktopTaskFeed";

import DesktopSidebar from "@/components/layout/desktop/DesktopSidebar";

import PaymentRoot from "@/features/payments/components/PaymentRoot";

interface Props {
  tasks: NearbyTask[];

  loadingTasks: boolean;

  locationError: string | null;

  activeCategory: string;

  currentPage: number;

  totalPages: number;

  onCategoryChange: (category: string) => void;

  onPreviousPage: () => void;

  onNextPage: () => void;
}

export default function DesktopHomeView({
  tasks,
  loadingTasks,
  locationError,
  activeCategory,
  currentPage,
  totalPages,
  onCategoryChange,
  onPreviousPage,
  onNextPage,
}: Props) {
  const [openSupport, setOpenSupport] = useState(false);

  return (
    <div className="hidden lg:block">
      <DesktopSidebar onOpenSupport={() => setOpenSupport(true)} />

      <main className="min-h-screen bg-slate-50 pl-70">
        <DesktopHomeHeader />

        <DesktopQuickActions />

        <DesktopAdsBanner />

        <DesktopTaskFeed
          tasks={tasks}
          loadingTasks={loadingTasks}
          locationError={locationError}
          activeCategory={activeCategory}
          currentPage={currentPage}
          totalPages={totalPages}
          onCategoryChange={onCategoryChange}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
        />
      </main>

      <PaymentRoot
        supportOpen={openSupport}
        onCloseSupport={() => setOpenSupport(false)}
      />
    </div>
  );
}