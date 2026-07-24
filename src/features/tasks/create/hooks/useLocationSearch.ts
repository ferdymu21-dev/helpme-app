"use client";

import { useState } from "react";

import type {
  NominatimLocation,
} from "../types/create-task.types";

export function useLocationSearch() {

  const [

    searchResults,

    setSearchResults,

  ] = useState<NominatimLocation[]>([]);

  const [
    locationSearch,

    setLocationSearch,

  ] = useState("");

  const [
    searchingLocation,

    setSearchingLocation,
    
  ] = useState(false);

  async function searchLocation(
    query: string
  ) {

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {

      if (query.trim().length < 3) {

        setSearchResults([]);

        return;

      }

      setSearchingLocation(true);

      const response =
        await fetch(

          `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,

          {
            headers: {
              "Accept-Language": "id",
            },
          }

        );

      const data =
        await response.json();

      setSearchResults(data);

    } catch (error) {

      console.error(error);

    } finally {

      setSearchingLocation(false);

    }

  }

  return {

    searchResults,
    setSearchResults,

    locationSearch,
    setLocationSearch,

    searchingLocation,

    searchLocation,

  };

}