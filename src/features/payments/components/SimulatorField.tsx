interface Props {

    label: string;

    placeholder?: string;

    value: string;

    onChange: (

        value: string

    ) => void;

}

export default function SimulatorField({

    label,

    placeholder,

    value,

    onChange

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
                "

            />

        </div>

    );

}