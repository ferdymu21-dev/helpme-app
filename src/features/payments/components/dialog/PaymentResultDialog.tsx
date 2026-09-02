"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  BadgeCheck,
  CircleAlert,
  CircleX,
  Clock3,
  Copy,
  FileText,
  ReceiptText,
  ShieldCheck,
  X,
  Zap,
  HeartHandshake,
  PartyPopper,
} from "lucide-react";

import type { PaymentResultStatus } from "../../types/paymentResult";

interface Props {
  open: boolean;
  status: PaymentResultStatus;
  amount: number;
  orderId: string;
  paymentType: "DONATION" | "URGENT_TASK" | null;
  taskId?: string | null;
  onClose: () => void;
  onHistory: () => void;
  onViewTask?: (taskId: string) => void;
}

const CONFIG = {
  SUCCESS: {
    title: "Pembayaran Berhasil",
    subtitle: "Pembayaran telah diterima dan transaksi berhasil diproses.",
    badge: "Berhasil",
    icon: BadgeCheck,
    iconBackground: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
    primaryButton: "Selesai",
  },

  FAILED: {
    title: "Pembayaran Gagal",
    subtitle: "Pembayaran belum berhasil diproses. Anda dapat mencoba kembali.",
    badge: "Gagal",
    icon: CircleX,
    iconBackground: "bg-rose-100",
    iconColor: "text-rose-600",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-100",
    primaryButton: "Coba Lagi",
  },

  PENDING: {
    title: "Menunggu Pembayaran",
    subtitle:
      "Transaksi masih menunggu penyelesaian atau konfirmasi pembayaran.",
    badge: "Menunggu",
    icon: Clock3,
    iconBackground: "bg-amber-100",
    iconColor: "text-amber-600",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
    primaryButton: "Saya Sudah Bayar",
  },

  EXPIRED: {
    title: "Pembayaran Kedaluwarsa",
    subtitle:
      "Batas waktu pembayaran telah berakhir. Silakan buat transaksi baru.",
    badge: "Kedaluwarsa",
    icon: CircleAlert,
    iconBackground: "bg-slate-100",
    iconColor: "text-slate-600",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    primaryButton: "Buat Transaksi Baru",
  },

  CANCELLED: {
    title: "Pembayaran Dibatalkan",
    subtitle:
      "Transaksi telah dibatalkan dan tidak akan diproses lebih lanjut.",
    badge: "Dibatalkan",
    icon: CircleAlert,
    iconBackground: "bg-slate-100",
    iconColor: "text-slate-600",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    primaryButton: "Tutup",
  },
} satisfies Record<
  Exclude<PaymentResultStatus, "IDLE">,
  {
    title: string;
    subtitle: string;
    badge: string;
    icon: typeof BadgeCheck;
    iconBackground: string;
    iconColor: string;
    badgeClass: string;
    primaryButton: string;
  }
>;

const CONFETTI_PARTICLES = [
  {
    className: "bg-rose-400",
    x: -38,
    y: -42,
    rotate: 180,
  },
  {
    className: "bg-indigo-400",
    x: -15,
    y: -52,
    rotate: 220,
  },
  {
    className: "bg-emerald-400",
    x: 18,
    y: -48,
    rotate: 200,
  },
  {
    className: "bg-violet-400",
    x: 38,
    y: -32,
    rotate: 230,
  },
  {
    className: "bg-sky-400",
    x: 45,
    y: -5,
    rotate: 170,
  },
  {
    className: "bg-yellow-400",
    x: -42,
    y: -12,
    rotate: 210,
  },
  {
    className: "bg-pink-400",
    x: 30,
    y: -45,
    rotate: 270,
  },
  {
    className: "bg-cyan-400",
    x: -28,
    y: -50,
    rotate: 240,
  },
] as const;

