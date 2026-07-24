"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  getTaskHistory,
  getHelperHistory,
} from "@/features/tasks/services/client/task.service";

import MobileHistoryView
  from "@/components/history/mobile/MobileHistoryView";

import DesktopHistoryView
  from "@/components/history/desktop/DesktopHistoryView";

export default function HistoryPage() {

  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<
      "OWNER" | "HELPER"
    >("OWNER");

  const [tasks, setTasks] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function loadHistory() {

    try {

      setLoading(true);

      const data =
        activeTab === "OWNER"
          ? await getTaskHistory()
          : await getHelperHistory();

      setTasks(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {

    loadHistory();

  }, [activeTab]);

  return (

  <>

    <MobileHistoryView
      tasks={tasks}
      loading={loading}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      router={router}
    />

    <DesktopHistoryView
      tasks={tasks}
      loading={loading}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      router={router}
    />

  </>

);

}