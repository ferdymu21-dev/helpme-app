"use client";

import MobileTaskDetailView
  from "@/components/tasks/mobile/MobileTaskDetailView";

import DesktopTaskDetailView
  from "@/components/tasks/desktop/DesktopTaskDetailView";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import Link from "next/link";

import { supabase } from "@/lib/supabase/client";

import {
  acceptHelper,
  applyTask,
  cancelTask,
  getConversationByTask,
  getTaskApplications,
  getTaskById,
  expireTasks,
} from "@/features/tasks/services/task.service";

import {
  getUserReputation,
} from "@/features/profile/services/reputation.service";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location_type?: string;

  location_name?: string;

  manual_address?: string;

  latitude?: number;

  longitude?: number;

  owner_latitude?: number;

  owner_longitude?: number;
  users?: {
    id: string;

    full_name: string;

    verification_status?: string;
  };

  status: string;
  created_at: string;
  user_id: string;
  selected_helper_id: string | null;
}

interface Applicant {
  id: string;
  helper_id: string;
  status: string;
  created_at: string;

  helper: {
    id: string;
    full_name: string;
  } | null;

  reputation?: {
    rating: string;
    totalReviews: number;
    completedTasks: number;
  };
}

export default function TaskDetailPage() {

  const params = useParams();

  const [task, setTask] =
    useState<Task | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [applying, setApplying] =
    useState(false);

  const [accepting, setAccepting] =
    useState(false);

  const [applications, setApplications] =
    useState<Applicant[]>([]);

  const [currentUserId, setCurrentUserId] =
    useState("");

  const [hasApplied, setHasApplied] =
    useState(false);

  async function loadCurrentUser() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(
      user?.id || ""
    );
  }

  async function loadTask() {

  await expireTasks();

  const data =
    await getTaskById(
      params.id as string
    );

  setTask(data);
}

  async function loadApplications() {

    const data =
      await getTaskApplications(
        params.id as string
      );

    /* =========================
       LOAD REPUTATION
    ========================= */

    const applicationsWithReputation =
      await Promise.all(

        (data || []).map(
          async (application) => {

            if (!application.helper) {
              return application;
            }

            const reputation =
              await getUserReputation(
                application.helper.id
              );

            return {
              ...application,
              reputation,
            };
          }
        )
      );

    setApplications(
      applicationsWithReputation
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const alreadyApplied =
      data?.some(
        (application) =>
          application.helper_id ===
          user.id
      );

    setHasApplied(
      !!alreadyApplied
    );
  }

  useEffect(() => {

    async function init() {

      try {

        await loadCurrentUser();

        await loadTask();

        await loadApplications();

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    }

    init();

  }, [params.id]);

  async function handleApplyTask() {

    try {

      setApplying(true);

      await applyTask(
        params.id as string
      );

      alert(
        "Berhasil melamar task"
      );

      await loadApplications();

    } catch (error: any) {

      if (
        error.message ===
        "Kamu sudah melamar task ini" ||
        error.message ===
        "Tidak bisa melamar task sendiri" ||
        error.message ===
        "Task sudah tidak tersedia"
      ) {

        alert(error.message);

        return;
      }

      console.error(error);

      alert(
        "Terjadi kesalahan"
      );

    } finally {

      setApplying(false);
    }
  }

  async function handleAcceptHelper(
    helperId: string
  ) {

    if (!task) return;

    try {

      setAccepting(true);

      await acceptHelper(
        task.id,
        helperId
      );

      alert(
        "Helper berhasil diterima"
      );

      await loadTask();

      await loadApplications();

    } catch (error) {

      console.error(error);

      alert(
        "Gagal menerima helper"
      );

    } finally {

      setAccepting(false);
    }
  }

  async function handleCompleteTask() {

    if (!task) return;

    try {

      const { error } =
        await supabase
          .from("tasks")
          .update({
            status: "COMPLETED",
          })
          .eq("id", task.id);

      if (error) {

        console.error(error);

        alert(
          "Gagal menyelesaikan task"
        );

        return;
      }

      alert(
        "Task berhasil diselesaikan!"
      );

      window.location.href =
        `/review/${task.id}`;

      await loadTask();

    } catch (error) {

      console.error(error);

      alert(
        "Terjadi kesalahan"
      );
    }
  }

  async function handleCancelTask() {

  if (!task) return;

  const confirmCancel =
    window.confirm(
      "Yakin ingin membatalkan task?"
    );

  if (!confirmCancel) {
    return;
  }

  try {

    await cancelTask(
      task.id
    );

    alert(
      "Task berhasil dibatalkan"
    );

    await loadTask();

  } catch (error) {

    console.error(error);

    alert(
      "Gagal membatalkan task"
    );
  }
}

  if (loading) {
    return (
      <div className="p-6">
        Memuat task...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6">
        Task tidak ditemukan
      </div>
    );
  }

  const isOwner =
    currentUserId === task.user_id;

  const alreadyApplied =
    hasApplied;

  const isSelectedHelper =
    currentUserId ===
    task.selected_helper_id;

  const canAccessChat =
    isOwner ||
    isSelectedHelper;

  return (
    <>

      <MobileTaskDetailView
        task={task}
        applications={applications}
        currentUserId={currentUserId}
        hasApplied={hasApplied}
        applying={applying}
        accepting={accepting}
        handleApplyTask={handleApplyTask}
        handleAcceptHelper={handleAcceptHelper}
        handleCompleteTask={handleCompleteTask}
        handleCancelTask={handleCancelTask}
      />

      <DesktopTaskDetailView
        task={task}
        applications={applications}
        currentUserId={currentUserId}
        hasApplied={hasApplied}
        applying={applying}
        accepting={accepting}
        handleApplyTask={handleApplyTask}
        handleAcceptHelper={handleAcceptHelper}
        handleCompleteTask={handleCompleteTask}
        handleCancelTask={handleCancelTask}
      />

    </>
  );
}