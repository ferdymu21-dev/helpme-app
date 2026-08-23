"use client";

import { useEffect, useRef, useState } from "react";

import type { NominatimLocation } from "../types/create-task.types";

export function useLocationSearch() {
  const [searchResults, setSearchResults] = useState<NominatimLocation[]>([]);

  const [locationSearch, setLocationSearch] = useState("");

  const [searchingLocation, setSearchingLocation] = useState(false);

  /**
   * Menyimpan controller request yang sedang berjalan.
   *
   * Jika user melakukan pencarian baru,
   * request sebelumnya akan dibatalkan.
   */
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * ID request terakhir.
   *
   * Digunakan sebagai lapisan keamanan tambahan
   * agar response lama tidak boleh mengubah state.
   */
  const requestIdRef = useRef(0);

  async function searchLocation(query: string) {
    const trimmedQuery = query.trim();

    /**
     * Setiap pencarian baru mendapatkan request ID baru.
     */
    const requestId = ++requestIdRef.current;

    /**
     * Batalkan request sebelumnya jika masih berjalan.
     */
    abortControllerRef.current?.abort();

    /**
     * Query kosong:
     * langsung bersihkan hasil pencarian.
     */
    if (!trimmedQuery) {
      setSearchResults([]);
      setSearchingLocation(false);

      return;
    }

    /**
     * Minimal 3 karakter.
     */
    if (trimmedQuery.length < 3) {
      setSearchResults([]);
      setSearchingLocation(false);

      return;
    }

    /**
     * Buat controller untuk request baru.
     */
    const controller = new AbortController();

    abortControllerRef.current = controller;

    try {
      setSearchingLocation(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=10&q=${encodeURIComponent(
          trimmedQuery,
        )}`,
        {
          headers: {
            "Accept-Language": "id",
          },
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`Location search failed: ${response.status}`);
      }

      const data = (await response.json()) as NominatimLocation[];

      /**
       * Jangan izinkan response request lama
       * mengubah hasil pencarian terbaru.
       */
      if (requestId !== requestIdRef.current) {
        return;
      }

      /**
       * Pastikan request ini masih merupakan
       * request yang aktif.
       */
      if (controller.signal.aborted) {
        return;
      }

      setSearchResults(data);
    } catch (error) {
      /**
       * Abort dari request lama adalah kondisi normal,
       * bukan error yang perlu ditampilkan.
       */
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      /**
       * Jika request sudah bukan request terbaru,
       * jangan mengubah state.
       */
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error("Gagal mencari lokasi:", error);

      setSearchResults([]);
    } finally {
      /**
       * Hanya request terbaru yang boleh
       * mengubah status searching.
       */
      if (requestId === requestIdRef.current) {
        setSearchingLocation(false);
      }
    }
  }

  /**
   * Batalkan request ketika hook/component
   * sudah tidak digunakan lagi.
   */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    searchResults,

    setSearchResults,

    locationSearch,

    setLocationSearch,

    searchingLocation,

    searchLocation,
  };
}