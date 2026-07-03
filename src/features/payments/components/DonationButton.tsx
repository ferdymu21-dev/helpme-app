interface Props {

    loading: boolean;

    disabled: boolean;

    onClick: () => void;

}

export default function DonationButton({

    loading,

    disabled,

    onClick,

}: Props) {

    return (

        <button

            onClick={

                onClick

            }

            disabled={

                loading ||

                disabled

            }

            className="
                h-12
                w-full
                rounded-2xl
                bg-indigo-600
                font-bold
                text-white
                transition
              hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-50

            "

        >

            {

                loading

                    ? "Memproses..."

                    : "Dukung HelpMe"

            }

        </button>

    );

}