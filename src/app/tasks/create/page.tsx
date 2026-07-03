"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";

import { useRouter } from "next/navigation";

import {
  createTask,
} from "@/features/tasks/services/task.service";

const categories = [
  {
    name: "Antri",
    icon: "/icons/antri.svg",
  },
  {
    name: "Dokumen",
    icon: "/icons/dokumen.svg",
  },
  {
    name: "Kondangan",
    icon: "/icons/kondangan.svg",
  },
  {
    name: "Kurir",
    icon: "/icons/kurir.svg",
  },
  {
    name: "Belanja",
    icon: "/icons/belanja.svg",
  },
  {
    name: "Lainnya",
    icon: "/icons/lainnya.svg",
  },
];

export default function CreateTaskPage() {
  const router = useRouter();

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("Belanja");

  const [budget, setBudget] =
    useState("");

  const [
    taskDate,
    setTaskDate,
  ] = useState("");

  const [
    taskTime,
    setTaskTime,
  ] = useState("");

  const [
    isUrgent,
    setIsUrgent,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [
    locationMethod,
    setLocationMethod,
  ] = useState<
    "SEARCH" | "MANUAL"
  >("SEARCH");

  const [
    locationQuery,
    setLocationQuery,
  ] = useState("");

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState<any>(null);

  const [
    latitude,
    setLatitude,
  ] = useState<number | null>(
    null
  );

  const [
    longitude,
    setLongitude,
  ] = useState<number | null>(
    null
  );

  const [
    manualAddress,
    setManualAddress,
  ] = useState("");

  const [
    ownerLatitude,
    setOwnerLatitude,
  ] = useState<number | null>(
    null
  );

  const [
    ownerLongitude,
    setOwnerLongitude,
  ] = useState<number | null>(
    null
  );

  const [
    searchResults,
    setSearchResults,
  ] = useState<any[]>([]);

  const [
    locationSearch,
    setLocationSearch,
  ] = useState("");

  const [
    searchingLocation,
    setSearchingLocation,
  ] = useState(false);

  useEffect(() => {

    navigator.geolocation
      .getCurrentPosition(
        (position) => {

          setOwnerLatitude(
            position.coords.latitude
          );

          setOwnerLongitude(
            position.coords.longitude
          );
        }
      );

  }, []);

  async function searchLocation(
    query: string
  ) {

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {

      if (
        query.trim().length < 3
      ) {

        setSearchResults([]);

        return;
      }

      setSearchingLocation(
        true
      );

      const response =
        await fetch(

          `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,

          {
            headers: {
              "Accept-Language":
                "id",
            },
          }
        );

      const data =
        await response.json();

      setSearchResults(data);

    } catch (error) {

      console.error(error);

    } finally {

      setSearchingLocation(
        false
      );
    }
  }

  async function handleCreateTask(
    e: React.FormEvent
  ) {
    e.preventDefault();

    /* =========================
       VALIDATION
    ========================= */

    if (
      locationMethod ===
      "SEARCH"
    ) {

      if (
        !selectedLocation ||
        !latitude ||
        !longitude
      ) {

        alert(
          "Pilih lokasi terlebih dahulu"
        );

        return;
      }
    }

    if (
      locationMethod ===
      "MANUAL"
    ) {

      if (
        !manualAddress.trim()
      ) {

        alert(
          "Masukkan alamat manual"
        );

        return;
      }
    }

    try {

      setLoading(true);

      const scheduledAt =
        new Date(
          `${taskDate}T${taskTime}`
        );

      if (
        isNaN(
          scheduledAt.getTime()
        )
      ) {

        alert(
          "Tanggal dan jam pelaksanaan wajib diisi"
        );

        setLoading(false);

        return;
      }

      if (
        scheduledAt.getTime() <
        Date.now()
      ) {

        alert(
          "Waktu pelaksanaan tidak boleh di masa lalu"
        );

        setLoading(false);

        return;
      }

      await createTask({

        title,

        description,

        category,

        budget: Number(budget),

        /* =========================
           LOCATION TYPE
        ========================= */

        location_type:
          locationMethod,

        /* =========================
           SEARCH LOCATION
        ========================= */

        location_name:
          locationMethod ===
            "SEARCH"

            ? locationQuery
            : null,

        latitude:
          locationMethod ===
            "SEARCH"

            ? latitude
            : null,

        longitude:
          locationMethod ===
            "SEARCH"

            ? longitude
            : null,

        /* =========================
           MANUAL ADDRESS
        ========================= */

        manual_address:
          locationMethod ===
            "MANUAL"

            ? manualAddress
            : null,

        /* =========================
           OWNER LOCATION
        ========================= */

        owner_latitude:
          ownerLatitude,

        owner_longitude:
          ownerLongitude,

        scheduled_at:
          scheduledAt.toISOString(),

        is_urgent:
          isUrgent,
      });

      alert(
        "Task berhasil dibuat"
      );

      router.push("/home");
    } catch (error) {
      console.error(error);

      alert(
        "Gagal membuat task"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">

      {/* CONTAINER */}
      <div className="mx-auto max-w-3xl px-6 py-8">

        {/* HEADER */}
        <div>

          <div
            className="
              inline-flex
              rounded-full
              bg-indigo-50
              px-4
              py-2
              text-sm
              font-semibold
              text-indigo-600
            "
          >
            Buat task baru
          </div>

          <h1
            className="
              mt-6
              text-xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            Perlu bantuan apa?
          </h1>

          <p
            className="
              mt-2
              max-w-xl
              text-base
              leading-5
              text-slate-500
            "
          >
            Jelaskan kebutuhanmu dengan detail
            agar helper yang tepat dapat membantu.
          </p>

        </div>

        {/* FORM CARD */}
        <form
          onSubmit={handleCreateTask}
          className="
            mt-7
            rounded-4xl
            border
            border-slate-200
            bg-white
            p-8
            shadow-[0_20px_60px_rgba(15,23,42,0.06)]
          "
        >

          {/* TITLE */}
          <div>

            <label
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Judul Task
            </label>

            <input
              type="text"
              required
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Contoh: Ambil dokumen ke kampus"
              className="
                mt-3
                h-14
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-5
                text-slate-900
                outline-none
                transition
                focus:border-indigo-500
                focus:bg-white
              "
            />

          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">

            <label
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Deskripsi
            </label>

            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Jelaskan kebutuhanmu secara detail..."
              className="
                mt-3
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-5
                py-4
                text-slate-900
                outline-none
                transition
                focus:border-indigo-500
                focus:bg-white
              "
            />

          </div>

          {/* CATEGORY */}
          <div className="mt-6">

            <label
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Kategori
            </label>

            <div
              className="
    mt-4
    flex
    gap-3
    overflow-x-auto
    pb-2
    scrollbar-hide

    md:flex-wrap
    md:overflow-visible
  "
            >

              {categories.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() =>
                    setCategory(item.name)
                  }
                  className={`
    shrink-0
    whitespace-nowrap
    rounded-2xl
    px-4
    py-2
    text-[13px]
    font-semibold
    transition
    flex
    items-center
    gap-2

    ${category === item.name
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }
  `}
                >

                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={18}
                    height={18}
                  />

                  {item.name}

                </button>
              ))}

            </div>

          </div>

          {/* BUDGET */}
          <div className="mt-6">

            <label
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Budget
            </label>

            <input
              type="number"
              required
              value={budget}
              onChange={(e) =>
                setBudget(e.target.value)
              }
              placeholder="50000"
              className="
                mt-3
                h-14
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-5
                text-slate-900
                outline-none
                transition
                focus:border-indigo-500
                focus:bg-white
              "
            />

          </div>

          {/* SCHEDULE */}
          <div className="mt-6">

            <label
              className="
      text-sm
      font-semibold
      text-slate-700
    "
            >
              Jadwal Pelaksanaan
            </label>

            <div className="mt-3 grid grid-cols-2 gap-3">

              <input
                type="date"
                required
                value={taskDate}
                onChange={(e) =>
                  setTaskDate(
                    e.target.value
                  )
                }
                className="
        h-14
        rounded-2xl
        border
        border-slate-200
        bg-slate-50
        px-4
      "
              />

              <input
                type="time"
                required
                value={taskTime}
                onChange={(e) =>
                  setTaskTime(
                    e.target.value
                  )
                }
                className="
        h-14
        rounded-2xl
        border
        border-slate-200
        bg-slate-50
        px-4
      "
              />

            </div>

          </div>

          {/* URGENT */}
          <div className="mt-6">

            <button
              type="button"
              onClick={() =>
                setIsUrgent(!isUrgent)
              }
              className={`
      w-full
      rounded-2xl
      border
      p-4
      text-left
      transition

      ${isUrgent
                  ? `
          border-red-500
          bg-red-50
        `
                  : `
          border-slate-200
          bg-white
        `
                }
    `}
            >

              <div className="flex items-center justify-between">

                <p className="font-semibold">
                  🔥 Urgent
                </p>

                {isUrgent && (
                  <span
                    className="
            rounded-full
            bg-red-500
            px-2
            py-1
            text-[10px]
            font-bold
            text-white
          "
                  >
                    AKTIF
                  </span>
                )}

              </div>

              <p
                className="
        mt-2
        text-xs
        text-slate-500
      "
              >
                Task akan tampil lebih atas
                di feed helper.
              </p>

            </button>

          </div>

          {/* LOCATION */}
          <div className="mt-6">

            <label
              className="
      text-sm
      font-semibold
      text-slate-700
    "
            >
              Lokasi
            </label>

            {/* METHOD TOGGLE */}
            <div className="mt-4 grid grid-cols-2 gap-3">

              {/* SEARCH */}
              <button
                type="button"
                onClick={() => {

                  setLocationMethod(
                    "SEARCH"
                  );

                  setManualAddress("");
                }}

                className={`
                  text-xs
        rounded-2xl
        border
        p-4
        text-left
        transition

        ${locationMethod ===
                    "SEARCH"

                    ? `
              border-indigo-500
              bg-indigo-50
            `

                    : `
              border-slate-200
              bg-white
            `
                  }
      `}
              >

                <p className="font-bold">
                  Cari Lokasi
                </p>

                <p
                  className="
          mt-1
          text-xs
          text-slate-500
        "
                >
                  Lokasi lebih akurat
                </p>

              </button>

              {/* MANUAL */}
              <button
                type="button"
                onClick={() => {

                  setLocationMethod(
                    "MANUAL"
                  );

                  setSelectedLocation(
                    null
                  );

                  setLatitude(null);

                  setLongitude(null);

                  setLocationQuery("");
                }}

                className={`
                  text-xs
        rounded-2xl
        border
        p-4
        text-left
        transition

        ${locationMethod ===
                    "MANUAL"

                    ? `
              border-indigo-500
              bg-indigo-50
            `

                    : `
              border-slate-200
              bg-white
            `
                  }
      `}
              >

                <p className="font-bold">
                  Alamat Manual
                </p>

                <p
                  className="
          mt-1
          text-xs
          text-slate-500
        "
                >
                  Tulis alamat sendiri
                </p>

              </button>

            </div>

            {/* SEARCH INPUT */}
            {locationMethod ===
              "SEARCH" && (

                <div className="mt-4">

                  <input
                    type="text"
                    value={locationSearch}

                    onChange={(e) => {

                      const value =
                        e.target.value;

                      setLocationSearch(value);

                      clearTimeout(
                        (window as any)
                          .locationSearchTimeout
                      );

                      (window as any)
                        .locationSearchTimeout =
                        setTimeout(() => {

                          searchLocation(value);

                        }, 800);
                    }}
                    placeholder="
                  Pilih lokasi..."
                    className="
                    text-[16px]
                  h-14
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-5
                  text-slate-900
                  outline-none
                  transition
                  focus:border-indigo-500
                  focus:bg-white
                  "
                  />

                  {/* SEARCH RESULTS */}
                  {searchingLocation && (

                    <div
                      className="
      mt-3
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-4
      text-sm
      text-slate-500
    "
                    >
                      Mencari lokasi...
                    </div>

                  )}

                  {searchResults.length > 0 && (

                    <div
                      className="
      mt-3
      overflow-hidden
      rounded-2xl
      border
      border-slate-200
      bg-white
    "
                    >

                      {searchResults.map(
                        (location) => (

                          <button
                            key={location.place_id}

                            type="button"

                            onClick={() => {

                              setSelectedLocation(
                                location
                              );

                              setLocationQuery(
                                location.display_name
                              );

                              setLatitude(
                                Number(location.lat)
                              );

                              setLongitude(
                                Number(location.lon)
                              );

                              setSearchResults(
                                []
                              );
                            }}

                            className="
          w-full
          border-b
          border-slate-100
          px-4
          py-4
          text-left
          transition
          hover:bg-slate-50
        "
                          >

                            <p
                              className="
            text-sm
            font-semibold
            text-slate-900
          "
                            >
                              {location.display_name}
                            </p>

                          </button>

                        ))}

                    </div>

                  )}

                  {selectedLocation && (

                    <div
                      className="
            mt-3
            rounded-2xl
            border
            border-emerald-200
            bg-emerald-50
            p-4
          "
                    >

                      <p
                        className="
              text-sm
              font-semibold
              text-emerald-700
            "
                      >
                        Lokasi dipilih
                      </p>

                      <p
                        className="
              mt-1
              text-sm
              text-slate-600
            "
                      >
                        {
                          selectedLocation
                            .display_name
                        }
                      </p>

                    </div>

                  )}

                </div>

              )}

            {/* MANUAL INPUT */}
            {locationMethod ===
              "MANUAL" && (

                <textarea
                  rows={4}
                  required
                  value={manualAddress}
                  onChange={(e) =>
                    setManualAddress(
                      e.target.value
                    )
                  }
                  placeholder="
                  Contoh: warung viral, Jl. Sudirman No. 10..."
                  className="
                    text-xs
                    mt-4
                    w-full
                    rounded-2xl
                    border
                  border-slate-200
                  bg-slate-50
                    px-5
                    py-4
                  text-slate-900
                    outline-none
                    transition
                  focus:border-indigo-500
                  focus:bg-white
      "
                />

              )}

          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="
              mt-8
              flex
              h-14
              w-full
              items-center
              justify-center
              rounded-[20px]
              bg-indigo-600
              text-lg
              font-semibold
              text-white
              shadow-lg
              shadow-indigo-600/20
              transition
              hover:bg-indigo-700
              disabled:bg-slate-300
            "
          >
            {loading
              ? "Cari bantuan..."
              : "Cari bantuan"}
          </button>

        </form>

      </div>

    </main>
  );
}