"use client";

import type { LocationMethod } from "../../types/create-task.types";

type Props = {
  locationMethod: LocationMethod;

  onLocationMethodChange: (
    value: LocationMethod
  ) => void;

  onManualAddressChange: (
    value: string
  ) => void;

  onSelectedLocationChange: (
    value: any
  ) => void;

  onLatitudeChange: (
    value: number | null
  ) => void;

  onLongitudeChange: (
    value: number | null
  ) => void;

  onLocationQueryChange: (
    value: string
  ) => void;
};

export default function LocationMethodTabs({
  locationMethod,
  onLocationMethodChange,
  onManualAddressChange,
  onSelectedLocationChange,
  onLatitudeChange,
  onLongitudeChange,
  onLocationQueryChange,
}: Props) {
  return (
    <div
      className="
        mt-5
        grid
        grid-cols-2
        rounded-2xl
        bg-slate-100
        p-1
      "
    >
      <button
        type="button"
        onClick={() => {
          onLocationMethodChange("SEARCH");
          onManualAddressChange("");
        }}
        className={`
          rounded-xl
          px-3
          py-3
          text-xs
          font-semibold
          transition-all

          ${
            locationMethod === "SEARCH"
              ? `
                bg-white
                text-indigo-600
                shadow-sm
              `
              : `
                text-slate-500
              `
          }
        `}
      >
        📍 Cari Lokasi
      </button>

      <button
        type="button"
        onClick={() => {
          onLocationMethodChange("MANUAL");

          onSelectedLocationChange(null);

          onLatitudeChange(null);

          onLongitudeChange(null);

          onLocationQueryChange("");
        }}
        className={`
          rounded-xl
          px-3
          py-3
          text-xs
          font-semibold
          transition-all

          ${
            locationMethod === "MANUAL"
              ? `
                bg-white
                text-indigo-600
                shadow-sm
              `
              : `
                text-slate-500
              `
          }
        `}
      >
        ✏️ Alamat Manual
      </button>
    </div>
  );
}