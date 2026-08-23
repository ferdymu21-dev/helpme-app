import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { createAdService } from "@/features/ads/services/createAd.service";
import { getAdsService } from "@/features/ads/services/getAds.service";
import type { AdPosition } from "@/features/ads/types/ad.types";
import { getAdminAdsService } from "@/features/ads/services/getAdminAds.service";

const AD_POSITIONS: AdPosition[] = ["home_desktop", "home_mobile"];

function isAdPosition(value: string): value is AdPosition {
  return AD_POSITIONS.includes(value as AdPosition);
}

export async function GET(request: NextRequest) {
  try {
    const adminParam = request.nextUrl.searchParams.get("admin");

    if (adminParam === "true") {
      const ads = await getAdminAdsService();

      return NextResponse.json(ads);
    }

    const positionParam = request.nextUrl.searchParams.get("position");

    const position =
      positionParam && isAdPosition(positionParam) ? positionParam : undefined;

    const ads = await getAdsService(position);

    return NextResponse.json(ads);
    
  } catch (error) {
    console.error("GET /api/ads error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          message: "Anda belum login.",
        },
        {
          status: 401,
        },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          message: "Anda tidak memiliki akses admin.",
        },
        {
          status: 403,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Gagal mengambil iklan.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const ad = await createAdService(body);

    return NextResponse.json(ad, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/ads error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          message: "Anda belum login.",
        },
        {
          status: 401,
        },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          message: "Anda tidak memiliki akses admin.",
        },
        {
          status: 403,
        },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Data iklan tidak valid.",
          errors: error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Gagal membuat iklan.",
      },
      {
        status: 500,
      },
    );
  }
}