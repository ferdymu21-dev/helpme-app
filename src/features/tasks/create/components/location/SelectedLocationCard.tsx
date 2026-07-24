"use client";

import type {
  NominatimLocation,
} from "../../types/create-task.types";

type Props = {

  selectedLocation:
    NominatimLocation | null;

};

export default function SelectedLocationCard({

  selectedLocation,

}: Props) {

  if (!selectedLocation) {

    return null;

  }

  return (

    <div
      className="
        mt-3
        flex
        gap-3
        rounded-2xl
        border
        border-emerald-200
        bg-emerald-50
        p-4
      "
    >

      <span className="text-base">

        ✓

      </span>

      <div>

        <p
          className="
            text-xs
            font-bold
            text-emerald-700
          "
        >
          Lokasi dipilih
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-slate-600
          "
        >
          {selectedLocation.display_name}
        </p>

      </div>

    </div>

  );

}