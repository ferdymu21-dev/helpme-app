"use client";

import {
    useDonationForm,
} from "../hooks/useDonationForm";

import DonationHeader
    from "./DonationHeader";

import DonationAmountGrid
    from "./DonationAmountGrid";

import CustomAmountInput
    from "./CustomAmountInput";

import PaymentMethodCard
    from "./PaymentMethodCard";

import DonationFooter
    from "./DonationFooter";

import {
    useSupportDonation,
} from "../hooks/useSupportDonation";

import {
    useMidtrans,
} from "../hooks/useMidtrans";

interface Props {

    open: boolean;

    onClose: () => void;

}

export default function SupportModal({

    open,

    onClose,

}: Props) {

    const {
        selectedAmount,
        customAmount,
        finalAmount,
        error,
        isValid,
        handleSelectAmount,
        handleCustomAmountChange,
    }
        =

        useDonationForm();

    const {
        donate,
        loading,
        error:
        donationError,
    }
        =
        useSupportDonation();

    const {
        openPayment,
    } = useMidtrans();

    async function handleDonate() {

        try {

            const payment =

                await donate(

                    finalAmount

                );

            await openPayment(

                payment.snapToken

            );

            onClose();

        }

        catch (

        error

        ) {

            console.error(

                "DONATION ERROR",

                error

            );

        }

    }

    if (!open) {

        return null;

    }

    return (

        <div

            className="
                fixed
                inset-0
                z-50
                overflow-y-auto
                bg-black/50
                backdrop-blur-sm
                p-4
            "
        >

            <div
                className="
                    mx-auto
                    my-8
                    flex
                    max-h-[90vh]
                    w-full
                    max-w-lg
                    flex-col
                    overflow-hidden
                    rounded-4xl
                    bg-white
                    shadow-[0_20px_60px_rgba(0,0,0,0.18)]
                    animate-support-modal
                "
            >

                <div
                    className="

        flex
        justify-center
        pt-3

    "

                >

                    <div
                        className="

            h-1.5
            w-14
            rounded-full
            bg-slate-300
        "
                    />
                </div>

                <DonationHeader
                    onClose={onClose}
                />

                <div
                    className="
                       flex-1
                       overflow-y-auto
                    "
                >

                    <DonationAmountGrid
                        selectedAmount={selectedAmount}
                        onSelect={handleSelectAmount}
                    />

                    <CustomAmountInput
                        value={customAmount}
                        error={error}
                        onChange={handleCustomAmountChange}
                    />

                    <PaymentMethodCard />

                    {

                        donationError && (

                            <div
                                className="
                               px-6
                               text-sm
                             text-red-500
                            "
                            >
                                {donationError}

                            </div>
                        )
                    }

                </div>

                <DonationFooter

                    loading={loading}

                    disabled={!isValid}

                    onDonate={handleDonate}

                />

            </div>

        </div>

    );

}