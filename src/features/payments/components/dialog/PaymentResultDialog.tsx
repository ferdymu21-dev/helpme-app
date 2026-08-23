"use client";

import {
  BadgeCheck,
  CircleAlert,
  CircleX,
  Clock3,
  Copy,
  CreditCard,
  FileText,
  ShieldCheck,
  X,
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

    subtitle: "Terima kasih! Pembayaran Anda telah berhasil diterima.",

    badge: "Berhasil",

    icon: BadgeCheck,

    iconBg: "bg-emerald-100",

    iconColor: "text-emerald-600",

    badgeClass: "bg-emerald-100 text-emerald-700",

    primaryButton: "Tutup",
  },

  FAILED: {
    title: "Pembayaran Gagal",

    subtitle: "Pembayaran tidak berhasil diproses. Silakan coba kembali.",

    badge: "Gagal",

    icon: CircleX,

    iconBg: "bg-red-100",

    iconColor: "text-red-600",

    badgeClass: "bg-red-100 text-red-700",
    primaryButton: "Coba Lagi",
  },

  PENDING: {
    title: "Menunggu Pembayaran",

    subtitle: "Silakan selesaikan pembayaran agar transaksi dapat diproses.",

    badge: "Pending",

    icon: Clock3,

    iconBg: "bg-amber-100",

    iconColor: "text-amber-600",

    badgeClass: "bg-amber-100 text-amber-700",

    primaryButton: "Saya Sudah Bayar",
  },

  EXPIRED: {
    title: "Pembayaran Kedaluwarsa",

    subtitle: "Waktu pembayaran telah habis. Silakan buat transaksi baru.",

    badge: "Expired",

    icon: CircleAlert,

    iconBg: "bg-slate-100",

    iconColor: "text-slate-600",

    badgeClass: "bg-slate-200 text-slate-700",
    primaryButton: "Buat Transaksi Baru",
  },

  CANCELLED: {
    title: "Pembayaran Dibatalkan",

    subtitle:
      "Transaksi telah dibatalkan. Anda dapat membuat pembayaran baru kapan saja.",

    badge: "Cancelled",

    icon: CircleAlert,

    iconBg: "bg-slate-100",

    iconColor: "text-slate-600",

    badgeClass: "bg-slate-200 text-slate-700",

    primaryButton: "Tutup",
  },
} satisfies Record<
  Exclude<PaymentResultStatus, "IDLE">,
  {
    title: string;

    subtitle: string;

    badge: string;

    icon: typeof BadgeCheck;

    iconBg: string;

    iconColor: string;

    badgeClass: string;

    primaryButton: string;
  }
