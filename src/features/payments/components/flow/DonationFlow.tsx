"use client";

import DonateButton from "../DonateButton";

import { useDonationFlow } from "../../hooks/useDonationFlow";

type DonationFlowState =
  ReturnType<typeof useDonationFlow>;

interface Props {
  donation: DonationFlowState;
}

export default function DonationFlow({
  donation,
}: Props) {

  const {
    handleDonate,
    loading,
    error,
  } = donation;

  return (
    <>
      <DonateButton
        onDonate={handleDonate}
        loading={loading}
        error={error}
      />
    </>
  );
}