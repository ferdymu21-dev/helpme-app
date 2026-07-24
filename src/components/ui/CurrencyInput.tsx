"use client";

interface Props {

    label: string;

    value: string;

    onChange: (value: string) => void;

    placeholder?: string;

    prefix?: string;

    required?: boolean;

}

function formatRupiah(value: string) {

    const numeric = value.replace(/\D/g, "");

    if (!numeric) {

        return "";

    }

    return Number(numeric).toLocaleString("id-ID");

}

export default function CurrencyInput({

    label,

    value,

    onChange,

    placeholder = "0",

    prefix = "Rp",

    required = false,

}: Props) {

    return (

        <div className="mt-5">

            <label className="text-sm font-semibold text-slate-700">

                {label}

            </label>

            <div className="relative mt-2.5">

                <span
                    className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-sm
                        font-bold
                        text-indigo-600
                    "
                >
                    {prefix}
                </span>

                <input
                    type="text"
                    inputMode="numeric"
                    required={required}
                    value={formatRupiah(value)}
                    placeholder={placeholder}
                    onChange={(event) => {

                        const raw =
                            event.target.value.replace(/\D/g, "");

                        onChange(raw);

                    }}
                    className="
                        h-13
                        w-full
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-50/70
                        pl-12
                        pr-4
                        text-sm
                        font-semibold
                        text-slate-900
                        outline-none
                        transition
                        placeholder:font-normal
                        placeholder:text-slate-400
                        focus:border-indigo-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-indigo-100
                    "
                />

            </div>

        </div>

    );

}