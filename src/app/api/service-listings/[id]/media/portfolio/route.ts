import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireServiceListingMediaFile,
} from "@/features/service-listings/validators/validate-service-listing-media";

import {
  uploadServiceListingPortfolioImageService,
} from "@/features/service-listings/services/service-listing-media.server.service";

import {
  requireServiceListingApiUser,
} from "@/features/service-listings/server/require-service-listing-api-user";

import {
  createServiceListingMediaErrorResponse,
} from "@/features/service-listings/server/service-listing-media-api-response";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const user =
      await requireServiceListingApiUser(
        request,
      );

    const {
      id,
    } =
      await context.params;

    const formData =
      await request.formData();

    const file =
      requireServiceListingMediaFile(
        formData.get(
          "file",
        ),
      );

    const result =
      await uploadServiceListingPortfolioImageService({
        listingId:
          id,

        providerId:
          user.id,

        file,
      });

    return NextResponse.json(
      result,
      {
        status:
          201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/service-listings/[id]/media/portfolio error:",
      error,
    );

    return createServiceListingMediaErrorResponse(
      error,
      "Gagal mengupload portfolio jasa.",
    );
  }
}