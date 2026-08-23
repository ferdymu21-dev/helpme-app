"use client";

import Link from "next/link";


import { useCampaignActions } from "../hooks/useCampaignActions";

import type { NotificationCampaign } from "../types/campaign.types";

import CampaignStatusBadge from "./CampaignStatusBadge";

interface Props {
  campaign: NotificationCampaign;
}

export default function CampaignCard({ campaign }: Props) {
  const actions = useCampaignActions(campaign.id);
  return (
    <div
      className="
                block
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                transition-all
                duration-200
                hover:-translate-y-1
                hover:border-indigo-300
                hover:shadow-lg
            "
    >
      <div
        className="
                    flex
                    items-start
                    justify-between
                    gap-4
                "
      >
        <div
          className="
                        min-w-0
                        flex-1
                    "
        >
          <h2
            className="
                            truncate
                            text-lg
                            font-bold
                            text-slate-900
                        "
          >
            {campaign.title}
          </h2>

          <p
            className="
                            mt-2
                            line-clamp-2
                            text-sm
                            text-slate-500
                        "
          >
            {campaign.message}
          </p>
        </div>

        <CampaignStatusBadge status={campaign.status} />
      </div>

      <div
        className="
                    mt-6
                    flex
                    flex-wrap
                    items-center
                    gap-2
                    text-xs
                    text-slate-500
                "
      >
        <span
          className="
                        rounded-full
                        bg-slate-100
                        px-3
                        py-1
                    "
        >
          {campaign.target_type}
        </span>

        <span
          className="
                        rounded-full
                        bg-slate-100
                        px-3
                        py-1
                    "
        >
          {campaign.category}
        </span>

        <span
          className="
                        rounded-full
                        bg-slate-100
                        px-3
                        py-1
                    "
        >
          {campaign.type}
        </span>
      </div>

      <div
        className="
                    mt-6
                    grid
                    grid-cols-3
                    gap-4
                    border-t
                    border-slate-100
                    pt-5
                "
      >
        <div>
          <p
            className="
                            text-xs
                            text-slate-400
                        "
          >
            Sent
          </p>

          <p
            className="
                            mt-1
                            font-bold
                        "
          >
            {campaign.total_sent.toLocaleString()}
          </p>
        </div>

        <div>
          <p
            className="
                            text-xs
                            text-slate-400
                        "
          >
            Opened
          </p>

          <p
            className="
                            mt-1
                            font-bold
                        "
          >
            {campaign.total_opened.toLocaleString()}
          </p>
        </div>

        <div>
          <p
            className="
                            text-xs
                            text-slate-400
                        "
          >
            Clicked
          </p>

          <p
            className="
                            mt-1
                            font-bold
                        "
          >
            {campaign.total_clicked.toLocaleString()}
          </p>
        </div>
      </div>
      <div
        className="
        mt-6
        flex
        items-center
        justify-between
        border-t
        border-slate-100
        pt-4
    "
      >
        <Link
          href={`/admin/campaigns/${campaign.id}`}
          className="
            rounded-xl
            border
            px-4
            py-2
            text-sm
            font-medium
            transition
            hover:bg-slate-50
        "
        >
          View
        </Link>

        <div
          className="
            flex
            gap-2
        "
        >
          <Link
    href={`/admin/campaigns/${campaign.id}/edit`}
    className="
        rounded-xl
        border
        px-4
        py-2
        text-sm
        transition
        hover:bg-slate-50
    "
>
    Edit
</Link>

          <button
    onClick={actions.publish}
    disabled={actions.loading}
    className="
        rounded-xl
        bg-indigo-600
        px-4
        py-2
        text-sm
        font-medium
        text-white
        transition
        hover:bg-indigo-700
        disabled:cursor-not-allowed
        disabled:opacity-50
    "
>
    {
        actions.loading

            ? "Publishing..."

            : "Publish"

    }
</button>
        </div>
      </div>
    </div>
  );
}