"use client";

import clsx from "clsx";

import type { CampaignStatusValue } from "../constants/campaign-status";

import { CampaignStatusConfig } from "../constants/campaign-status-config";

interface Props {
  status: CampaignStatusValue;
}

export default function CampaignStatusBadge({ status }: Props) {
  const current = CampaignStatusConfig[status];

  return (
    <span
      className={clsx(
        `
                inline-flex
                items-center
                gap-2
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold
                `,

        current.color,
      )}
    >
      <span
        className={clsx(
          `
                    h-2
                    w-2
                    rounded-full
                    `,

          current.dot,
        )}
      />

      {current.label}
    </span>
  );
}