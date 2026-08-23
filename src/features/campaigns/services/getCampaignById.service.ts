import {
    getCampaignByIdRepository,
} from "../repositories";

export async function getCampaignByIdService(
    id: string,
) {
    return getCampaignByIdRepository(id);
}