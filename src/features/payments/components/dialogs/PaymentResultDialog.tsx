import type {

    PaymentResultStatus,

} from "../../types/paymentResult";

interface Props {

    open: boolean;

    status: PaymentResultStatus;

    amount: number;

    orderId: string;

    onClose: () => void;

    onHistory: () => void;

}

const CONFIG = {

    SUCCESS: {

        emoji: "🎉",

        title: "Terima Kasih!",

        message:

            "Pembayaran berhasil diterima.",

        badge:

            "bg-green-100 text-green-700",

    },

    FAILED: {

        emoji: "❌",

        title: "Pembayaran Gagal",

        message:

            "Silakan coba kembali.",

        badge:

            "bg-red-100 text-red-700",

    },

    PENDING: {

        emoji: "⏳",

        title: "Menunggu Pembayaran",

        message:

            "Silakan selesaikan pembayaran.",

        badge:

            "bg-yellow-100 text-yellow-700",

    },

    EXPIRED: {

        emoji: "⌛",

        title: "Pembayaran Kedaluwarsa",

        message:

            "Silakan buat transaksi baru.",

        badge:

            "bg-slate-200 text-slate-700",

    },

} satisfies Record<

    Exclude<

        PaymentResultStatus,

        "IDLE"

    >,

    {

        emoji: string;

        title: string;

        message: string;

        badge: string;

    }

>;

export default function PaymentResultDialog({

    open,

    status,

    amount,

    orderId,

    onClose,

    onHistory,

}: Props) {

    if (

        !open ||

        status === "IDLE"

    ) {

        return null;

    }

    const ui =

        CONFIG[status];

    return (

        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/40
                p-4
            "
        >

            <div
                className="
                    w-full
                    max-w-md
                    rounded-3xl
                    bg-white
                    p-8
                    shadow-xl
                "
            >

                <div
                    className="
                        text-center
                    "
                >

                    <div
                        className="text-6xl"
                    >

                        {ui.emoji}

                    </div>

                    <h2
                        className="
                            mt-4
                            text-2xl
                            font-bold
                        "
                    >

                        {ui.title}

                    </h2>

                    <p
                        className="
                            mt-2
                            text-slate-500
                        "
                    >

                        {ui.message}

                    </p>

                </div>

                <div
                    className="
                        mt-6
                        rounded-2xl
                        bg-slate-50
                        p-4
                    "
                >

                    <div
                        className="
                            flex
                            justify-between
                        "
                    >

                        <span>

                            Status

                        </span>

                        <span
                            className={`
                                rounded-full
                                px-3
                                py-1
                                text-xs
                                font-semibold
                                ${ui.badge}
                            `}
                        >

                            {status}

                        </span>

                    </div>

                    <div
                        className="
                            mt-3
                            flex
                            justify-between
                        "
                    >

                        <span>

                            Nominal

                        </span>

                        <strong>

                            Rp {amount.toLocaleString("id-ID")}

                        </strong>

                    </div>

                    <div
                        className="
                            mt-3
                        "
                    >

                        <div
                            className="
                                text-xs
                                text-slate-500
                            "
                        >

                            Order ID

                        </div>

                        <div
                            className="
                                break-all
                                font-mono
                                text-xs
                            "
                        >

                            {orderId}

                        </div>

                    </div>

                </div>

                <div
                    className="
                        mt-6
                        flex
                        gap-3
                    "
                >

                    <button

                        type="button"

                        onClick={onHistory}

                        className="
                            flex-1
                            rounded-xl
                            border
                            border-slate-300
                            py-3
                        "

                    >

                        Riwayat

                    </button>

                    <button

                        type="button"

                        onClick={onClose}

                        className="
                            flex-1
                            rounded-xl
                            bg-indigo-600
                            py-3
                            text-white
                        "

                    >

                        Tutup

                    </button>

                </div>

            </div>

        </div>

    );

}