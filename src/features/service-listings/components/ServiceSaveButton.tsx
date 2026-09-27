"use client";

import {
  Bookmark,
  LoaderCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";

import type {
  MouseEvent,
} from "react";

import type {
  ToggleSavedServiceResult,
} from "../hooks/useSavedServiceListings";

interface ServiceSaveButtonProps {
  listingId: string;

  isSaved: boolean;

  isPending: boolean;

  isAuthenticated: boolean;

  loadingState?: boolean;

  variant?: "ICON" | "LABEL";

  size?: "DEFAULT" | "SMALL";

  onToggle: (
    listingId: string,
  ) => Promise<ToggleSavedServiceResult>;
}

export default function ServiceSaveButton({
  listingId,
  isSaved,
  isPending,
  isAuthenticated,
  loadingState = false,
  variant = "ICON",
  size = "DEFAULT",
  onToggle,
}: ServiceSaveButtonProps) {
  const router =
    useRouter();

  async function handleClick(
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (
      loadingState ||
      isPending
    ) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");

      return;
    }

    try {
      await onToggle(
        listingId,
      );
    } catch {
      /*
       * The hook owns rollback + error state.
       * Do not navigate or mutate state again here.
       */
    }
  }

  const label =
    isSaved
      ? "Tersimpan"
      : "Simpan";

  if (variant === "LABEL") {
    return (
      <button
        type="button"
        aria-pressed={isSaved}
        aria-label={
          isSaved
            ? "Hapus jasa dari tersimpan"
            : "Simpan jasa"
        }
        disabled={
          loadingState ||
          isPending
        }
        onClick={handleClick}
        className={`
          inline-flex
          min-h-8
          items-center
          justify-center
          gap-1
          rounded-xl
          border
          px-2
          text-[10px]
          font-bold
          transition
          active:scale-[0.98]
          disabled:cursor-wait
          disabled:opacity-70

          ${
            isSaved
              ? `
                border-indigo-200
                bg-indigo-50
                text-indigo-700
                hover:bg-indigo-100
              `
              : `
                border-slate-200
                bg-white
                text-slate-700
                hover:border-indigo-200
                hover:text-indigo-700
              `
          }
        `}
      >
        {isPending ? (
          <LoaderCircle
            aria-hidden="true"
            className="
              h-4
              w-4
              animate-spin
            "
          />
        ) : (
          <Bookmark
            aria-hidden="true"
            className={`
              h-3
              w-3

              ${
                isSaved
                  ? "fill-current"
                  : ""
              }
            `}
          />
        )}

        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={isSaved}
      aria-label={
        isSaved
          ? "Hapus jasa dari tersimpan"
          : "Simpan jasa"
      }
      title={
        isSaved
          ? "Tersimpan"
          : "Simpan jasa"
      }
      disabled={
        loadingState ||
        isPending
      }
      onClick={handleClick}
      className={`
        inline-flex
        ${
          size === "SMALL"
            ? "h-7 w-7"
            : "h-10 w-10"
        }
        items-center
        justify-center
        rounded-full
        border
        shadow-sm
        backdrop-blur
        transition
        active:scale-95
        disabled:cursor-wait
        disabled:opacity-70

        ${
          isSaved
            ? `
              border-indigo-200
              bg-indigo-600
              text-white
              hover:bg-indigo-700
            `
            : `
              border-white/80
              bg-white/92
              text-slate-700
              hover:border-indigo-200
              hover:text-indigo-700
            `
        }
      `}
    >
      {isPending ? (
        <LoaderCircle
          aria-hidden="true"
          className="
            h-4
            w-4
            animate-spin
          "
        />
      ) : (
        <Bookmark
          aria-hidden="true"
          className={`
            ${
              size === "SMALL"
                ? "h-3.5 w-3.5"
                : "h-4.5 w-4.5"
            }

            ${
              isSaved
                ? "fill-current"
                : ""
            }
          `}
        />
      )}
    </button>
  );
}