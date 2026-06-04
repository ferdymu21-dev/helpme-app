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

  async function handleSubmit(
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
        latitude: 0,
        longitude: 0,
      });

      alert("Task berhasil dibuat");

      router.push("/home");
    } catch (error) {
      console.error(error);

      alert("Gagal membuat task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Buat Task
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
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