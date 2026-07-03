"use client";

import MobileHomeHeader from "@/components/layout/mobile/MobileHomeHeader";

import {
  useState,
} from "react";

import MobileGreetingSection from "@/components/home/mobile/MobileGreetingSection";

import MobileQuickActions from "@/components/home/mobile/MobileQuickActions";

import MobileAdsBanner
  from "@/components/home/mobile/MobileAdsBanner";

import MobileTipsBanner
  from "@/components/home/mobile/MobileTipsBanner";

import MobileTaskFeed from "@/components/home/mobile/MobileTaskFeed";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

import SupportModal from "@/features/payments/components/SupportModal";

interface Task {
  id: string;
  title: string;
  category: string;
  budget: number;
  address: string;
  status: string;
}

interface Props {
  tasks: Task[];
}

export default function MobileHomeView({
  tasks,
}: Props) {

  const [
    openSupport,
    setOpenSupport,
  ]
    =
    useState(
      false

    );

  return (
    <div className="pb-32 lg:hidden">

      <MobileHomeHeader
        onOpenSupport={() =>
          setOpenSupport(
            true
          )
        }
      />

      <MobileGreetingSection />

      <MobileQuickActions />

      <MobileTipsBanner />

      <MobileTaskFeed tasks={tasks} />

      <MobileBottomNavbar />

      <SupportModal

        open={openSupport}
        onClose={() =>
          setOpenSupport(
            false
          )
        }
      />

    </div>
  );
}