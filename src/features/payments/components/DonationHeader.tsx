interface Props {

    onClose?: () => void;

}

export default function DonationHeader({

    onClose,

}: Props) {

    return (

        <div className="border-b border-slate-200 p-6">

            <div className="flex items-start justify-between">

                <div>

                    <h2 className="text-2xl font-black">

                        ❤️ Dukung HelpMe

                    </h2>

                    <p className="mt-3 leading-7 text-slate-500">

                        HelpMe tetap gratis digunakan semua orang.

                        Dukungan Anda membantu kami menjaga server,

                        mengembangkan fitur baru,

                        dan meningkatkan keamanan platform.

                    </p>

                </div>

                <button

                    onClick={onClose}

                    className="text-xl text-slate-400 hover:text-slate-700"

                >

                    ✕

                </button>

            </div>

        </div>

    );

}