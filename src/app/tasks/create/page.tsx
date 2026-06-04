"use client";

import {
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  createTask,
} from "@/features/tasks/services/task.service";

const categories = [
  "Belanja",
  "Dokumen",
  "Kurir",
  "Kampus",
  "Antri",
  "Lainnya",
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

  const [address, setAddress] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleCreateTask(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      await createTask({
        title,
        description,
        category,
        budget: Number(budget),
        address,

        latitude: -6.200000, 
        longitude: 106.816666,
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
              text-4xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            Apa yang kamu butuhkan?
          </h1>

          <p
            className="
              mt-4
              max-w-2xl
              text-lg
              leading-8
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
            mt-10
            rounded-[32px]
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

            <div className="mt-4 flex flex-wrap gap-3">

              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setCategory(item)
                  }
                  className={`
                    rounded-2xl
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    transition

                    ${
                      category === item
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >
                  {item}
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

          {/* ADDRESS */}
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

            <input
              type="text"
              required
              value={address}
              onChange={(e) =>
                setAddress(
                  e.target.value
                )
              }
              placeholder="Masukkan alamat task"
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
              ? "Membuat task..."
              : "Buat Task"}
          </button>

        </form>

      </div>

    </main>
  );
}