"use client";

import { useRouter } from "next/navigation";

interface Props {
  title: string;
  subtitle?: string;
}

export default function AppHeader({
  title,
  subtitle,
}: Props) {
  const router = useRouter();

  return (
    <div
      className="
        sticky
        top-0
        z-40
        border-b
        bg-white/90
        backdrop-blur
      "
    >
      <div className="p-4">
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={() =>
              router.push("/profile")
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-indigo-100
              text-sm
              font-bold
              text-indigo-700
            "
          >
            HM
          </button>
        </div>
      </div>
    </div>
  );
}