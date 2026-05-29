import Link from "next/link";

import Button from "@/components/ui/Button";

import {
  APP_DESCRIPTION,
  APP_NAME,
} from "@/constants/app";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <h1 className="text-5xl font-bold text-slate-900">
            {APP_NAME}
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Platform bantuan harian berbasis lokasi.
            Cari helper sekitar untuk task kecil
            sehari-hari dengan cepat dan mudah.
          </p>

          <div className="mt-8 flex gap-4">
            <Link href="/register">
              <Button>
                Mulai Sekarang
              </Button>
            </Link>

            <Link href="/login">
              <Button variant="outline">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}