function SuccessCelebration() {
  const containerRef =
    useRef<HTMLDivElement>(
      null,
    );

  const iconRef =
    useRef<SVGSVGElement>(
      null,
    );

  useEffect(() => {
    const container =
      containerRef.current;

    const icon =
      iconRef.current;

    if (
      !container ||
      !icon
    ) {
      return;
    }

    const particles =
      Array.from(
        container.querySelectorAll<HTMLElement>(
          "[data-payment-confetti]",
        ),
      );

    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    if (reduceMotion) {
      particles.forEach(
        (particle) => {
          particle.style.display =
            "none";
        },
      );

      return;
    }

    const animations: Animation[] =
      [];

    const iconAnimation =
      icon.animate(
        [
          {
            transform:
              "rotate(-8deg) scale(1)",
          },
          {
            transform:
              "rotate(10deg) scale(1.12)",
            offset: 0.07,
          },
          {
            transform:
              "rotate(-5deg) scale(1.04)",
            offset: 0.14,
          },
          {
            transform:
              "rotate(7deg) scale(1.1)",
            offset: 0.21,
          },
          {
            transform:
              "rotate(-3deg) scale(1)",
            offset: 0.3,
          },
          {
            transform:
              "rotate(-8deg) scale(1)",
            offset: 1,
          },
        ],
        {
          duration: 2800,
          iterations: Infinity,
          easing:
            "ease-in-out",
        },
      );

    animations.push(
      iconAnimation,
    );

    particles.forEach(
      (
        particle,
        index,
      ) => {
        const config =
          CONFETTI_PARTICLES[
            index
          ];

        if (!config) {
          return;
        }

        const animation =
          particle.animate(
            [
              {
                opacity: 0,
                transform:
                  "translate(-50%, -50%) scale(0.4) rotate(0deg)",
              },
              {
                opacity: 1,
                transform:
                  "translate(-50%, -50%) scale(0.8) rotate(20deg)",
                offset: 0.1,
              },
              {
                opacity: 1,
                transform: `
                  translate(
                    ${config.x}px,
                    ${config.y}px
                  )
                  scale(1)
                  rotate(${config.rotate}deg)
                `,
                offset: 0.32,
              },
              {
                opacity: 0,
                transform: `
                  translate(
                    ${config.x * 1.08}px,
                    ${config.y + 13}px
                  )
                  scale(0.9)
                  rotate(${config.rotate + 70}deg)
                `,
                offset: 0.46,
              },
              {
                opacity: 0,
                transform: `
                  translate(
                    ${config.x * 1.08}px,
                    ${config.y + 13}px
                  )
                  scale(0.9)
                  rotate(${config.rotate + 70}deg)
                `,
                offset: 1,
              },
            ],
            {
              duration: 2800,
              iterations:
                Infinity,
              easing:
                "ease-out",
              delay:
                index * 18,
            },
          );

        animations.push(
          animation,
        );
      },
    );

    return () => {
      animations.forEach(
        (animation) => {
          animation.cancel();
        },
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="
        relative
        mx-auto
        h-20
        w-20
      "
      aria-hidden="true"
    >
      {/* SOFT GLOW */}
      <div
        className="
          absolute
          inset-1
          rounded-[26px]
          bg-amber-100/50
          blur-md
        "
      />

      {/* PARTY POPPER */}
      <div
        className="
          absolute
          inset-2
          flex
          items-center
          justify-center
          rounded-[22px]
          border
          border-amber-100
          bg-amber-50
          shadow-[0_8px_24px_rgba(245,158,11,0.12)]
        "
      >
        <PartyPopper
          ref={iconRef}
          className="
            h-9
            w-9
            text-amber-500
          "
          strokeWidth={2}
          style={{
            transformOrigin:
              "25% 75%",
          }}
        />
      </div>

      {/* CONFETTI */}
      {CONFETTI_PARTICLES.map(
        (
          particle,
          index,
        ) => (
          <span
            key={index}
            data-payment-confetti
            className={`
              absolute
              left-1/2
              top-1/2
              h-2
              w-1.5
              rounded-sm
              opacity-0
              ${particle.className}
            `}
          />
        ),
      )}
    </div>
  );
}

export default function PaymentResultDialog({
  open,
  status,
  amount,
  orderId,
  paymentType,
  taskId,
  onClose,
  onHistory,
  onViewTask,
}: Props) {
  if (!open || status === "IDLE") {
    return null;
  }

  const ui = CONFIG[status];
  const StatusIcon = ui.icon;

  const isUrgentTask = paymentType === "URGENT_TASK";

  const paymentLabel = isUrgentTask
    ? "Prioritas Task"
    : paymentType === "DONATION"
      ? "Dukungan HelpMe"
      : "Pembayaran";

  const amountLabel = isUrgentTask
    ? "Biaya prioritas"
    : paymentType === "DONATION"
      ? "Nominal dukungan"
      : "Nominal pembayaran";

  const PaymentIcon = isUrgentTask ? Zap : HeartHandshake;

  const showViewTaskButton = status === "SUCCESS" && isUrgentTask && !!taskId;

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
    } catch {
      console.error("Failed to copy Order ID");
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-end
        justify-center
        bg-slate-950/55
        backdrop-blur-sm
        sm:items-center
        sm:p-5
      "
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-result-title"
        className="
          animate-support-modal
          relative
          flex
          max-h-[94dvh]
          w-full
          max-w-md
          flex-col
          overflow-hidden
          rounded-t-[30px]
          border
          border-slate-200/80
          bg-white
          shadow-[0_30px_90px_rgba(15,23,42,0.26)]
          sm:max-h-[90vh]
          sm:rounded-[30px]
        "
      >
        {/* MOBILE HANDLE */}
        <div
          className="
            flex
            shrink-0
            justify-center
            pb-1
            pt-3
            sm:hidden
          "
        >
          <span
            className="
              h-1
              w-10
              rounded-full
              bg-slate-200
            "
          />
        </div>

        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dialog pembayaran"
          className="
            absolute
            right-4
            top-4
            z-10
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white/90
            text-slate-400
            shadow-sm
            backdrop-blur
            transition
            hover:bg-slate-50
            hover:text-slate-700
          "
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
          "
        >
          {/* RESULT HERO */}
          <div
            className="
              px-6
              pb-5
              pt-8
              text-center
              sm:pt-9
            "
          >
            {status === "SUCCESS" ? (
              <SuccessCelebration />
            ) : (
              <div
                className={`
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-[22px]
                  ${ui.iconBackground}
                `}
              >
                <StatusIcon
                  className={`
                    h-8
                    w-8
                    ${ui.iconColor}
                  `}
                  strokeWidth={2}
                />
              </div>
            )}

            <div
              className="mt-4 flex justify-center">
              <span
                className={`
                  inline-flex
                  h-7
                  items-center
                  rounded-full
                  border
                  px-3
                  text-[10px]
                  font-black
                  ${ui.badgeClass}
                `}
              >
                {ui.badge}
              </span>
            </div>

            <h2
              id="payment-result-title"
              className="
                mt-3
                text-base
                font-black
                tracking-tight
                text-slate-950
                sm:text-2xl
              "
            >
              {ui.title}
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-sm
                text-xs
                leading-5
                text-slate-500
              "
            >
              {ui.subtitle}
            </p>
          </div>

          {/* AMOUNT */}
          <div
            className="
              mx-5
              rounded-3xl
              border
              border-slate-200
              bg-slate-50/70
              px-5
              py-5
              text-center
              sm:mx-6
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-slate-500
              "
            >
              {amountLabel}
            </p>

            <p
              className="
                mt-1
                text-2xl
                font-black
                tracking-tight
                text-green-500
              "
            >
              Rp {amount.toLocaleString("id-ID")}
            </p>

            <div
              className="
                mt-4
                flex
                items-center
                justify-center
                gap-2
                text-[10px]
                font-semibold
                text-slate-500
              "
            >
              <PaymentIcon
                className="
                  h-3.5
                  w-3.5
                  text-indigo-500
                "
                strokeWidth={2}
              />

              {paymentLabel}
            </div>
          </div>

          {/* TRANSACTION SUMMARY */}
          <div
            className="
              mx-5
              mt-4
              rounded-[22px]
              border
              border-slate-200
              bg-white
              p-4
              sm:mx-6
            "
          >
            <div
              className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-50
                  text-indigo-600
                "
              >
                <ReceiptText className="h-4 w-4" strokeWidth={2} />
              </div>

              <div
                className="min-w-0 flex-1">
                <p
                  className="text-[10px] text-slate-400">
                  Jenis transaksi
                </p>

                <p
                  className="mt-0.5 text-xs font-bold text-slate-800">
                  {paymentLabel}
                </p>
              </div>

              <span
                className={`
                  inline-flex
                  h-7
                  items-center
                  rounded-full
                  border
                  px-2.5
                  text-[9px]
                  font-bold
                  ${ui.badgeClass}
                `}
              >
                {ui.badge}
              </span>
            </div>

            <div
              className="my-4 border-t border-dashed border-slate-200"
            />

            <div
              className="flex items-start gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-100
                  text-slate-500
                "
              >
                <FileText className="h-4 w-4" strokeWidth={2} />
              </div>

              <div
                className="min-w-0 flex-1">
                <p
                  className="text-[10px] text-slate-400">
                  Order ID
                </p>

                <div
                  className="
                    mt-1
                    flex
                    items-center
                    gap-2
                  "
                >
                  <code
                    className="
                      min-w-0
                      flex-1
                      break-all
                      text-[10px]
                      font-semibold
                      text-slate-700
                    "
                  >
                    {orderId}
                  </code>

                  <button
                    type="button"
                    onClick={copyOrderId}
                    aria-label="Salin Order ID"
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-slate-50
                      text-slate-400
                      transition
                      hover:bg-indigo-50
                      hover:text-indigo-600
                    "
                  >
                    <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TRUST NOTE */}
          <div
            className="
              mx-5
              mb-5
              mt-4
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-emerald-100
              bg-emerald-50/60
              px-4
              py-3
              sm:mx-6
            "
          >
            <ShieldCheck
              className="
                mt-0.5
                h-4
                w-4
                shrink-0
                text-emerald-600
              "
              strokeWidth={2}
            />

            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  text-emerald-900
                "
              >
                Informasi transaksi tersimpan
              </p>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  leading-4
                  text-emerald-700
                "
              >
                Simpan Order ID sebagai referensi apabila Anda memerlukan
                bantuan terkait transaksi ini.
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div
          className="
            shrink-0
            border-t
            border-slate-100
            bg-white
            px-5
            pb-5
            pt-4
            sm:px-6
          "
        >
          <div
            className="
              flex
              flex-col-reverse
              gap-2.5
              sm:flex-row
            "
          >
            <button
              type="button"
              onClick={onHistory}
              className="
                h-11
                flex-1
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
                py-2
                text-xs
                font-bold
                text-slate-600
                transition
                hover:bg-slate-50
              "
            >
              Lihat Riwayat
            </button>

            <button
              type="button"
              onClick={() => {
                if (showViewTaskButton && taskId && onViewTask) {
                  onViewTask(taskId);

                  return;
                }

                onClose();
              }}
              className="
                h-11
                flex-1
                rounded-2xl
                bg-indigo-600
                px-4
                py-2
                text-xs
                font-black
                text-white
                shadow-[0_8px_22px_rgba(79,70,229,0.18)]
                transition
                hover:bg-indigo-700
                active:scale-[0.99]
              "
            >
              {showViewTaskButton ? "Lihat Task" : ui.primaryButton}
            </button>
          </div>

          <div
            className="
              mt-3
              flex
              items-center
              justify-center
              gap-1.5
              text-[9px]
              font-medium
              text-slate-400
            "
          >
            <ShieldCheck className="h-3 w-3" strokeWidth={2} />
            Transaksi aman • HelpMe
          </div>
        </div>
      </div>
    </div>
  );
}