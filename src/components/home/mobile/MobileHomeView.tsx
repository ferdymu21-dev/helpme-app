"use client";

import { useState } from "react";

import type { NearbyTask } from "@/features/tasks/types/nearby-task";

import MobileHomeHeader from "@/components/layout/mobile/MobileHomeHeader";

import MobileGreetingSection from "@/components/home/mobile/MobileGreetingSection";

import MobileAdsBanner from "@/components/home/mobile/MobileAdsBanner";

import MobileQuickActions from "@/components/home/mobile/MobileQuickActions";

import MobileTaskFeed from "@/components/home/mobile/MobileTaskFeed";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

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

export default function MobileHomeView({
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
    <div className="pb-32 lg:hidden">
      <MobileHomeHeader onOpenSupport={() => setOpenSupport(true)} />

      <MobileGreetingSection />

      <MobileQuickActions />

      <MobileAdsBanner />

      <MobileTaskFeed
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

      <MobileBottomNavbar />

      <PaymentRoot
        supportOpen={openSupport}
        onCloseSupport={() => setOpenSupport(false)}
      />
    </div>
  );
}