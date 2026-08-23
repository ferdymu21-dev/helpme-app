"use client";

import { useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import { getTasks } from "@/features/tasks/services/client/task.client";

import type { NearbyTask } from "@/features/tasks/types/nearby-task";

import MobileHomeView from "@/components/home/mobile/MobileHomeView";

import DesktopHomeView from "@/components/home/desktop/DesktopHomeView";

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
  const [tasks, setTasks] = useState<NearbyTask[]>([]);

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  const [locating, setLocating] = useState(true);

  const [loadingTasks, setLoadingTasks] = useState(true);

  const [locationError, setLocationError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState("Semua");

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const requestIdRef = useRef(0);

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

  /* =========================
   LOAD TASKS
========================= */

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

      category: activeCategory,
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
  }, [activeCategory, coordinates, currentPage]);

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
        /*
         * Callback ini dijalankan oleh
         * Supabase Realtime ketika tabel
         * tasks berubah.
         */

        const requestId = ++requestIdRef.current;

        void getTasks({
          latitude: coordinates.latitude,

          longitude: coordinates.longitude,

          page: currentPage,

          pageSize: PAGE_SIZE,

          category: activeCategory,
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
          console.error(
            "Gagal refresh nearby tasks dari Realtime:",
            error,
          );
        })
        .finally(() => {
          if (
            requestId ===
            requestIdRef.current
          ) {
            setLoadingTasks(false);
          }
        });
      },
    );

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeCategory, coordinates, currentPage]);

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
    currentPage,
    totalPages,
    onCategoryChange: handleCategoryChange,
    onPreviousPage: handlePreviousPage,
    onNextPage: handleNextPage,
  };

  return (
    <>
      <MobileHomeView {...feedProps} />

      <DesktopHomeView {...feedProps} />
    </>
  );
}