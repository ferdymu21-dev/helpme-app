export default function PaymentMethodCard() {

    return (

        <div className="border-t border-slate-200 p-6">

            <h3 className="mb-4 font-bold">

                Metode Pembayaran

            </h3>

            <div

                className="

                    rounded-2xl

                    border

                    border-indigo-200

                    bg-indigo-50

                    p-4

                "

            >

                <div className="font-bold">

                    ☑ QRIS

                </div>

                <p className="mt-2 text-sm text-slate-500">

                    Scan menggunakan

                    GoPay,

                    OVO,

                    DANA,

                    ShopeePay,

                    Mobile Banking,

                    dan aplikasi QRIS lainnya.

                </p>

            </div>

        </div>

    );

}