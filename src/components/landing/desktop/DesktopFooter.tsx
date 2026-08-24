import Image from "next/image";

import Link from "next/link";

import {
  ArrowUpRight,
  AtSign,
  HeartHandshake,
  Camera,
  Music2,
} from "lucide-react";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/idn.helpme?igsi=MWdoNnEzOGQyeGk5cA==",
    icon: Camera,
  },
  {
    label: "TikTok",
    href: "#",
    icon: Music2,
  },
  {
    label: "Threads",
    href: "#",
    icon: AtSign,
  },
];

export default function DesktopFooter() {
  return (
    <footer
      className="
        border-t
        border-slate-200
        bg-white
        px-8
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          py-14
        "
      >
        <div
          className="
            grid
            grid-cols-[1.4fr_0.55fr_0.55fr_0.8fr]
            gap-12
          "
        >
          {/* =========================
              BRAND
          ========================= */}
          <div>
            <Link
              href="/"
              aria-label="HelpMe"
              className="inline-flex"
            >
              <Image
                src="/logo_brand.svg"
                alt="HelpMe"
                width={132}
                height={48}
                className="h-auto w-32"
              />
            </Link>

            <p
              className="
                mt-5
                max-w-sm
                text-sm
                leading-7
                text-slate-500
              "
            >
              Platform untuk menghubungkan kebutuhan
              harian dengan orang di sekitar yang siap
              membantu.
            </p>

            <div
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-indigo-50
                px-3
                py-2
                text-xs
                font-bold
                text-indigo-700
              "
            >
              <HeartHandshake
                className="h-4 w-4"
                strokeWidth={2}
              />

              Bantuan kecil bisa berarti besar
            </div>
          </div>

          {/* =========================
              PLATFORM
          ========================= */}
          <div>
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.16em]
                text-slate-400
              "
            >
              Platform
            </p>

            <div
              className="
                mt-5
                flex
                flex-col
                gap-4
              "
            >
              <Link
                href="#cara-kerja"
                className="
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:text-indigo-600
                "
              >
                Cara Kerja
              </Link>

              <Link
                href="#kategori"
                className="
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:text-indigo-600
                "
              >
                Kategori
              </Link>

              <Link
                href="#keamanan"
                className="
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:text-indigo-600
                "
              >
                Keamanan
              </Link>

              <Link
                href="#faq"
                className="
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:text-indigo-600
                "
              >
                FAQ
              </Link>
            </div>
          </div>

          {/* =========================
              ACCOUNT
          ========================= */}
          <div>
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.16em]
                text-slate-400
              "
            >
              Akun
            </p>

            <div
              className="
                mt-5
                flex
                flex-col
                gap-4
              "
            >
              <Link
                href="/login"
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:text-indigo-600
                "
              >
                Masuk

                <ArrowUpRight
                  className="h-3.5 w-3.5"
                  strokeWidth={2}
                />
              </Link>

              <Link
                href="/register"
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:text-indigo-600
                "
              >
                Daftar

                <ArrowUpRight
                  className="h-3.5 w-3.5"
                  strokeWidth={2}
                />
              </Link>

              <Link
                href="/register"
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:text-indigo-600
                "
              >
                Jadi Helper

                <ArrowUpRight
                  className="h-3.5 w-3.5"
                  strokeWidth={2}
                />
              </Link>
            </div>
          </div>

          {/* =========================
              SOCIAL MEDIA
          ========================= */}
          <div>
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.16em]
                text-slate-400
              "
            >
              Ikuti HelpMe
            </p>

            <p
              className="
                mt-5
                text-xs
                leading-6
                text-slate-500
              "
            >
              Ikuti informasi dan perkembangan terbaru
              dari HelpMe.
            </p>

            <div
              className="
                mt-5
                flex
                flex-wrap
                gap-2
              "
            >
              {socialLinks.map(
                ({
                  label,
                  href,
                  icon: Icon,
                }) => (
                  <Link
                    key={label}
                    href={href}
                    aria-label={label}
                    title={label}
                    className="
                      group
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      text-slate-500
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:border-indigo-200
                      hover:bg-indigo-50
                      hover:text-indigo-600
                      hover:shadow-sm
                    "
                  >
                    <Icon
                      className="
                        h-4.5
                        w-4.5
                        transition-transform
                        group-hover:scale-105
                      "
                      strokeWidth={2}
                    />
                  </Link>
                ),
              )}
            </div>

            <p
              className="
                mt-4
                text-[10px]
                leading-5
                text-slate-400
              "
            >
              Instagram, TikTok, dan Threads resmi
              HelpMe.
            </p>
          </div>
        </div>

        {/* =========================
            BOTTOM
        ========================= */}
        <div
          className="
            mt-12
            flex
            items-center
            justify-between
            gap-8
            border-t
            border-slate-100
            pt-6
          "
        >
          <p
            className="
              text-xs
              text-slate-400
            "
          >
            © 2026 HelpMe. Semua hak dilindungi.
          </p>

          <p
            className="
              max-w-xl
              text-right
              text-xs
              leading-5
              text-slate-400
            "
          >
            Dibuat untuk menghubungkan orang yang
            membutuhkan bantuan dengan orang yang siap
            membantu.
          </p>
        </div>
      </div>
    </footer>
  );
}