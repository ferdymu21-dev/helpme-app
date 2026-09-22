import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  Camera,
} from "lucide-react";

interface LandingFooterProps {
  caraKerjaHref: string;
  kategoriHref: string;
  keamananHref: string;
  faqHref: string;
}

const instagramHref =
  "https://www.instagram.com/idn.helpme?igsi=MWdoNnEzOGQyeGk5cA==";

export default function LandingFooter({
  caraKerjaHref,
  kategoriHref,
  keamananHref,
  faqHref,
}: LandingFooterProps) {
  return (
    <footer
      className="
        border-t
        border-slate-200
        bg-slate-950
        px-4
        pb-6
        pt-10
        text-white
        sm:px-5
        lg:px-8
        lg:pb-8
        lg:pt-14
      "
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="
            grid
            gap-9
            lg:grid-cols-[1.2fr_1.8fr]
            lg:gap-16
          "
        >
          {/* BRAND */}
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
                className="
                  h-auto
                  w-28
                  brightness-0
                  invert
                  lg:w-32
                "
              />
            </Link>

            <p
              className="
                mt-4
                max-w-sm
                text-sm
                leading-6
                text-slate-400
                lg:text-base
                lg:leading-7
              "
            >
              Platform untuk menemukan
              bantuan sehari-hari atau
              menawarkan jasa yang relevan
              dengan kebutuhan di sekitarmu.
            </p>

            <a
              href={instagramHref}
              target="_blank"
              rel="noreferrer"
              className="
                mt-6
                inline-flex
                items-center
                gap-2.5
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-3.5
                py-2.5
                text-xs
                font-bold
                text-slate-300
                transition
                hover:border-white/20
                hover:bg-white/10
                hover:text-white
              "
            >
              <Camera
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={2}
              />

              Instagram

              <ArrowUpRight
                aria-hidden="true"
                className="
                  h-3.5
                  w-3.5
                  text-slate-500
                "
              />
            </a>
          </div>

          {/* LINKS */}
          <div
            className="
              grid
              grid-cols-2
              gap-x-6
              gap-y-8
              sm:grid-cols-3
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.13em]
                  text-slate-500
                "
              >
                Produk
              </p>

              <div
                className="
                  mt-4
                  flex
                  flex-col
                  items-start
                  gap-3
                "
              >
                <Link
                  href="/tasks/create"
                  className="
                    text-xs
                    font-semibold
                    text-slate-300
                    transition
                    hover:text-white
                    lg:text-sm
                  "
                >
                  Buat Permintaan
                </Link>

                <Link
                  href="/services"
                  className="
                    text-xs
                    font-semibold
                    text-slate-300
                    transition
                    hover:text-white
                    lg:text-sm
                  "
                >
                  Cari Jasa
                </Link>

                <Link
                  href="/my-services/new"
                  className="
                    text-xs
                    font-semibold
                    text-slate-300
                    transition
                    hover:text-white
                    lg:text-sm
                  "
                >
                  Tawarkan Jasa
                </Link>
              </div>
            </div>

            <div>
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.13em]
                  text-slate-500
                "
              >
                Jelajahi
              </p>

              <div
                className="
                  mt-4
                  flex
                  flex-col
                  items-start
                  gap-3
                "
              >
                <Link
                  href={caraKerjaHref}
                  className="
                    text-xs
                    font-semibold
                    text-slate-300
                    transition
                    hover:text-white
                    lg:text-sm
                  "
                >
                  Cara Kerja
                </Link>

                <Link
                  href={kategoriHref}
                  className="
                    text-xs
                    font-semibold
                    text-slate-300
                    transition
                    hover:text-white
                    lg:text-sm
                  "
                >
                  Kebutuhan Harian
                </Link>

                <Link
                  href={keamananHref}
                  className="
                    text-xs
                    font-semibold
                    text-slate-300
                    transition
                    hover:text-white
                    lg:text-sm
                  "
                >
                  Keamanan
                </Link>

                <Link
                  href={faqHref}
                  className="
                    text-xs
                    font-semibold
                    text-slate-300
                    transition
                    hover:text-white
                    lg:text-sm
                  "
                >
                  FAQ
                </Link>
              </div>
            </div>

            <div>
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.13em]
                  text-slate-500
                "
              >
                Akun
              </p>

              <div
                className="
                  mt-4
                  flex
                  flex-col
                  items-start
                  gap-3
                "
              >
                <Link
                  href="/login"
                  className="
                    text-xs
                    font-semibold
                    text-slate-300
                    transition
                    hover:text-white
                    lg:text-sm
                  "
                >
                  Masuk
                </Link>

                <Link
                  href="/register"
                  className="
                    text-xs
                    font-semibold
                    text-slate-300
                    transition
                    hover:text-white
                    lg:text-sm
                  "
                >
                  Buat Akun
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          className="
            mt-10
            flex
            flex-col
            gap-3
            border-t
            border-white/10
            pt-5
            sm:flex-row
            sm:items-center
            sm:justify-between
            lg:mt-12
          "
        >
          <p
            className="
              text-[10px]
              leading-5
              text-slate-500
              lg:text-xs
            "
          >
            © 2026 HelpMe. Dibuat untuk
            membantu kebutuhan sehari-hari
            menjadi lebih mudah ditemukan.
          </p>

          <p
            className="
              text-[10px]
              text-slate-600
              lg:text-xs
            "
          >
            Bantuan dekat, koneksi lebih mudah.
          </p>
        </div>
      </div>
    </footer>
  );
}