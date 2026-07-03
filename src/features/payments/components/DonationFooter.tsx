import DonationButton

from "./DonationButton";

interface Props {

    loading: boolean;

    disabled: boolean;

    onDonate: () => void;

}

export default function DonationFooter({

    loading,

    disabled,

    onDonate,

}: Props) {

    return (

        <div className="border-t border-slate-200 p-6">

            <DonationButton

                loading={loading}

                disabled={disabled}

                onClick={onDonate}

            />

        </div>

    );

}