"use client";

import MobileHomeHeader from "@/components/layout/mobile/MobileHomeHeader";

import { useState } from "react";

import MobileGreetingSection from "@/components/home/mobile/MobileGreetingSection";

import MobileAdsBanner from "@/components/home/mobile/MobileAdsBanner";

import MobileQuickActions from "@/components/home/mobile/MobileQuickActions";

import MobileTaskFeed from "@/components/home/mobile/MobileTaskFeed";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

import PaymentRoot from "@/features/payments/components/PaymentRoot";

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

export default function MobileHomeView({ tasks }: Props) {
  const [openSupport, setOpenSupport] = useState(false);

  return (
    <div className="pb-32 lg:hidden">
      <MobileHomeHeader onOpenSupport={() => setOpenSupport(true)} />

      <MobileGreetingSection />

      <MobileQuickActions />

      <MobileAdsBanner />

      <MobileTaskFeed tasks={tasks} />

      <MobileBottomNavbar />

      <PaymentRoot
        supportOpen={openSupport}
        onCloseSupport={() => setOpenSupport(false)}
      />
    </div>
  );
}