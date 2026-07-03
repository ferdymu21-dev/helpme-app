interface Props {

    value: string;

    error: string | null;

    onChange: (

        value: string

    ) => void;

}

export default function CustomAmountInput({

    value,
    error,
    onChange,

}: Props) {

    return (

        <div className="px-6 pb-6">

            <label

                className="mb-2 block font-semibold"

            >

                Nominal Lain

            </label>

            <input

                type="number"

                value={value}

                placeholder="Masukkan nominal"

                onChange={(event) =>

                    onChange(

                        event.target.value

                    )

                }

                className="
                    w-full
                    rounded-2xl
                    border
                    border-slate-300
                    px-4
                    py-3
                    outline-none
                    focus:border-indigo-500

                "

            />

            {error && (

                <p

                    className="
                        mt-2
                        text-sm
                        text-red-500

                    "

                >

                    {error}

                </p>

            )}

        </div>

    );

}