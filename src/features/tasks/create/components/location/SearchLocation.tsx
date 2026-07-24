"use client";

import type { ChangeEvent } from "react";

type Props = {
  locationSearch: string;

  searchingLocation: boolean;

  onLocationSearchChange: (
    value: string
  ) => void;

  onSearchLocation: (
    query: string
  ) => void;
};

export default function SearchLocation({
  locationSearch,
  searchingLocation,
  onLocationSearchChange,
  onSearchLocation,
}: Props) {

  function handleChange(
    e: ChangeEvent<HTMLInputElement>
  ) {

    const value = e.target.value;

    onLocationSearchChange(value);

    clearTimeout(
      (window as any).locationSearchTimeout
    );

    (window as any).locationSearchTimeout =
      setTimeout(() => {

        onSearchLocation(value);

      }, 800);

  }

  return (
    <>
      <input
        type="text"
        value={locationSearch}
        onChange={handleChange}
        placeholder="Cari nama tempat atau alamat..."
        className="
          h-13
          w-full
          rounded-2xl
          border
          border-slate-200
          bg-slate-50/70
          px-4
          text-sm
          text-slate-900
          outline-none
          transition
          placeholder:text-slate-400
          focus:border-indigo-500
          focus:bg-white
          focus:ring-4
          focus:ring-indigo-100
        "
      />

      {searchingLocation && (
        <div
          className="
            mt-3
            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            p-4
            text-xs
            text-slate-500
          "
        >
          Mencari lokasi...
        </div>
      )}
    </>
  );
}