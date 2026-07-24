import { Search } from "lucide-react";

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export default function PaymentHistorySearch({
    value,
    onChange,
}: Props) {
    return (
        <div className="mt-6 w-full">
            <div
                className="
                    group
                    flex
                    h-14
                    w-full
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    shadow-sm
                    transition-all
                    duration-200
                    hover:border-slate-300
                    focus-within:border-primary-500
                    focus-within:ring-4
                    focus-within:ring-primary-100
                "
            >
                <Search
                    size={20}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="
                        shrink-0
                        text-slate-400
                        transition-colors
                        duration-200
                        group-focus-within:text-primary-600
                    "
                />

                <input
                    type="text"
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    placeholder="Cari transaksi atau Order ID..."
                    aria-label="Cari transaksi atau Order ID"
                    className="
                        h-full
                        min-w-0
                        flex-1
                        border-0
                        bg-transparent
                        p-0
                        text-[15px]
                        text-text-main
                        outline-none
                        placeholder:text-slate-400
                        focus:border-0
                        focus:outline-none
                        focus:ring-0
                    "
                />
            </div>
        </div>
    );
}