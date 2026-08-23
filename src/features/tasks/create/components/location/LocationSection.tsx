"use client";

import type {
  LocationMethod,
  NominatimLocation,
} from "../../types/create-task.types";

import LocationMethodTabs from "./LocationMethodTabs";
import SearchLocation from "./SearchLocation";
import SearchResults from "./SearchResults";
import SelectedLocationCard from "./SelectedLocationCard";
import ManualAddressInput from "./ManualAddressInput";

type Props = {
  locationMethod: LocationMethod;

  locationSearch: string;

  searchingLocation: boolean;

  searchResults: NominatimLocation[];

  selectedLocation: NominatimLocation | null;

  manualAddress: string;

  onLocationMethodChange: (value: LocationMethod) => void;

  onLocationSearchChange: (value: string) => void;

  onManualAddressChange: (value: string) => void;

  onSelectedLocationChange: (value: NominatimLocation | null) => void;

  onSearchResultsChange: (value: NominatimLocation[]) => void;

  onLatitudeChange: (value: number | null) => void;

  onLongitudeChange: (value: number | null) => void;

  onLocationQueryChange: (value: string) => void;

  onSearchLocation: (query: string) => void;
};

export default function LocationSection({
  locationMethod,

  locationSearch,

  searchingLocation,

  searchResults,

  selectedLocation,

  manualAddress,

  onLocationMethodChange,

  onLocationSearchChange,

  onManualAddressChange,

  onSelectedLocationChange,

  onSearchResultsChange,

  onLatitudeChange,

  onLongitudeChange,

  onLocationQueryChange,

  onSearchLocation,
}: Props) {
  return (
    <section
      className="
        rounded-3xl
        border
        border-slate-200/80
        bg-white
        p-5
        shadow-[0_8px_30px_rgba(15,23,42,0.04)]
        sm:p-6
      "
    >
      <p
        className="
          text-[11px]
          font-bold
          uppercase
          tracking-[0.14em]
          text-indigo-600
        "
      >
        Lokasi
      </p>

      <h2 className="mt-1 text-sm font-bold text-slate-900">
        Di mana bantuan dibutuhkan?
      </h2>

      <LocationMethodTabs
        locationMethod={locationMethod}
        onLocationMethodChange={onLocationMethodChange}
        onManualAddressChange={onManualAddressChange}
        onSelectedLocationChange={onSelectedLocationChange}
        onLatitudeChange={onLatitudeChange}
        onLongitudeChange={onLongitudeChange}
        onLocationQueryChange={onLocationQueryChange}
      />

      {locationMethod === "SEARCH" && (
        <>
          <SearchLocation
            locationSearch={locationSearch}
            searchingLocation={searchingLocation}
            onLocationSearchChange={onLocationSearchChange}
            onSearchLocation={onSearchLocation}
          />

          <SearchResults
            searchResults={searchResults}
            onSelectedLocationChange={onSelectedLocationChange}
            onLatitudeChange={onLatitudeChange}
            onLongitudeChange={onLongitudeChange}
            onLocationQueryChange={onLocationQueryChange}
            onSearchResultsChange={onSearchResultsChange}
          />

          {selectedLocation && (
            <SelectedLocationCard selectedLocation={selectedLocation} />
          )}
        </>
      )}

      {locationMethod === "MANUAL" && (
        <ManualAddressInput
          manualAddress={manualAddress}
          onManualAddressChange={onManualAddressChange}
        />
      )}
    </section>
  );
}