"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import MobileHelperTasksView from "@/components/helper-tasks/mobile/MobileHelperTasksView";

import DesktopHelperTasksView from "@/components/helper-tasks/desktop/DesktopHelperTasksView";

import {
  getHelperTasks,
} from "@/features/tasks/services/task.service";

interface Task {
  id: string;
  title: string;
  category: string;
  budget: number;
  address: string;
  status: string;
}

const filters = [
  "ALL",
  "OPEN",
  "ACCEPTED",
  "COMPLETED",
];

export default function HelperTasksPage() {
  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [activeFilter, setActiveFilter] =
    useState("ALL");

  useEffect(() => {
    async function loadTasks() {
      try {
        const data =
          await getHelperTasks();

        setTasks(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    if (activeFilter === "ALL") {
      return tasks;
    }

    return tasks.filter(
      (task) =>
        task.status === activeFilter
    );
  }, [tasks, activeFilter]);

  const appliedCount =
    tasks.filter(
      (task) =>
        task.status === "OPEN"
    ).length;

  const acceptedCount =
    tasks.filter(
      (task) =>
        task.status === "ACCEPTED"
    ).length;

  const completedCount =
    tasks.filter(
      (task) =>
        task.status === "COMPLETED"
    ).length;

  return (
  <>
    <MobileHelperTasksView
      tasks={filteredTasks}
      loading={loading}
      activeFilter={activeFilter}
      setActiveFilter={
        setActiveFilter
      }
      filters={filters}
    />

    <DesktopHelperTasksView
      tasks={filteredTasks}
      loading={loading}
      activeFilter={activeFilter}
      setActiveFilter={
        setActiveFilter
      }
      filters={filters}
    />
  </>
);
}