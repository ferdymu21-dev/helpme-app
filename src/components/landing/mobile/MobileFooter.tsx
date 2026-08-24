import Image from "next/image";

import Link from "next/link";

import {
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

export default function MobileFooter() {
  return (
    <footer
      className="
        border-t
        border-slate-200
        bg-white
        px-5
        pb-8
        pt-10
      "
    >
      {/* =========================
          BRAND
      ========================= */}
      <Link
        href="/"
        aria-label="HelpMe"
        className="inline-flex"
      >
        <Image
          src="/logo_brand.svg"
          alt="HelpMe"
          width={112}
          height={40}
          className="h-auto w-27"
        />
      </Link>

      <p
        className="
          mt-4
          max-w-xs
          text-xs
          leading-6
          text-slate-500
        "
      >
        Menghubungkan kebutuhan harian dengan orang
        di sekitar yang siap membantu.
      </p>

      <div
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          rounded-full
          bg-indigo-50
          px-3
          py-2
          text-[10px]
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

      {/* =========================
          LINKS
      ========================= */}
      <div
        className="
          mt-8
          grid
          grid-cols-2
          gap-8
        "
      >
        {/* PLATFORM */}
        <div>
          <p
            className="
              text-[10px]
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
              mt-4
              flex
              flex-col
              gap-3
            "
          >
            <Link
              href="#cara-kerja-mobile"
              className="
                text-xs
                font-semibold
                text-slate-600
              "
            >
              Cara Kerja
            </Link>

            <Link
              href="#kategori-mobile"
              className="
                text-xs
                font-semibold
                text-slate-600
              "
            >
              Kategori
            </Link>

            <Link
              href="#keamanan-mobile"
              className="
                text-xs
                font-semibold
                text-slate-600
              "
            >
              Keamanan
            </Link>

            <Link
              href="#faq-mobile"
              className="
                text-xs
                font-semibold
                text-slate-600
              "
            >
              FAQ
            </Link>
          </div>
        </div>

        {/* ACCOUNT */}
        <div>
          <p
            className="
              text-[10px]
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
              mt-4
              flex
              flex-col
              gap-3
            "
          >
            <Link
              href="/login"
              className="
                text-xs
                font-semibold
                text-slate-600
              "
            >
              Masuk
            </Link>

            <Link
              href="/register"
              className="
                text-xs
                font-semibold
                text-slate-600
              "
            >
              Daftar
            </Link>

            <Link
              href="/register"
              className="
                text-xs
                font-semibold
                text-slate-600
              "
            >
              Jadi Helper
            </Link>
          </div>
        </div>
      </div>

      {/* =========================
          SOCIAL MEDIA
      ========================= */}
      <div
        className="
          mt-8
          border-t
          border-slate-100
          pt-6
        "
      >
        <div
          className="
            flex
            items-end
            justify-between
            gap-5
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[10px]
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
                mt-2
                max-w-45
                text-[10px]
                leading-5
                text-slate-500
              "
            >
              Temukan informasi dan perkembangan
              terbaru HelpMe.
            </p>
          </div>

          <div
            className="
              flex
              shrink-0
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
                    shadow-sm
                    transition
                    active:scale-95
                    active:border-indigo-200
                    active:bg-indigo-50
                    active:text-indigo-600
                  "
                >
                  <Icon
                    className="h-4.5 w-4.5"
                    strokeWidth={2}
                  />
                </Link>
              ),
            )}
          </div>
        </div>

        <div
          className="
            mt-4
            flex
            items-center
            gap-3
            text-[9px]
            font-semibold
            text-slate-400
          "
        >
          <span>Instagram</span>

          <span>•</span>

          <span>TikTok</span>

          <span>•</span>

          <span>Threads</span>
        </div>
      </div>

      {/* =========================
          COPYRIGHT
      ========================= */}
      <div
        className="
          mt-6
          border-t
          border-slate-100
          pt-5
        "
      >
        <p
          className="
            text-[10px]
            leading-5
            text-slate-400
          "
        >
          © 2026 HelpMe. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}