"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getTaskHistory,
  getHelperHistory,
} from "@/features/tasks/services/client/task.client";

import type {
  HistoryTask,
  HistoryTaskStatus,
} from "@/features/tasks/types/history";

import MobileHistoryView from "@/components/history/mobile/MobileHistoryView";
import DesktopHistoryView from "@/components/history/desktop/DesktopHistoryView";

function normalizeHelperHistoryTask(task: {
  id: string;
  title: string;
  category: string | null;
  budget: number | null;
  status: string;
  created_at: string;
}): HistoryTask | null {
  const validStatuses: HistoryTaskStatus[] = [
    "COMPLETED",
    "CANCELLED",
    "EXPIRED",
  ];

  if (!validStatuses.includes(task.status as HistoryTaskStatus)) {
    return null;
  }

  return {
    id: task.id,
    title: task.title,
    category: task.category,
    budget: task.budget,
    status: task.status as HistoryTaskStatus,
    created_at: task.created_at,
  };
}

export default function HistoryPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<"OWNER" | "HELPER">("OWNER");

  const [tasks, setTasks] =
    useState<HistoryTask[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        setLoading(true);

        if (activeTab === "OWNER") {
          const data = await getTaskHistory();

          if (!cancelled) {
            setTasks(data);
          }

          return;
        }

        const data = await getHelperHistory();

        const normalizedTasks: HistoryTask[] = [];

        for (const task of data) {
          const normalizedTask =
            normalizeHelperHistoryTask(task);

          if (normalizedTask) {
            normalizedTasks.push(normalizedTask);
          }
        }

        if (!cancelled) {
          setTasks(normalizedTasks);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setTasks([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
    };
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