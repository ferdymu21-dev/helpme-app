"use client";

import Link from "next/link";

import { useCampaignActions } from "../hooks/useCampaignActions";

import { useDeleteCampaign } from "../hooks/useDeleteCampaign";

interface Props {
  campaignId: string;
}

export default function CampaignDetailActions({ campaignId }: Props) {

  const actions = useCampaignActions(campaignId);

  const deletion = useDeleteCampaign(campaignId);

  return (
    <div
      className="
                flex
                flex-wrap
                gap-3
            "
    >
      <Link
        href={`/admin/campaigns/${campaignId}/edit`}
        className="
                    rounded-xl
                    border
                    px-5
                    py-3
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
                    px-5
                    py-3
                    text-white
                "
      >
        Publish
      </button>

      <button
        onClick={actions.cancel}
        disabled={actions.loading}
        className="
                    rounded-xl
                    bg-red-600
                    px-5
                    py-3
                    text-white
                "
      >
        Cancel
      </button>

      <button
    onClick={deletion.remove}
    disabled={deletion.loading}
    className="
        rounded-xl
        bg-slate-900
        px-5
        py-3
        text-white
        transition
        hover:bg-black
        disabled:cursor-not-allowed
        disabled:opacity-50
    "
>
    {
        deletion.loading

            ? "Deleting..."

            : "Delete"

    }
</button>
    </div>
  );
}