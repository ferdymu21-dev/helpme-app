import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  deleteServiceListingImageService,
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

    imageId: string;
  }>;
}

export async function DELETE(
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
      imageId,
    } =
      await context.params;

    const result =
      await deleteServiceListingImageService({
        listingId:
          id,

        providerId:
          user.id,

        imageId,
      });

    return NextResponse.json(
      result,
      {
        status:
          200,
      },
    );
  } catch (error) {
    console.error(
      "DELETE /api/service-listings/[id]/media/[imageId] error:",
      error,
    );

    return createServiceListingMediaErrorResponse(
      error,
      "Gagal menghapus gambar jasa.",
    );
  }
}