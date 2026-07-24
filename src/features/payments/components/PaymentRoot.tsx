"use client";

import { useRouter } from "next/navigation";

import SupportModal from "./SupportModal";

import PaymentResultDialog from "./dialog/PaymentResultDialog";

import { useDonationFlow } from "../hooks/useDonationFlow";

interface Props {

    supportOpen: boolean;

    onCloseSupport: () => void;

}

export default function PaymentRoot({

    supportOpen,

    onCloseSupport,

}: Props) {

    const donation = useDonationFlow();

    const router = useRouter();

    return (

        <>
            <SupportModal
                donation={donation}
                open={supportOpen}
                onClose={onCloseSupport}
            />

            <PaymentResultDialog
                open={donation.result.status !== "IDLE"}
                status={donation.result.status}
                amount={donation.result.amount}
                orderId={donation.result.orderId}
                paymentType="DONATION"
                onClose={() => {
                    donation.closeDialog();
                    router.push("/home");
                }}
                onHistory={() => {
                    donation.closeDialog();
                    router.push("/payments/history");
                }}
            />

        </>

    );

}