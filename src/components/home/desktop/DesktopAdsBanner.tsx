"use client";

import { useEffect, useRef, useState } from "react";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  button_text: string;
  link_url: string;
}

const AUTO_SLIDE_INTERVAL = 30000;
const MIN_SWIPE_DISTANCE = 50;
const QUALIFIED_IMPRESSION_DELAY = 2000;

export default function DesktopAdsBanner() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const impressionTrackedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function loadAds() {
      try {
        const response = await fetch("/api/ads?position=home_desktop", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil iklan.");
        }

        const data = (await response.json()) as Ad[];

        setAds(data);
        setActiveIndex(0);
      } catch (error) {
        console.error("Desktop ads error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAds();
  }, []);

  /*
   * AUTO SLIDE, Iklan berganti setiap 30 detik.
   */
  useEffect(() => {
    if (ads.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => {
        return (prev + 1) % ads.length;
      });
    }, AUTO_SLIDE_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [ads.length]);

  /*
   * QUALIFIED IMPRESSION TRACKING
   *
   * Iklan harus tetap tampil selama minimal 2 detik
   * sebelum dihitung sebagai impression.
   *
   * Satu iklan hanya dihitung 1 impression
   * selama satu kali halaman ini dibuka.
   */
  useEffect(() => {
    const activeAd = ads[activeIndex];

    if (!activeAd) {
      return;
    }

    /*
     * Jika iklan ini sudah pernah mendapatkan
     * qualified impression dalam sesi halaman ini,
     * jangan hitung lagi.
     */
    if (impressionTrackedIds.current.has(activeAd.id)) {
      return;
    }

    /*
     * Simpan ID iklan yang sedang menunggu
     * qualified impression.
     */
    const adId = activeAd.id;

    /*
     * Tunggu 2 detik sebelum mencatat impression.
     */
    const timeout = window.setTimeout(async () => {
      /*
       * Pastikan iklan masih merupakan iklan aktif
       * ketika waktu 2 detik selesai.
       */
      const currentAd = ads[activeIndex];

      if (!currentAd || currentAd.id !== adId) {
        return;
      }

      /*
       * Tandai sebelum request untuk mencegah
       * duplicate request.
       */
      impressionTrackedIds.current.add(adId);

      try {
        await fetch(`/api/ads/${adId}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_type: "impression",
          }),
        });
      } catch (error) {
        console.error("Gagal mencatat qualified impression iklan:", error);

        /*
         * Jika request gagal, izinkan retry.
         */
        impressionTrackedIds.current.delete(adId);
      }
    }, QUALIFIED_IMPRESSION_DELAY);

    /*
     * Jika activeIndex berubah sebelum 2 detik,
     * timer dibatalkan.
     */
    return () => {
      window.clearTimeout(timeout);
    };
  }, [activeIndex, ads]);

  /*
   * PINDAH KE IKLAN BERIKUTNYA
   */
  function goToNextAd() {
    if (ads.length <= 1) {
      return;
    }

    setActiveIndex((prev) => (prev + 1) % ads.length);
  }

  /*
   * PINDAH KE IKLAN SEBELUMNYA
   */
  function goToPreviousAd() {
    if (ads.length <= 1) {
      return;
    }

    setActiveIndex((prev) => (prev - 1 + ads.length) % ads.length);
  }

  /*
   * TOUCH START
   */
  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    dragStartX.current = event.touches[0]?.clientX ?? null;
  }

  /*
   * TOUCH END
   */
  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (dragStartX.current === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? null;

    if (endX === null) {
      dragStartX.current = null;
      return;
    }

    const distance = dragStartX.current - endX;

    if (Math.abs(distance) >= MIN_SWIPE_DISTANCE) {
      if (distance > 0) {
        goToNextAd();
      } else {
        goToPreviousAd();
      }
    }

    dragStartX.current = null;
  }

  /*
   * MOUSE DOWN
   */
  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    /*
     * Hanya tombol mouse kiri.
     */
    if (event.button !== 0) {
      return;
    }

    dragStartX.current = event.clientX;
    isDragging.current = true;
  }

  /*
   * MOUSE UP
   */
  function handleMouseUp(event: React.MouseEvent<HTMLDivElement>) {
    if (!isDragging.current || dragStartX.current === null) {
      return;
    }

    const distance = dragStartX.current - event.clientX;

    if (Math.abs(distance) >= MIN_SWIPE_DISTANCE) {
      if (distance > 0) {
        goToNextAd();
      } else {
        goToPreviousAd();
      }
    }

    dragStartX.current = null;
    isDragging.current = false;
  }

  /*
   * MOUSE LEAVE
   *
   * Jika mouse keluar dari banner
   * ketika sedang drag, batalkan gesture.
   */
  function handleMouseLeave() {
    dragStartX.current = null;
    isDragging.current = false;
  }

  if (loading || ads.length === 0) {
    return null;
  }

  const activeAd = ads[activeIndex] ?? ads[0];

  async function handleOpenAds() {
    try {
      await fetch(`/api/ads/${activeAd.id}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "click",
        }),
      });
    } catch (error) {
      console.error("Gagal mencatat click iklan:", error);
    }

    window.open(activeAd.link_url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="px-8 pt-8">
      <div
        className="
          relative
          h-55
          overflow-hidden
          rounded-4xl
          bg-slate-900
          shadow-xl
          select-none
          touch-pan-y
          cursor-grab
          active:cursor-grabbing
        "
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* IMAGE */}

        <img
          src={activeAd.image_url}
          alt={activeAd.title}
          draggable={false}
          className="
            pointer-events-none
            absolute
            right-0
            top-0
            h-full
            w-[45%]
            object-cover
          "
        />

        {/* CONTENT */}

        <div
          className="
            pointer-events-none
            relative
            flex
            h-full
            flex-col
            justify-between
            p-5
            text-white
          "
        >
          <div>
            {/* BADGE */}

            <div
              className="
                inline-flex
                rounded-full
                bg-white/20
                px-3
                py-1
                text-xs
                font-bold
              "
            >
              SPONSORED
            </div>
          </div>

          {/* BOTTOM */}

          <div className="flex items-center justify-between">
            {/* DOTS */}

            <div
              className="
                pointer-events-auto
                flex
                gap-2
              "
            >
              {ads.map((ad, index) => (
                <button
                  key={ad.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Tampilkan iklan ${index + 1}`}
                  className={`
                    h-2
                    rounded-full
                    transition-all
                    ${
                      activeIndex === index ? "w-8 bg-white" : "w-2 bg-white/40"
                    }
                  `}
                />
              ))}
            </div>

            {/* BUTTON */}

            <button
              type="button"
              onClick={handleOpenAds}
              className="
                pointer-events-auto
                rounded-2xl
                bg-white
                px-5
                py-2
                text-sm
                font-bold
                text-slate-900
                transition
                hover:scale-[1.02]
              "
            >
              {activeAd.button_text}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}