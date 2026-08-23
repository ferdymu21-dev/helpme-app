"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import MobileHelperTasksView from "@/components/helper-tasks/mobile/MobileHelperTasksView";
import DesktopHelperTasksView from "@/components/helper-tasks/desktop/DesktopHelperTasksView";

import { getHelperTasks } from "@/features/tasks/services/client/task.client";

interface Task {
  id: string;
  title: string;
  category: string;
  budget: number;
  status: string;

  location_type?: string;
  location_name?: string;
  manual_address?: string;

  latitude?: number;
  longitude?: number;

  owner_latitude?: number;
  owner_longitude?: number;

  scheduled_at?: string | null;
  is_urgent?: boolean;
}

type TaskFilter =
  | "ALL"
  | "OPEN"
  | "ACCEPTED"
  | "WAITING_CONFIRMATION"
  | "COMPLETED";

const WORKING_STATUSES = [
  "ACCEPTED",
  "ON_PROGRESS",
];

function isWorkingStatus(
  status: string,
) {
  return WORKING_STATUSES.includes(
    status,
  );
}

export default function HelperTasksPage() {
  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<TaskFilter>("ALL");

  useEffect(() => {
    async function loadTasks() {
      try {
        const data =
          await getHelperTasks();

        const normalizedTasks: Task[] =
          data.map((task) => ({
            id: task.id,
            title: task.title,

            category:
              task.category ?? "",

            budget:
              task.budget ?? 0,

            status:
              task.status,

            location_type:
              task.location_type ??
              undefined,

            location_name:
              task.location_name ??
              undefined,

            manual_address:
              task.manual_address ??
              undefined,

            latitude:
              task.latitude ??
              undefined,

            longitude:
              task.longitude ??
              undefined,

            owner_latitude:
              task.owner_latitude ??
              undefined,

            owner_longitude:
              task.owner_longitude ??
              undefined,

            scheduled_at:
              task.scheduled_at ??
              null,

            is_urgent:
              task.is_urgent ??
              false,
          }));

        setTasks(
          normalizedTasks,
        );
      } catch (error) {
        console.error(
          "Gagal memuat helper tasks:",
          error,
        );

        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    void loadTasks();
  }, []);

  const filteredTasks =
    useMemo(() => {
      if (
        activeFilter === "ALL"
      ) {
        return tasks;
      }

      if (
        activeFilter ===
        "ACCEPTED"
      ) {
        return tasks.filter(
          (task) =>
            isWorkingStatus(
              task.status,
            ),
        );
      }

      return tasks.filter(
        (task) =>
          task.status ===
          activeFilter,
      );
    }, [
      tasks,
      activeFilter,
    ]);

  /*
   * Counter selalu dihitung dari
   * seluruh tasks, bukan filteredTasks.
   */
  const appliedCount =
    tasks.filter(
      (task) =>
        task.status === "OPEN",
    ).length;

  const acceptedCount =
    tasks.filter((task) =>
      isWorkingStatus(
        task.status,
      ),
    ).length;

  const waitingConfirmationCount =
  tasks.filter(
    (task) =>
      task.status ===
      "WAITING_CONFIRMATION",
  ).length;

  const completedCount =
    tasks.filter(
      (task) =>
        task.status ===
        "COMPLETED",
    ).length;

  const handleFilterChange = (
    value: string,
  ) => {
    if (
      value === "ALL" ||
      value === "OPEN" ||
      value === "ACCEPTED" ||
      value === "WAITING_CONFIRMATION" ||
      value === "COMPLETED"
    ) {
      setActiveFilter(value);
    }
  };

  const viewProps = {
    tasks: filteredTasks,
    loading,
    activeFilter,

    setActiveFilter:
      handleFilterChange,

    appliedCount,
    acceptedCount,
    waitingConfirmationCount,
    completedCount,
  };

  return (
    <>
      <MobileHelperTasksView
        {...viewProps}
      />

      <DesktopHelperTasksView
        {...viewProps}
      />
    </>
  );
}