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

type TaskFilter =
  | "ALL"
  | "OPEN"
  | "ACCEPTED"
  | "WAITING_CONFIRMATION"
  | "COMPLETED";

const WORKING_STATUSES = ["ACCEPTED", "ON_PROGRESS"];

const FINISHED_STATUSES = ["COMPLETED", "EXPIRED"];

function isWorkingStatus(status: string) {
  return WORKING_STATUSES.includes(status);
}

function isFinishedStatus(
  status: string,
) {
  return FINISHED_STATUSES.includes(
    status,
  );
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState<TaskFilter>("ALL");

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getMyTasks();

        setTasks(data || []);
      } catch (error) {
        console.error("Gagal memuat task Owner:", error);
      } finally {
        setLoading(false);
      }
    }

    void loadTasks();
  }, []);

  /* =========================
     FILTERED TASK LIST
  ========================= */
  const filteredTasks = useMemo(() => {
    if (activeFilter === "ALL") {
      return tasks;
    }

    if (activeFilter === "ACCEPTED") {
      return tasks.filter((task) => isWorkingStatus(task.status));
    }

    if (activeFilter === "COMPLETED") {
      return tasks.filter((task) => isFinishedStatus(task.status,),);
    }
   
    return tasks.filter((task) => task.status === activeFilter);
  }, [tasks, activeFilter]);

  /* =========================
     TASK STATISTICS
  ========================= */
  const openCount = tasks.filter((task) => task.status === "OPEN").length;

  const acceptedCount = tasks.filter((task) =>
    isWorkingStatus(task.status),
  ).length;

  const waitingConfirmationCount = tasks.filter(
    (task) => task.status === "WAITING_CONFIRMATION",
  ).length;

  const completedCount =
  tasks.filter(
    (task) =>
      isFinishedStatus(
        task.status,
      ),
  ).length;

  /* =========================
     FILTER HANDLER
  ========================= */

  function handleFilterChange(value: string) {
    if (
      value === "ALL" ||
      value === "OPEN" ||
      value === "ACCEPTED" ||
      value === "WAITING_CONFIRMATION" ||
      value === "COMPLETED"
    ) {
      setActiveFilter(value);
    }
  }

  const viewProps = {
    tasks: filteredTasks,
    loading,
    activeFilter,
    setActiveFilter: handleFilterChange,
    openCount,
    acceptedCount,
    waitingConfirmationCount,
    completedCount,
  };

  return (
    <>
      <MobileMyTasksView {...viewProps} />

      <DesktopMyTasksView {...viewProps} />
    </>
  );
}