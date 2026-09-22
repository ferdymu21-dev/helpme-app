import Link from "next/link";

import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";

import type { ServiceRequestDetail } from "./types/service-request-read.types";

import {
  formatServiceRequestBudget,
  getServiceRequestStatusLabel,
} from "./utils/service-request-display";

interface ServiceRequestChatContextCardProps {
  detail: ServiceRequestDetail;

  canCreateProposal?: boolean;

  onCreateProposal?: () => void;
}

export default function ServiceRequestChatContextCard({
  detail,
  canCreateProposal = false,
  onCreateProposal,
}: ServiceRequestChatContextCardProps) {
  return (
    <div
      className="
        mx-auto
        mb-4
        w-full
        max-w-3xl
        overflow-hidden
        rounded-2xl
        border
        border-indigo-200
        bg-white
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-start
          gap-3
          border-b
          border-slate-100
          bg-indigo-50/80
          px-4
          py-3
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
          <BriefcaseBusiness
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
            Jasa yang dinegosiasikan
          </p>

          <h2
            className="
              mt-0.5
              truncate
              text-sm
              font-black
              text-slate-950
            "
          >
            {detail.listingTitle}
          </h2>

          <p
            className="
              mt-0.5
              text-[11px]
              font-medium
              text-slate-500
            "
          >
            {detail.listingCategory}
          </p>
        </div>
      </div>

      <div className="p-3.5">
        <div
          className="
            grid
            grid-cols-2
            gap-3
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
                text-[9px]
                font-bold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Anggaran
            </p>

            <p
              className="
                mt-1
                text-[14px]
                font-black
                text-green-600
              "
            >
              {formatServiceRequestBudget(detail.budget)}
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
                text-[9px]
                font-bold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Status
            </p>

            <p
              className="
                mt-1
                text-xs
                font-black
                text-slate-900
              "
            >
              {getServiceRequestStatusLabel(detail.status)}
            </p>
          </div>
        </div>

        <div
          className={`
    mt-3
    grid
    gap-2
    ${canCreateProposal && onCreateProposal ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}
  `}
        >
          <Link
            href={`/service-requests/${encodeURIComponent(detail.id)}`}
            className="
      flex
      min-h-9
      items-center
      justify-center
      gap-2
      rounded-lg
      border
      border-slate-200
      bg-white
      px-3
      text-xs
      font-bold
      text-slate-700
      transition
      hover:border-indigo-200
      hover:bg-indigo-50
      hover:text-indigo-700
      active:scale-[0.99]
    "
          >
            Lihat Permintaan
            <ArrowUpRight
              aria-hidden="true"
              className="h-3.5 w-3.5"
              strokeWidth={2}
            />
          </Link>

          {canCreateProposal && onCreateProposal && (
            <button
              type="button"
              onClick={onCreateProposal}
              className="
          min-h-9
          rounded-lg
          bg-indigo-600
          px-3
          text-xs
          font-black
          text-white
          transition
          hover:bg-indigo-700
          active:scale-[0.99]
        "
            >
              Buat Proposal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}