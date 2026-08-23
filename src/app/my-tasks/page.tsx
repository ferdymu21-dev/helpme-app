"use client";

import { useEffect, useMemo, useState } from "react";

import MobileMyTasksView from "@/components/my-tasks/mobile/MobileMyTasksView";
import DesktopMyTasksView from "@/components/my-tasks/desktop/DesktopMyTasksView";

import { getMyTasks } from "@/features/tasks/services/client/task.client";

interface Task {
  id: string;
  title: string;
  category: string;
  budget: number;
  address: string;
  status: string;
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getMyTasks();

        setTasks(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  /* =========================
     FILTERED TASK LIST
  ========================= */

  const filteredTasks = useMemo(() => {
    if (activeFilter === "ALL") {
      return tasks;
    }

    return tasks.filter((task) => task.status === activeFilter);
  }, [tasks, activeFilter]);

  /* =========================
     TASK STATISTICS
  ========================= */

  const openCount = tasks.filter(
    (task) => task.status === "OPEN",
  ).length;

  const acceptedCount = tasks.filter(
    (task) => task.status === "ACCEPTED",
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "COMPLETED",
  ).length;

  return (
    <>
      <MobileMyTasksView
        tasks={filteredTasks}
        loading={loading}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        openCount={openCount}
        acceptedCount={acceptedCount}
        completedCount={completedCount}
      />

      <DesktopMyTasksView
        tasks={filteredTasks}
        loading={loading}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        openCount={openCount}
        acceptedCount={acceptedCount}
        completedCount={completedCount}
      />
    </>
  );
}