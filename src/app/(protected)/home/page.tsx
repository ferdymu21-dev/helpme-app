"use client";

import { useEffect, useState } from "react";

import { supabase }
  from "@/lib/supabase/client";

import {
  getTasks,
  expireTasks,
} from "@/features/tasks/services/task.service";

import MobileHomeView from "@/components/home/mobile/MobileHomeView";

import DesktopHomeView from "@/components/home/desktop/DesktopHomeView";

interface Task {
  id: string;
  title: string;
  category: string;
  budget: number;
  address: string;
  status: string;
}

export default function HomePage() {
  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function loadTasks() {

      try {

        await expireTasks();

        const data =
          await getTasks();

        setTasks(data || []);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    }

    loadTasks();

    /* =========================
       REALTIME TASKS
    ========================= */

    const channel =
      supabase.channel(
        "home-tasks-realtime"
      );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tasks",
      },
      () => {

        loadTasks();
      }
    );

    channel.subscribe();

    return () => {

      supabase.removeChannel(
        channel
      );
    };

  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        Memuat task...
      </main>
    );
  }

  return (
    <>
      <MobileHomeView tasks={tasks} />

      <DesktopHomeView tasks={tasks} />
    </>
  );
}