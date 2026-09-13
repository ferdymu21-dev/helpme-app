"use client";

import {
  useState,
} from "react";

import {
  Flag,
} from "lucide-react";

import ReportServiceListingModal from "@/features/reports/components/ReportServiceListingModal";

interface ServiceListingReportActionProps {
  serviceListingId: string;
  serviceTitle: string;
}

export default function ServiceListingReportAction({
  serviceListingId,
  serviceTitle,
}: ServiceListingReportActionProps) {
  const [
    open,
    setOpen,
  ] =
    useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="
          mt-4
          inline-flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-2xl
          border
          border-red-200
          bg-red-50
          px-5
          py-3
          text-sm
          font-bold
          text-red-700
          transition
          hover:bg-red-100
        "
      >
        <Flag className="h-4 w-4" />

        Laporkan Jasa
      </button>

      <ReportServiceListingModal
        open={open}
        serviceListingId={
          serviceListingId
        }
        serviceTitle={
          serviceTitle
        }
        onClose={() =>
          setOpen(false)
        }
      />
    </>
  );
}