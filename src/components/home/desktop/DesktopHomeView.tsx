import DesktopHomeHeader from "@/components/layout/desktop/DesktopHomeHeader";

import DesktopGreetingSection from "@/components/home/desktop/DesktopGreetingSection";

import DesktopQuickActions from "@/components/home/desktop/DesktopQuickActions";

import DesktopTipsBanner
from "@/components/home/desktop/DesktopTipsBanner";

import DesktopAdsBanner
from "@/components/home/desktop/DesktopAdsBanner";

import DesktopTaskFeed from "@/components/home/desktop/DesktopTaskFeed";

import DesktopSidebar from "@/components/layout/desktop/DesktopSidebar";

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

export default function DesktopHomeView({
  tasks,
}: Props) {
  return (
    <div className="hidden lg:block">

      <DesktopSidebar />

      <main className="min-h-screen bg-slate-50 pl-70">

         <DesktopHomeHeader />
    
        <DesktopQuickActions />

        <DesktopTipsBanner />

        <DesktopTaskFeed tasks={tasks} />

      </main>

    </div>
  );
}