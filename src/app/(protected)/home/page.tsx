"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

import { getTasks } from "@/features/tasks/services/client/task.client";

import type { NearbyTask } from "@/features/tasks/types/nearby-task";

import MobileHomeView from "@/components/home/mobile/MobileHomeView";

import DesktopHomeView from "@/components/home/desktop/DesktopHomeView";

import PaymentRoot from "@/features/payments/components/PaymentRoot";

import PaymentResultDialog from "@/features/payments/components/dialog/PaymentResultDialog";

import { usePendingPayment } from "@/features/payments/hooks/usePendingPayment";

import { useResumePaymentFlow } from "@/features/payments/hooks/useResumePaymentFlow";

const PAGE_SIZE = 10;

interface Coordinates {
  latitude: number;
  longitude: number;
}

function getLocationErrorMessage(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Bagikan lokasi kamu untuk melihat task di sekitar.";

    case error.POSITION_UNAVAILABLE:
      return "Lokasi kamu belum dapat ditemukan.";

    case error.TIMEOUT:
      return "Pengambilan lokasi terlalu lama. Coba lagi.";

    default:
      return "Lokasi kamu tidak dapat digunakan saat ini.";
  }
}

export default function HomePage() {
  const router = useRouter();

  const [openSupport, setOpenSupport] = useState(false);

  const pendingPayment = usePendingPayment();

  const resumePayment = useResumePaymentFlow({
    onPaymentSettled: pendingPayment.refresh,
  });

  const [tasks, setTasks] = useState<NearbyTask[]>([]);

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  const [locating, setLocating] = useState(true);

  const [loadingTasks, setLoadingTasks] = useState(true);

  const [locationError, setLocationError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState("Semua");

  const [searchInput, setSearchInput] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const requestIdRef = useRef(0);

  const searchDebounceRef = useRef<number | null>(null);

  /* =========================
   GET HELPER LOCATION
  ========================= */
  useEffect(() => {
    if (!navigator.geolocation) {
      /*
       * Gunakan callback browser agar
       * state tidak diubah secara sinkron
       * langsung dari body effect.
       */
      const timeoutId = window.setTimeout(() => {
        setLocationError("Browser ini tidak mendukung akses lokasi.");

        setLocating(false);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,

          longitude: position.coords.longitude,
        });

        setLocationError(null);

        setLocating(false);
      },

      (error) => {
        setCoordinates(null);

        setLocationError(getLocationErrorMessage(error));

        setLocating(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 60_000,
      },
    );
  }, []);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current !== null) {
        window.clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  /* =========================
   LOAD TASKS
  ========================= */
  const urgentOnly = activeCategory === "Mendesak";

  const queryCategory = urgentOnly ? "Semua" : activeCategory;

  useEffect(() => {
    if (!coordinates) {
      return;
    }

    const requestId = ++requestIdRef.current;

    let cancelled = false;

    void getTasks({
      latitude: coordinates.latitude,

      longitude: coordinates.longitude,

      page: currentPage,

      pageSize: PAGE_SIZE,

      category: queryCategory,

      search: searchQuery,

      urgentOnly,
    })
      .then((result) => {
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        /*
         * Kalau page terakhir menjadi kosong,
         * kembali satu halaman.
         */
        if (result.tasks.length === 0 && currentPage > 1) {
          setCurrentPage((page) => Math.max(1, page - 1));

          return;
        }

        setTasks(result.tasks);

        setTotalPages(result.totalPages);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("Gagal memuat nearby tasks:", error);
      })
      .finally(() => {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoadingTasks(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [coordinates, currentPage, queryCategory, searchQuery, urgentOnly]);

  /* =========================
   REALTIME TASKS
  ========================= */
  useEffect(() => {
    if (!coordinates) {
      return;
    }

    const channel = supabase.channel("home-tasks-realtime");

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tasks",
      },
      () => {
        const requestId = ++requestIdRef.current;

        void getTasks({
          latitude: coordinates.latitude,

          longitude: coordinates.longitude,

          page: currentPage,

          pageSize: PAGE_SIZE,

          category: queryCategory,

          search: searchQuery,

          urgentOnly,
        })
          .then((result) => {
            if (requestId !== requestIdRef.current) {
              return;
            }

            /*
             * Contoh:
             * task pada page terakhir EXPIRED,
             * sehingga page tersebut kosong.
             */
            if (result.tasks.length === 0 && currentPage > 1) {
              setCurrentPage((page) => Math.max(1, page - 1));

              return;
            }

            setTasks(result.tasks);

            setTotalPages(result.totalPages);
          })
          .catch((error) => {
            console.error("Gagal refresh nearby tasks dari Realtime:", error);
          })
          .finally(() => {
            if (requestId === requestIdRef.current) {
              setLoadingTasks(false);
            }
          });
      },
    );

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [coordinates, currentPage, queryCategory, searchQuery, urgentOnly]);

  /* =========================
     CATEGORY
  ========================= */

  function handleCategoryChange(category: string) {
    if (category === activeCategory) {
      return;
    }

    setLoadingTasks(true);

    setCurrentPage(1);

    setActiveCategory(category);
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);

    if (searchDebounceRef.current !== null) {
      window.clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = window.setTimeout(() => {
      const nextSearch = value.trim();

      if (nextSearch === searchQuery) {
        return;
      }

      setCurrentPage(1);

      setLoadingTasks(true);

      setSearchQuery(nextSearch);
    }, 350);
  }

  /* =========================
     PAYMENT RESUME
  ========================= */

  function handleResumePayment() {
    const payment = pendingPayment.payment;

    if (!payment) {
      return;
    }

    void resumePayment.resumePayment(payment.orderId).catch((error) => {
      console.error("Gagal melanjutkan pembayaran:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal melanjutkan pembayaran.",
      );

      /*
       * Bisa saja transaksi berubah
       * menjadi PAID / EXPIRED tepat
       * sebelum user menekan card.
       *
       * Refresh agar card Home mengikuti
       * status server terbaru.
       */
      void pendingPayment.refresh();
    });
  }

  /* =========================
     PAGINATION
  ========================= */

  function handlePreviousPage() {
    if (currentPage <= 1) {
      return;
    }

    setLoadingTasks(true);

    setCurrentPage((page) => Math.max(1, page - 1));
  }

  function handleNextPage() {
    if (currentPage >= totalPages) {
      return;
    }

    setLoadingTasks(true);

    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }

  /* =========================
     LOCATION LOADING
  ========================= */

  if (locating) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        Mengambil lokasi kamu...
      </main>
    );
  }

  const feedProps = {
    tasks,

    loadingTasks,

    locationError,

    activeCategory,

    searchValue: searchInput,

    currentPage,

    totalPages,

    onCategoryChange: handleCategoryChange,

    onSearchChange: handleSearchChange,

    onPreviousPage: handlePreviousPage,

    onNextPage: handleNextPage,

    pendingPayment: pendingPayment.payment,

    pendingPaymentLoading: pendingPayment.loading,

    resumePaymentLoading: resumePayment.opening,

    onOpenSupport: () => setOpenSupport(true),

    onResumePayment: handleResumePayment,
  };

  return (
    <>
      <MobileHomeView {...feedProps} />

      <DesktopHomeView {...feedProps} />

      {/*
       * Hanya SATU PaymentRoot untuk
       * Mobile + Desktop.
       *
       * View responsive hanya menangani
       * presentation dan callback.
       */}
      <PaymentRoot
        supportOpen={openSupport}
        onCloseSupport={() => setOpenSupport(false)}
      />

      {/*
       * Result untuk pembayaran yang
       * dibuka kembali dari Pending Card.
       */}
      {resumePayment.paymentType && (
        <PaymentResultDialog
          open={resumePayment.result.status !== "IDLE"}
          status={resumePayment.result.status}
          amount={resumePayment.result.amount}
          orderId={resumePayment.result.orderId}
          paymentType={resumePayment.paymentType}
          onClose={() => {
            resumePayment.closeDialog();

            void pendingPayment.refresh();
          }}
          onHistory={() => {
            resumePayment.closeDialog();

            router.push("/payments/history");
          }}
          onViewTask={
            resumePayment.taskId
              ? () => {
                  const taskId = resumePayment.taskId;

                  resumePayment.closeDialog();

                  router.push(`/tasks/${taskId}`);
                }
              : undefined
          }
        />
      )}
    </>
  );
}