>;

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

  const Icon = ui.icon;

  const showViewTaskButton =
    status === "SUCCESS" && paymentType === "URGENT_TASK" && !!taskId;

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
            bg-slate-950/40
              backdrop-blur-[2px]
              sm:items-center
            "
    >
      <div
        className="
                    flex
                    min-h-full
                    items-end
                    justify-center
                    p-4
                    sm:items-center
                "
      >
        <div
          className="
                      w-full
                      max-w-97.5
                      max-h-[90vh]
                      overflow-y-auto
                      rounded-[28px]
                    bg-white
                      shadow-[0_24px_80px_rgba(15,23,42,.18)]
                      animate-support-modal
                    "
        >
          {/* Header */}

          <div
            className="
                        relative
                        overflow-hidden
                        bg-linear-to-b
                        from-primary-100
                        to-white
                        px-6
                        pt-8
                        pb-6
                    "
          >
            <button
              type="button"
              onClick={onClose}
              className="
                              absolute
                              right-4
                              top-4
                              rounded-full
                              p-2
                            text-slate-500
                              transition
                            hover:bg-slate-100
                        "
            >
              <X size={18} />
            </button>

            <div
              className={`
                              mx-auto
                              flex
                              h-20
                              w-20
                              items-center
                              justify-center
                              rounded-full
                              shadow-sm
                              ring-8
                            ring-white
                              ${ui.iconBg}
                            `}
            >
              <Icon size={42} className={ui.iconColor} />
            </div>

            <div
              className="
                            mt-6
                            flex
                            justify-center
                        "
            >
              <span
                className={`
                                rounded-full
                                px-4
                                py-1.5
                                text-xs
                                font-semibold
                                ${ui.badgeClass}
                            `}
              >
                {ui.badge}
              </span>
            </div>

            <h2
              className="
                            mt-4
                            text-center
                            text-2xl
                            font-bold
                            text-text-main
                        "
            >
              {ui.title}
            </h2>

            <p
              className="
                            mt-3
                            text-center
                            text-sm
                            leading-6
                            text-text-soft
                        "
            >
              {ui.subtitle}
            </p>
          </div>

          {/* Transaction Card */}

          <div className="px-6">
            <div
              className="
                            rounded-3xl
                            border
                            border-border
                            bg-white
                            p-5
                            shadow-sm
                        "
            >
              <div
                className="
                                flex
                                items-center
                                justify-between
                            "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-white
                                    "
                  >
                    <BadgeCheck
                      size={20}
                      className="
                                            text-primary-600
                                        "
                    />
                  </div>

                  <div>
                    <p
                      className="
                                            text-xs
                                            text-text-soft
                                        "
                    >
                      Status
                    </p>

                    <p
                      className="
                                            font-semibold
                                            text-text-main
                                        "
                    >
                      {ui.badge}
                    </p>
                  </div>
                </div>

                <span
                  className={`
                                    rounded-full
                                    px-3
                                    py-1
                                    text-xs
                                    font-semibold
                                    ${ui.badgeClass}
                                `}
                >
                  {status}
                </span>
              </div>

              <div
                className="
                                my-5
                                border-t
                                border-dashed
                            "
              />

              <div
                className="
                                flex
                                items-center
                                gap-3
                            "
              >
                <div
                  className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-white
                                "
                >
                  <CreditCard
                    size={20}
                    className="
                                        text-primary-600
                                    "
                  />
                </div>

                <div>
                  <p
                    className="
                                        text-xs
                                        text-text-soft
                                    "
                  >
                    Nominal Pembayaran
                  </p>

                  <h3
                    className="
                                        text-xl
                                        font-bold
                                        text-text-main
                                    "
                  >
                    Rp {amount.toLocaleString("id-ID")}
                  </h3>
                </div>
              </div>

              <div
                className="
                                my-5
                                border-t
                                border-dashed
                            "
              />

              <div
                className="
                                flex
                                items-start
                                gap-3
                            "
              >
                <div
                  className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-white
                                "
                >
                  <FileText size={20} className="text-primary-600" />
                </div>

                <div className="flex-1">
                  <p
                    className="
                                        text-xs
                                        text-text-soft
                                    "
                  >
                    Order ID
                  </p>

                  <div
                    className="
                                        mt-2
                                        flex
                                        items-center
                                        gap-2
                                    "
                  >
                    <code
                      className="
                                            flex-1
                                            break-all
                                            rounded-xl
                                            bg-white
                                            px-3
                                            py-2
                                            text-xs
                                            font-mono
                                            text-slate-700
                                        "
                    >
                      {orderId}
                    </code>

                    <button
                      type="button"
                      aria-label="Salin Order ID"
                      onClick={copyOrderId}
                      className="
                                            flex
                                            h-10
                                            w-10
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-primary-100
                                            text-primary-600
                                            transition
                                            hover:bg-primary-600
                                            hover:text-white
                                        "
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}

            <div
              className="
                            mt-5
                            rounded-2xl
                            border
                            border-primary-100
                            bg-primary-100/50
                            p-4
                        "
            >
              <div
                className="
                                flex
                                items-start
                                gap-3
                            "
              >
                <ShieldCheck
                  size={20}
                  className="
                                    mt-0.5
                                    text-primary-600
                                "
                />

                <div>
                  <p
                    className="
                                        text-sm
                                        font-semibold
                                        text-text-main
                                    "
                  >
                    Simpan Order ID
                  </p>

                  <p
                    className="
                                        mt-1
                                        text-xs
                                        leading-5
                                        text-text-soft
                                    "
                  >
                    Order ID dapat digunakan sebagai referensi apabila terjadi
                    kendala pada transaksi Anda.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}

            <div
              className="
                            mt-6
                            flex
                            gap-3
                            pb-6
                        "
            >
              <button
                type="button"
                onClick={onHistory}
                className="
                                flex-1
                                rounded-2xl
                                border
                                border-border
                                bg-white
                                py-3.5
                                font-semibold
                                text-slate-700
                                transition
                                hover:bg-slate-100
                            "
              >
                Riwayat
              </button>

              <button
                type="button"
                aria-label="Tutup dialog"
                onClick={() => {
                  if (showViewTaskButton && taskId && onViewTask) {
                    onViewTask(taskId);

                    return;
                  }

                  onClose();
                }}
                className="
        flex-1
        rounded-2xl
        bg-primary-600
        py-3.5
        font-semibold
        text-white
        shadow-[0_12px_32px_rgba(49,46,252,.18)]
        transition-all
        duration-200
        hover:bg-primary-500
        hover:scale-[1.02]
        active:scale-[.98]
    "
              >
                {showViewTaskButton ? "Lihat Task" : ui.primaryButton}
              </button>
            </div>

            {/* Footer */}

            <div
              className="
                            border-t
                            border-border
                            py-4
                            text-center
                        "
            >
              <div
                className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                bg-slate-100
                                px-3
                                py-1.5
                            "
              >
                <ShieldCheck size={14} className="text-emerald-600" />

                <span
                  className="
                                    text-xs
                                    font-medium
                                    text-text-soft
                                "
                >
                  Transaksi aman • HelpMe
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}