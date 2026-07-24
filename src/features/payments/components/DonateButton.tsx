"use client";

interface DonateButtonProps {

    onDonate: () => void;

    loading: boolean;

    error: string | null;

}

export default function DonateButton({

    onDonate,

    loading,

    error,

}: DonateButtonProps) {

    return (

        <div className="space-y-3">

            <button

                onClick={

                    onDonate

                }

                disabled={

                    loading

                }

                className="
                    rounded-xl
                    bg-indigo-600
                    px-5
                    py-3
                    font-semibold
                    text-white
                    hover:bg-indigo-700
                    disabled:opacity-50
                "

            >

                {

                    loading

                        ? "Memproses..."

                        : "Donasi Rp5.000"

                }

            </button>

            {

                error && (

                    <p className="text-sm text-red-600">

                        {error}

                    </p>

                )

            }

        </div>

    );

}