"use client";

import type { NominatimLocation } from "../../types/create-task.types";

type Props = {
  searchResults: NominatimLocation[];

  onSelectedLocationChange: (value: NominatimLocation) => void;

  onLocationQueryChange: (value: string) => void;

  onLatitudeChange: (value: number) => void;

  onLongitudeChange: (value: number) => void;

  onSearchResultsChange: (value: NominatimLocation[]) => void;
};

export default function SearchResults({
  searchResults,

  onSelectedLocationChange,

  onLocationQueryChange,

  onLatitudeChange,

  onLongitudeChange,

  onSearchResultsChange,
}: Props) {
  if (searchResults.length === 0) {
    return null;
  }

  return (
    <div
      className="
        mt-3
        max-h-64
        overflow-y-auto
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-lg
      "
    >
      {searchResults.map((location) => (
        <button
          key={location.place_id}
          type="button"
          onClick={() => {
            onSelectedLocationChange(location);

            onLocationQueryChange(location.display_name);

            onLatitudeChange(Number(location.lat));

            onLongitudeChange(Number(location.lon));

            onSearchResultsChange([]);
          }}
          className="
            w-full
            border-b
            border-slate-100
            px-4
            py-3.5
            text-left
            transition
            last:border-b-0
            hover:bg-slate-50
          "
        >
          <p
            className="
              text-xs
              font-medium
              leading-5
              text-slate-700
            "
          >
            {location.display_name}
          </p>
        </button>
      ))}
    </div>
  );
}