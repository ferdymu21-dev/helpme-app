interface Props {

    label: string;

    placeholder?: string;

    value: string;

    disabled?: boolean;

    onChange: (
        value: string
    ) => void;

}

export default function SimulatorField({
    label,
    placeholder,
    value,
    onChange,
    disabled,
}: Props) {

    return (

        <div>

            <label
                className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                "
            >

                {label}

            </label>

            <input

                value={
                    value
                }

                placeholder={
                    placeholder
                }

                onChange={(event) =>

                    onChange(

                        event.target.value

                    )

                }

                className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    py-3
                    outline-none
                    focus:border-indigo-500
                    disabled:bg-slate-100
                    disabled:text-slate-500
                    disabled:cursor-not-allowed
                "

            />

        </div>

    );

}