import Link from "next/link";

import {
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  FileText,
} from "lucide-react";

import {
  ServiceAgreementPaymentPlanType,
  ServiceAgreementStatus,
  type ServiceAgreementPaymentPlanTypeValue,
} from "./constants/service-agreement";

import type { ServiceAgreement } from "./types/service-agreement.types";

import { formatServiceRequestDateTime } from "./utils/service-request-display";

interface ServiceRequestChatProposalCardProps {
  agreement: ServiceAgreement;

  requestId: string;
}

function formatMoney(
  value: number,
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",

      currency: "IDR",

      maximumFractionDigits: 0,
    },
  ).format(value);
}

function getPaymentPlanLabel(
  type:
    ServiceAgreementPaymentPlanTypeValue,
): string {
  switch (type) {
    case ServiceAgreementPaymentPlanType.AFTER_COMPLETION:
      return "Setelah pekerjaan selesai";

    case ServiceAgreementPaymentPlanType.DEPOSIT_FINAL:
      return "Deposit + pelunasan";

    case ServiceAgreementPaymentPlanType.MILESTONES:
      return "Bertahap / milestone";

    case ServiceAgreementPaymentPlanType.FULL_UPFRONT:
      return "Lunas di awal";
  }
}

function getAgreementStatusLabel(
  status: ServiceAgreement["status"],
): string {
  switch (status) {
    case ServiceAgreementStatus.PROPOSED:
      return "Menunggu Persetujuan";

    case ServiceAgreementStatus.APPROVED:
      return "Disetujui";

    case ServiceAgreementStatus.REJECTED:
      return "Ditolak";

    case ServiceAgreementStatus.SUPERSEDED:
      return "Digantikan";
  }
}

function getAgreementStatusClassName(
  status: ServiceAgreement["status"],
): string {
  switch (status) {
    case ServiceAgreementStatus.PROPOSED:
      return `
        border-amber-200
        bg-amber-50
        text-amber-700
      `;

    case ServiceAgreementStatus.APPROVED:
      return `
        border-emerald-200
        bg-emerald-50
        text-emerald-700
      `;

    case ServiceAgreementStatus.REJECTED:
      return `
        border-rose-200
        bg-rose-50
        text-rose-700
      `;

    case ServiceAgreementStatus.SUPERSEDED:
      return `
        border-slate-200
        bg-slate-100
        text-slate-600
      `;
  }
}

export default function ServiceRequestChatProposalCard({
  agreement,
  requestId,
}: ServiceRequestChatProposalCardProps) {
  return (
    <div
      className="
        my-4
        flex
        w-full
        justify-center
      "
    >
      <article
        className="
          w-full
          max-w-2xl
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            border-b
            border-slate-100
            bg-indigo-50/80
            px-4
            py-3
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-3
            "
          >
            <div
              className="
                flex
                min-w-0
                items-start
                gap-3
              "
            >
              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-indigo-50
                  text-indigo-600
                "
              >
                <FileText
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={2}
                />
              </span>

              <div className="min-w-0">
                <p
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.12em]
                    text-indigo-600
                  "
                >
                  Proposal Penawaran
                </p>

                <h3
                  className="
                    mt-0.5
                    text-sm
                    font-black
                    text-slate-950
                  "
                >
                  Versi {agreement.version}
                </h3>
              </div>
            </div>

            <span
              className={`
                shrink-0
                rounded-md
                border
                px-2
                py-1
                text-[9px]
                font-black
                ${getAgreementStatusClassName(
                  agreement.status,
                )}
              `}
            >
              {getAgreementStatusLabel(
                agreement.status,
              )}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div>
            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Nilai Penawaran
            </p>

            <p
              className="
                mt-1
                text-lg
                font-black
                tracking-tight
                text-slate-950
              "
            >
              {formatMoney(
                agreement.totalPrice,
              )}
            </p>
          </div>

          <div
            className="
              mt-3
              grid
              grid-cols-1
              gap-2
              sm:grid-cols-2
            "
          >
            <div
              className="
                rounded-lg
                bg-slate-50/80
                px-3
                py-2.5
              "
            >
              <p
                className="
                  flex
                  items-center
                  gap-1.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                <CalendarDays
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />

                Deadline
              </p>

              <p
                className="
                  mt-1.5
                  text-[11px]
                  font-bold
                  leading-5
                  text-slate-800
                "
              >
                {formatServiceRequestDateTime(
                  agreement.deadline,
                )}
              </p>
            </div>

            <div
              className="
                rounded-lg
                bg-slate-50/80
                px-3
                py-2.5
              "
            >
              <p
                className="
                  flex
                  items-center
                  gap-1.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                <CircleDollarSign
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />

                Pembayaran
              </p>

              <p
                className="
                  mt-1.5
                  text-[11px]
                  font-bold
                  leading-5
                  text-slate-800
                "
              >
                {getPaymentPlanLabel(
                  agreement.paymentPlanType,
                )}
              </p>
            </div>
          </div>

          <div
            className="
              mt-3
              border-t
              border-slate-100
              pt-3
            "
          >
            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Ruang lingkup
            </p>

            <p
              className="
                mt-1.5
                whitespace-pre-wrap
                text-xs
                leading-5
                text-slate-600
              "
            >
              {agreement.scope}
            </p>
          </div>

          <Link
            href={`/service-requests/${encodeURIComponent(
              requestId,
            )}`}
            className="
              mt3
              flex
              min-h-9
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-indigo-200
              bg-white
              px-4
              text-xs
              font-black
              text-indigo-700
              transition
              hover:bg-indigo-50
              active:scale-[0.99]
            "
          >
            Tinjau Detail Proposal

            <ArrowUpRight
              aria-hidden="true"
              className="h-3.5 w-3.5"
              strokeWidth={2}
            />
          </Link>

          <p
            className="
              mt-2.5
              text-center
              text-[9px]
              text-slate-400
            "
          >
            Diajukan{" "}
            {formatServiceRequestDateTime(
              agreement.createdAt,
            )}
          </p>
        </div>
      </article>
    </div>
  );
}