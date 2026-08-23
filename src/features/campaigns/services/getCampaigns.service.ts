import { getCampaignsRepository } from "../repositories";

export async function getCampaignsService() {
  return await getCampaignsRepository();
}