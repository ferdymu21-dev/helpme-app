import {
  requireAdmin,
} from "@/features/admin/services/admin-auth.service";

import {
  CampaignAction,
} from "../constants/campaign-action";

import {
  CampaignStatus,
} from "../constants/campaign-status";

import {
  buildDraftCampaign,
  buildScheduledCampaign,
} from "../factories";

import {
  createCampaignRepository,
  getCampaignByIdRepository,
} from "../repositories";

import {
  publishCampaignEngine,
} from "../engines/publishCampaign.engine";

import {
  validateCreateCampaign,
} from "../validators";

import type {
  CreateCampaignPayload,
} from "../types/campaign.types";

export async function createCampaignService(
  payload: CreateCampaignPayload,
) {
  await requireAdmin();

  validateCreateCampaign(
    payload,
  );

  switch (payload.action) {
    case CampaignAction.DRAFT:
      return createCampaignRepository(
        buildDraftCampaign(
          payload,
        ),
      );

    case CampaignAction.PUBLISH: {
      /*
       * Immediate publish tetap dibuat
       * melalui state SCHEDULED terlebih
       * dahulu.
       *
       * Dengan begitu delivery memakai
       * engine yang sama dengan cron dan
       * tetap recovery-safe jika proses
       * gagal di tengah.
       */
      const campaign =
        await createCampaignRepository({
          ...buildDraftCampaign(
            payload,
          ),

          status:
            CampaignStatus.SCHEDULED,

          scheduled_at:
            new Date()
              .toISOString(),

          published_at:
            null,
        });

      /*
       * Engine:
       *
       * SCHEDULED
       * → broadcast idempotent
       * → sync total_sent
       * → PUBLISHED
       */
      await publishCampaignEngine(
        campaign.id,
      );

      /*
       * Ambil row terbaru karena
       * campaign yang tadi dibuat
       * sudah berubah menjadi
       * PUBLISHED.
       */
      return getCampaignByIdRepository(
        campaign.id,
      );
    }

    case CampaignAction.SCHEDULE:
      return createCampaignRepository(
        buildScheduledCampaign(
          payload,
        ),
      );

    default:
      throw new Error(
        "Campaign action tidak dikenali.",
      );
  }
}