"use client";

import type { NearbyTask } from "@/features/tasks/types/nearby-task";

import MobileHomeHeader from "@/components/layout/mobile/MobileHomeHeader";

import MobileGreetingSection from "@/components/home/mobile/MobileGreetingSection";

import MobileAdsBanner from "@/components/home/mobile/MobileAdsBanner";

import MobileQuickActions from "@/components/home/mobile/MobileQuickActions";

import MobileTaskFeed from "@/components/home/mobile/MobileTaskFeed";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

import MobilePendingPaymentCard from "@/components/home/mobile/MobilePendingPaymentCard";

import type { PendingPaymentSummary } from "@/features/payments/types/pendingPayment";

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

export default function MobileHomeView({
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
    <div className="min-h-screen bg-slate-50 pb-32 lg:hidden">
      <MobileHomeHeader onOpenSupport={onOpenSupport} />

      {pendingPaymentLoading ? (
        <div className="px-4 pt-4">
          <div
            className="h-36 animate-pulse rounded-3xl border border-slate-200 bg-white"
          />
        </div>
      ) : pendingPayment ? (
        <MobilePendingPaymentCard
          payment={pendingPayment}
          loading={resumePaymentLoading}
          onResume={onResumePayment}
        />
      ) : (
        <MobileGreetingSection />
      )}

      <MobileQuickActions />

      <MobileAdsBanner />

      <MobileTaskFeed
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

      <MobileBottomNavbar />
    </div>
  );
}