"use client";

import {
  CircleAlert,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";

import {
  useDonationForm,
} from "../hooks/useDonationForm";

import {
  useDonationFlow,
} from "../hooks/useDonationFlow";

import DonationHeader from "./DonationHeader";
import DonationAmountGrid from "./DonationAmountGrid";
import CustomAmountInput from "./CustomAmountInput";
import PaymentMethodCard from "./PaymentMethodCard";
import DonationFooter from "./DonationFooter";

type DonationFlowState =
  ReturnType<
    typeof useDonationFlow
  >;

interface Props {
  donation: DonationFlowState;

  open: boolean;

  onClose: () => void;
}

export default function SupportModal({
  donation,
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
  } = useDonationForm();

  const {
    handleDonate,
    loading,
    error: donationError,
  } = donation;

  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-end
        justify-center
        overflow-y-auto
        bg-slate-950/55
        p-0
        backdrop-blur-sm
        sm:items-center
        sm:p-5
      "
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-modal-title"
        className="
          animate-support-modal
          relative
          flex
          max-h-[94dvh]
          w-full
          max-w-xl
          flex-col
          overflow-hidden
          rounded-t-[30px]
          border
          border-slate-200/80
          bg-white
          shadow-[0_30px_90px_rgba(15,23,42,0.25)]
          sm:max-h-[90vh]
          sm:rounded-[30px]
        "
      >
        {/* MOBILE HANDLE */}
        <div
          className="
            flex
            shrink-0
            justify-center
            pb-1
            pt-3
            sm:hidden
          "
        >
          <div
            className="
              h-1
              w-10
              rounded-full
              bg-slate-200
            "
          />
        </div>

        <DonationHeader
          onClose={onClose}
        />

        {/* SCROLLABLE CONTENT */}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
          "
        >
          {/* WARM INTRO */}
          <div
            className="
              mx-5
              mt-5
              overflow-hidden
              rounded-[22px]
              border
              border-indigo-100
              bg-linear-to-br
              from-indigo-50
              via-white
              to-violet-50/60
              p-4
              sm:mx-6
              sm:p-5
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-600
                  text-white
                  shadow-[0_8px_20px_rgba(79,70,229,0.18)]
                "
              >
                <HeartHandshake
                  className="h-5 w-5"
                  strokeWidth={2}
                />
              </div>

              <div>
                <p
                  className="
                    text-sm
                    font-black
                    text-slate-900
                  "
                >
                  Bantuan kecil bisa berarti besar
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Dukungan Anda membantu HelpMe
                  terus berkembang, menjaga layanan,
                  dan menghadirkan pengalaman yang
                  semakin baik untuk komunitas.
                </p>
              </div>
            </div>
          </div>

          <DonationAmountGrid
            selectedAmount={selectedAmount}
            onSelect={handleSelectAmount}
          />

          <CustomAmountInput
            value={customAmount}
            error={error}
            onChange={handleCustomAmountChange}
          />

          <div
            className="
              px-5
              pb-5
              sm:px-6
            "
          >
            <PaymentMethodCard />
          </div>

          {/* TRUST NOTE */}
          <div
            className="
              mx-5
              mb-5
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-emerald-100
              bg-emerald-50/60
              px-4
              py-3
              sm:mx-6
            "
          >
            <ShieldCheck
              className="
                mt-0.5
                h-4
                w-4
                shrink-0
                text-emerald-600
              "
              strokeWidth={2}
            />

            <div>
              <p
                className="
                  text-[11px]
                  font-bold
                  text-emerald-900
                "
              >
                Dukungan bersifat sukarela
              </p>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  leading-4
                  text-emerald-700
                "
              >
                Anda tetap dapat menggunakan HelpMe
                tanpa memberikan dukungan.
                Pembayaran diproses melalui sistem
                pembayaran yang tersedia.
              </p>
            </div>
          </div>

          {donationError && (
            <div
              className="
                mx-5
                mb-5
                flex
                items-start
                gap-2.5
                rounded-2xl
                border
                border-red-100
                bg-red-50
                px-4
                py-3
                sm:mx-6
              "
              role="alert"
            >
              <CircleAlert
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-red-500
                "
              />

              <p
                className="
                  text-[11px]
                  leading-5
                  text-red-600
                "
              >
                {donationError}
              </p>
            </div>
          )}
        </div>

        <DonationFooter
          amount={finalAmount}
          loading={loading}
          disabled={!isValid}
          onClose={onClose}
          onDonate={async () => {
            await handleDonate(
              finalAmount,
            );

            onClose();
          }}
        />
      </div>
    </div>
  );
}