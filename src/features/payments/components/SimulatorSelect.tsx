interface Props {

    label: string;

    options: readonly string[];

    value: string;

    onChange: (

        value: string

    ) => void;

}

export default function SimulatorSelect({

    label,

    options,

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

            <select

                value={
                    value
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

            >

                {

                    options.map(

                        option => (

                            <option

                                key={option}

                                value={option}

                            >

                                {option}

                            </option>

                        )

                    )

                }

            </select>

        </div>

    );

}