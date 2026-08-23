"use client";

import clsx from "clsx";

interface Props {

    children: React.ReactNode;

    onClick?(): void;

    type?:
        | "button"
        | "submit";

    disabled?: boolean;

    className?: string;

}

export default function PrimaryButton({

    children,

    onClick,

    type = "button",

    disabled = false,

    className,

}: Props) {

    return (

        <button

            type={type}

            onClick={onClick}

            disabled={disabled}

            className={clsx(

                `
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                bg-indigo-600
                px-5
                text-sm
                font-semibold
                text-white
                transition-all
                duration-200
                hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-50
                `,

                className

            )}

        >

            {children}

        </button>

    );

}