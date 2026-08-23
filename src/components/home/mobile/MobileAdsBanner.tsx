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

export default function MobileAdsBanner() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const impressionTrackedIds = useRef<Set<string>>(new Set());

  /*
   * LOAD ADS
   */
  useEffect(() => {
    async function loadAds() {
      try {
        const response = await fetch("/api/ads?position=home_mobile", {
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
        console.error("Mobile ads error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAds();
  }, []);

  /*
   * AUTO SLIDE
   *
   * Iklan berganti setiap 30 detik.
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
      console.error(
        "Gagal mencatat qualified impression iklan:",
        error,
      );

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
   * TOUCH START
   */
  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;

    touchEndX.current = null;
  }

  /*
   * TOUCH END
   */
  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    touchEndX.current = event.changedTouches[0]?.clientX ?? null;

    if (
      touchStartX.current === null ||
      touchEndX.current === null ||
      ads.length <= 1
    ) {
      touchStartX.current = null;
      touchEndX.current = null;

      return;
    }

    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) < MIN_SWIPE_DISTANCE) {
      touchStartX.current = null;
      touchEndX.current = null;

      return;
    }

    /*
     * Swipe kiri
     * → iklan berikutnya
     */
    if (distance > 0) {
      setActiveIndex((prev) => (prev + 1) % ads.length);
    } else {

    /*
     * Swipe kanan
     * → iklan sebelumnya
     */
      setActiveIndex((prev) => (prev - 1 + ads.length) % ads.length);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  if (loading || ads.length === 0) {
    return null;
  }

  const activeAd = ads[activeIndex] ?? ads[0];

  /*
   * CLICK TRACKING
   *
   * Catat click terlebih dahulu,
   * kemudian buka link iklan.
   */
  async function handleOpenAds(ad: Ad) {
  try {
    await fetch(`/api/ads/${ad.id}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: "click",
      }),
      keepalive: true,
    });
  } catch (error) {
    console.error("Ad click tracking error:", error);
  }

  window.open(
    ad.link_url,
    "_blank",
    "noopener,noreferrer",
  );
}

  return (
    <section className="mt-2 px-6">
      <div
        className="
          relative
          h-45
          overflow-hidden
          rounded-3xl
          bg-slate-900
          shadow-lg
          touch-pan-y
        "
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* IMAGE */}

        <img
          src={activeAd.image_url}
          alt={activeAd.title}
          draggable={false}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
        />

        {/* CONTENT */}

        <div
          className="
            relative
            flex
            h-full
            flex-col
            justify-between
            px-3
            pb-4
            pt-1.5
            text-white
          "
        >
          <div>
            {/* BADGE */}

            <div
              className="
                relative
                inline-flex
                rounded-full
                border
                border-black/10
                bg-white/20
                px-1
                py-0.5
                text-[8px]
                text-slate-900
              "
            >
              Sponsored
            </div>
          </div>

          {/* BUTTON */}

          <button
            type="button"
            onClick={() => handleOpenAds(activeAd)}
            className="
              w-fit
              rounded-2xl
              border
              border-black/10
              bg-white
              px-2
              py-1
              text-[10px]
              font-bold
              text-slate-900
              active:scale-[0.98]
            "
          >
            {activeAd.button_text}
          </button>
        </div>

        {/* DOTS */}

        {ads.length > 1 && (
          <div
            className="
              absolute
              bottom-2
              left-1/2
              flex
              -translate-x-1/2
              gap-1.5
            "
          >
            {ads.map((ad, index) => (
              <button
                key={ad.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Tampilkan iklan ${index + 1}`}
                className={`
                  h-1.5
                  rounded-full
                  transition-all
                  ${
                    activeIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }
                `}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}