"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { createTask } from "../services/task.service";

export default function CreateTaskForm() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [budget, setBudget] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [taskDate, setTaskDate] =
    useState("");

  const [taskTime, setTaskTime] =
    useState("");

  const [isUrgent, setIsUrgent] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

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
          "Tanggal dan jam harus diisi"
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

        location_type:
          "MANUAL",

        location_name:
          null,

        manual_address:
          address,

        latitude:
          null,

        longitude:
          null,

        owner_latitude:
          null,

        owner_longitude:
          null,

        scheduled_at:
          scheduledAt.toISOString(),

        is_urgent:
          isUrgent,
      });

      alert("Berhasil mencari bantuan");

      router.push("/home");
    } catch (error) {
      console.error(error);

      alert("Gagal mencari bantuan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Cari bantuan
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          required
          placeholder="Judul Task"
          className="w-full rounded-xl border p-3"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <textarea
          placeholder="Deskripsi"
          className="w-full rounded-xl border p-3"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <input
          placeholder="Kategori"
          className="w-full rounded-xl border p-3"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        />

        <input
          placeholder="Budget"
          type="number"
          min="0"
          className="w-full rounded-xl border p-3"
          value={budget}
          onChange={(e) =>
            setBudget(e.target.value)
          }
        />

        <input
          placeholder="Alamat"
          className="w-full rounded-xl border p-3"
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
        />

        <div>

          <label
            className="
      mb-2
      block
      text-sm
      font-semibold
    "
          >
            Tanggal Pelaksanaan
          </label>

          <input
            type="date"
            className="
      w-full
      rounded-xl
      border
      p-3
    "
            value={taskDate}
            onChange={(e) =>
              setTaskDate(
                e.target.value
              )
            }
            required
          />

        </div>

        <div>

          <label
            className="
      mb-2
      block
      text-sm
      font-semibold
    "
          >
            Jam Pelaksanaan
          </label>

          <input
            type="time"
            className="
      w-full
      rounded-xl
      border
      p-3
    "
            value={taskTime}
            onChange={(e) =>
              setTaskTime(
                e.target.value
              )
            }
            required
          />

        </div>

        <label
          className="
    flex
    items-start
    gap-3
    rounded-xl
    border
    p-4
  "
        >

          <input
            type="checkbox"
            checked={isUrgent}
            onChange={(e) =>
              setIsUrgent(
                e.target.checked
              )
            }
          />

          <div>

            <p
              className="
        text-sm
        font-semibold
      "
            >
              🔥 Prioritas Tinggi
            </p>

            <p
              className="
        text-xs
        text-slate-500
      "
            >
              Task akan ditampilkan
              lebih atas di feed helper.
            </p>

          </div>

        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-black px-6 py-3 text-white"
        >
          {loading
            ? "Menyimpan..."
            : "Buat Task"}
        </button>
      </form>
    </main>
  );
}