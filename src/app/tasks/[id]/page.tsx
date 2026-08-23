"use client";

import MobileTaskDetailView from "@/components/tasks/mobile/MobileTaskDetailView";

import DesktopTaskDetailView from "@/components/tasks/desktop/DesktopTaskDetailView";

import { useCallback, useEffect, useState } from "react";

import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

import { completeTask, confirmTaskCompletion } from "@/features/tasks/services";

import {
  acceptHelper,
  applyTask,
  cancelTask,
  getTaskApplications,
  getTaskById,
  expireTasks,
} from "@/features/tasks/services/task.service";

import { getUserReputation } from "@/features/profile/services/reputation.service";

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
  completion_proof_photo?: string;
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}

export default function TaskDetailPage() {
  const params = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [acceptingHelperId, setAcceptingHelperId] = useState<string | null>(
  null,
);
  const [applications, setApplications] = useState<Applicant[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [hasApplied, setHasApplied] = useState(false);

  const loadCurrentUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id || "");
  }, []);

  const loadTask = useCallback(async () => {
    await expireTasks();

    const data = await getTaskById(params.id as string);

    setTask(data);
  }, [params.id]);

  const loadApplications = useCallback(async () => {
    const data = await getTaskApplications(params.id as string);

    /* =========================
       LOAD REPUTATION
    ========================= */

    const applicationsWithReputation = await Promise.all(
      (data || []).map(async (application) => {
        if (!application.helper) {
          return application;
        }

        const reputation = await getUserReputation(application.helper.id);

        return {
          ...application,
          reputation,
        };
      }),
    );

    setApplications(applicationsWithReputation);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const alreadyApplied = data?.some(
      (application) => application.helper_id === user.id,
    );

    setHasApplied(!!alreadyApplied);
  }, [params.id]);

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
  }, [loadCurrentUser, loadTask, loadApplications]);

  async function handleApplyTask() {
    try {
      setApplying(true);

      await applyTask(params.id as string);

      alert("Berhasil melamar task");

      await loadApplications();
    } catch (error: unknown) {
      const message = getErrorMessage(error);

      if (
        message === "Kamu sudah melamar task ini" ||
        message === "Tidak bisa melamar task sendiri" ||
        message === "Task sudah tidak tersedia"
      ) {
        alert(message);

        return;
      }

      console.error(error);

      alert("Terjadi kesalahan");
    } finally {
      setApplying(false);
    }
  }

  async function handleAcceptHelper(helperId: string) {
    if (!task) return;

    try {
      setAcceptingHelperId(helperId);

      await acceptHelper(task.id, helperId);

      alert("Helper berhasil diterima");

      await loadTask();

      await loadApplications();
    } catch (error) {
      console.error(error);

      alert("Gagal menerima helper");
    } finally {
      setAcceptingHelperId(null);
    }
  }

  async function handleCompleteTask(proofUrl: string) {
    if (!task) return;

    try {
      await completeTask(task.id, proofUrl);

      alert(
        "Bukti penyelesaian berhasil dikirim. Menunggu konfirmasi dari pemilik task.",
      );

      await loadTask();
    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan");

      throw error;
    }
  }

  async function handleCancelTask() {
    if (!task) return;

    const confirmCancel = window.confirm("Yakin ingin membatalkan task?");

    if (!confirmCancel) {
      return;
    }

    try {
      await cancelTask(task.id);

      alert("Task berhasil dibatalkan");

      await loadTask();
    } catch (error) {
      console.error(error);

      alert("Gagal membatalkan task");
    }
  }

  if (loading) {
    return <div className="p-6">Memuat task...</div>;
  }

  if (!task) {
    return <div className="p-6">Task tidak ditemukan</div>;
  }

  async function handleConfirmCompletion() {
  if (!task) return;

  try {
    await confirmTaskCompletion(task.id);

    alert("Task berhasil dikonfirmasi.");

    window.location.href = `/review/${task.id}`;
  } catch (error) {
    console.error(error);

    alert("Gagal mengonfirmasi task.");
  }
}

  return (
    <>
      <MobileTaskDetailView
        task={task}
        applications={applications}
        currentUserId={currentUserId}
        hasApplied={hasApplied}
        applying={applying}
        acceptingHelperId={acceptingHelperId}
        handleApplyTask={handleApplyTask}
        handleAcceptHelper={handleAcceptHelper}
        handleCompleteTask={handleCompleteTask}
        handleCancelTask={handleCancelTask}
        handleConfirmCompletion={handleConfirmCompletion}
      />

      <DesktopTaskDetailView
        task={task}
        applications={applications}
        currentUserId={currentUserId}
        hasApplied={hasApplied}
        applying={applying}
        acceptingHelperId={acceptingHelperId}
        handleApplyTask={handleApplyTask}
        handleAcceptHelper={handleAcceptHelper}
        handleCompleteTask={handleCompleteTask}
        handleConfirmCompletion={handleConfirmCompletion}
        handleCancelTask={handleCancelTask}
      />
    </>
  );
}