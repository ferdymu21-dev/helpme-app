interface Props {

    open: boolean;

    amount: number;

    orderId: string;

    onClose: () => void;

    onHistory: () => void;

}

export default function PaymentSuccessDialog({

    open,

    amount,

    orderId,

    onClose,

    onHistory,

}: Props) {

    if (!open) {

        return null;

    }

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
                        mb-6
                        text-center
                    "
                >

                    <div
                        className="text-6xl"
                    >

                        🎉

                    </div>

                    <h2
                        className="
                            mt-4
                            text-2xl
                            font-bold
                        "
                    >

                        Terima Kasih!

                    </h2>

                    <p
                        className="
                            mt-2
                            text-slate-500
                        "
                    >

                        Donasi Anda berhasil diterima.

                    </p>

                </div>

                <div
                    className="
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
                                text-sm
                                text-slate-500
                            "
                        >

                            Order ID

                        </div>

                        <div
                            className="
                                break-all
                                text-sm
                                font-mono
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

                        Lihat Riwayat

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