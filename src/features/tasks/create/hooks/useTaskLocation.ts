"use client";

import { useState } from "react";

import type {

  LocationMethod,

  NominatimLocation,

} from "../types/create-task.types";

export function useTaskLocation() {

  const [

    locationMethod,

    setLocationMethod,

  ] = useState<LocationMethod>("SEARCH");

  const [

    locationQuery,

    setLocationQuery,

  ] = useState("");

  const [

    selectedLocation,

    setSelectedLocation,

  ] =
    useState<NominatimLocation | null>(
      null
    );

  const [

    latitude,

    setLatitude,

  ] =
    useState<number | null>(null);

  const [

    longitude,

    setLongitude,

  ] =
    useState<number | null>(null);

  const [

    manualAddress,

    setManualAddress,

  ] =
    useState("");

  return {

    locationMethod,

    setLocationMethod,

    locationQuery,

    setLocationQuery,

    selectedLocation,

    setSelectedLocation,

    latitude,

    setLatitude,

    longitude,

    setLongitude,

    manualAddress,

    setManualAddress,

  };

}