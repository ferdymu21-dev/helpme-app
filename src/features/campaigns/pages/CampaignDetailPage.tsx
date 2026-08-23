"use client";

import type { NotificationCampaign } from "../types/campaign.types";

import CampaignStatusBadge from "../components/CampaignStatusBadge";

import CampaignDetailActions from "../components/CampaignDetailActions";

interface Props {
  campaign: NotificationCampaign;
}

export default function CampaignDetailPage({ campaign }: Props) {
  return (
    <main
      className="
                mx-auto
                max-w-5xl
                space-y-8
            "
    >
      <div>
        <h1
          className="
                        text-3xl
                        font-black
                    "
        >
          {campaign.title}
        </h1>

        <CampaignStatusBadge status={campaign.status} />
      </div>

      <div
        className="
                    rounded-3xl
                    border
                    bg-white
                    p-8
                    space-y-6
                "
      >
        <section>
          <h2
            className="
                            font-bold
                            mb-2
                        "
          >
            Message
          </h2>

          <p>{campaign.message}</p>
        </section>

        <section
          className="
                        grid
                        grid-cols-2
                        gap-6
                    "
        >
          <div>
            <h3 className="font-semibold">Category</h3>

            <p>{campaign.category}</p>
          </div>

          <div>
            <h3 className="font-semibold">Type</h3>

            <p>{campaign.type}</p>
          </div>

          <div>
            <h3 className="font-semibold">Target</h3>

            <p>{campaign.target_type}</p>
          </div>

          <div>
            <h3 className="font-semibold">Redirect</h3>

            <p>{campaign.redirect_url ?? "-"}</p>
          </div>
        </section>
      </div>

      <div
        className="
                    rounded-3xl
                    border
                    bg-white
                    p-8
                "
      >
        <h2
          className="
                        text-xl
                        font-bold
                        mb-6
                    "
        >
          Statistics
        </h2>

        <div
          className="
                        grid
                        grid-cols-3
                        gap-6
                    "
        >
          <div>
            <p>Sent</p>

            <h3
              className="
                                text-2xl
                                font-bold
                            "
            >
              {campaign.total_sent}
            </h3>
          </div>

          <div>
            <p>Opened</p>

            <h3
              className="
                                text-2xl
                                font-bold
                            "
            >
              {campaign.total_opened}
            </h3>
          </div>

          <div>
            <p>Clicked</p>

            <h3
              className="
                                text-2xl
                                font-bold
                            "
            >
              {campaign.total_clicked}
            </h3>
          </div>
        </div>
      </div>
      <CampaignDetailActions campaignId={campaign.id} />
    </main>
  );
}