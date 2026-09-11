import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireServiceListingApiUser,
} from "@/features/service-listings/server/require-service-listing-api-user";

import {
  createServiceListingPublicationService,
} from "@/features/service-listings/services/create-service-listing-publication.server.service";

import {
  createServiceListingPublicationErrorResponse,
} from "@/features/service-listings/server/service-listing-publication-api-response";

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

    const result =
      await createServiceListingPublicationService({
        listingId:
          id,

        providerId:
          user.id,
      });

    const status =
      result.kind ===
        "PAYMENT_CREATING"
        ? 202
        : result.kind ===
              "PAYMENT_REQUIRED" &&
            result.created
          ? 201
          : 200;

    return NextResponse.json(
      result,
      {
        status,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/service-listings/[id]/publication error:",
      error,
    );

    return createServiceListingPublicationErrorResponse(
      error,
    );
  }
}