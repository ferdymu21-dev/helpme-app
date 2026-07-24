import {
    ReceiptText,
} from "lucide-react";

export default function PaymentHistoryEmpty() {

    return (

        <div
            className="
                flex
                flex-col
                items-center
                justify-center
                rounded-3xl
                border
                border-dashed
                border-slate-300
                bg-white
                py-20
                text-center
            "
        >

            <ReceiptText
                size={56}
                className="text-slate-300"
            />

            <h2
                className="
                    mt-6
                    text-xl
                    font-semibold
                    text-slate-800
                "
            >

                Belum ada transaksi

            </h2>

            <p
                className="
                    mt-2
                    max-w-sm
                    text-sm
                    text-slate-500
                "
            >

                Semua riwayat pembayaran Anda akan muncul di sini.

            </p>

        </div>

    );

}