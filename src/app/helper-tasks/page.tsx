"use client";

import { useEffect, useMemo, useState } from "react";

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
}

const filters = ["ALL", "OPEN", "ACCEPTED", "COMPLETED"];

export default function HelperTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getHelperTasks();

        const normalizedTasks: Task[] = data.map((task) => ({
          id: task.id,
          title: task.title,
          category: task.category ?? "",
          budget: task.budget ?? 0,
          status: task.status,

          location_type:
            task.location_type ?? undefined,

          location_name:
            task.location_name ?? undefined,

          manual_address:
            task.manual_address ?? undefined,

          latitude:
            task.latitude ?? undefined,

          longitude:
            task.longitude ?? undefined,

          owner_latitude:
            task.owner_latitude ?? undefined,

          owner_longitude:
            task.owner_longitude ?? undefined,
        }));

        setTasks(normalizedTasks);
      } catch (error) {
        console.error(error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    void loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    if (activeFilter === "ALL") {
      return tasks;
    }

    return tasks.filter(
      (task) => task.status === activeFilter,
    );
  }, [tasks, activeFilter]);

  const appliedCount = tasks.filter(
    (task) => task.status === "OPEN",
  ).length;

  const acceptedCount = tasks.filter(
    (task) => task.status === "ACCEPTED",
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "COMPLETED",
  ).length;

  void appliedCount;
  void acceptedCount;
  void completedCount;

  return (
    <>
      <MobileHelperTasksView
        tasks={filteredTasks}
        loading={loading}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        filters={filters}
      />

      <DesktopHelperTasksView
        tasks={filteredTasks}
        loading={loading}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        filters={filters}
      />
    </>
  );
}