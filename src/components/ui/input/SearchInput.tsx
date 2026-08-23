"use client";

import { Search } from "lucide-react";

interface SearchInputProps {

    value: string;

    placeholder?: string;

    onChange(
        value: string
    ): void;

}

export default function SearchInput({

    value,

    placeholder = "Search...",

    onChange,

}: SearchInputProps) {

    return (

        <div
            className="
                relative
                w-full
            "
        >

            <Search

                size={18}

                className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                "

            />

            <input

                type="text"

                value={value}

                placeholder={placeholder}

                onChange={(event) =>

                    onChange(
                        event.target.value
                    )

                }

                className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    pl-11
                    pr-4
                    text-sm
                    outline-none
                    transition
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-100
                "

            />

        </div>

    );

}