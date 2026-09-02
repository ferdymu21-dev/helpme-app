"use client";

import type { NearbyTask } from "@/features/tasks/types/nearby-task";

import type { PendingPaymentSummary } from "@/features/payments/types/pendingPayment";

import DesktopHomeHeader from "@/components/layout/desktop/DesktopHomeHeader";

import DesktopQuickActions from "@/components/home/desktop/DesktopQuickActions";

import DesktopAdsBanner from "@/components/home/desktop/DesktopAdsBanner";

import DesktopTaskFeed from "@/components/home/desktop/DesktopTaskFeed";

import DesktopSidebar from "@/components/layout/desktop/DesktopSidebar";

interface Props {
  tasks: NearbyTask[];

  loadingTasks: boolean;

  locationError: string | null;

  activeCategory: string;

  searchValue: string;

  currentPage: number;

  totalPages: number;

  onCategoryChange: (category: string) => void;

  onSearchChange: (value: string) => void;

  onPreviousPage: () => void;

  onNextPage: () => void;

  pendingPayment: PendingPaymentSummary | null;

  pendingPaymentLoading: boolean;

  resumePaymentLoading: boolean;

  onOpenSupport: () => void;

  onResumePayment: () => void;
}

export default function DesktopHomeView({
  tasks,
  loadingTasks,
  locationError,
  activeCategory,
  searchValue,
  currentPage,
  totalPages,
  onCategoryChange,
  onSearchChange,
  onPreviousPage,
  onNextPage,
  pendingPayment,
  pendingPaymentLoading,
  resumePaymentLoading,
  onOpenSupport,
  onResumePayment,
}: Props) {
  return (
    <div className="hidden lg:block">
      <DesktopSidebar
        onOpenSupport={onOpenSupport}
      />

      <main className="min-h-screen bg-slate-50 pl-70">
        <DesktopHomeHeader
          pendingPayment={pendingPayment}
          pendingPaymentLoading={pendingPaymentLoading}
          resumePaymentLoading={resumePaymentLoading}
          onResumePayment={onResumePayment}
        />

        <DesktopQuickActions />

        <DesktopAdsBanner />

        <DesktopTaskFeed
          tasks={tasks}
          loadingTasks={loadingTasks}
          locationError={locationError}
          activeCategory={activeCategory}
          searchValue={searchValue}
          currentPage={currentPage}
          totalPages={totalPages}
          onCategoryChange={onCategoryChange}
          onSearchChange={onSearchChange}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
        />
      </main>
    </div>
  );
}