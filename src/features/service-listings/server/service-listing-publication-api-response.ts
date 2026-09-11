import {
  NextResponse,
} from "next/server";

function hasMessage(
  error: unknown,
  text: string,
): boolean {
  return (
    error instanceof Error &&
    error.message.includes(
      text,
    )
  );
}

export function createServiceListingPublicationErrorResponse(
  error: unknown,
) {
  if (
    hasMessage(
      error,
      "Unauthorized",
    )
  ) {
    return NextResponse.json(
      {
        message:
          "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  if (
    hasMessage(
      error,
      "was not found",
    )
  ) {
    return NextResponse.json(
      {
        message:
          "Jasa tidak ditemukan.",
      },
      {
        status: 404,
      },
    );
  }

  if (
    hasMessage(
      error,
      "Blocked Service listings",
    ) ||
    hasMessage(
      error,
      "Account is not allowed",
    ) ||
    hasMessage(
      error,
      "temporarily restricted",
    )
  ) {
    return NextResponse.json(
      {
        message:
          "Akun atau jasa ini tidak dapat melakukan publikasi saat ini.",
      },
      {
        status: 403,
      },
    );
  }

  if (
    hasMessage(
      error,
      "Complete full name and username",
    ) ||
    hasMessage(
      error,
      "cover image is required",
    )
  ) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Data jasa belum lengkap.",
      },
      {
        status: 422,
      },
    );
  }

  if (
    hasMessage(
      error,
      "Maximum reserved Service listing slots reached",
    ) ||
    hasMessage(
      error,
      "cannot start publication payment",
    ) ||
    hasMessage(
      error,
      "waiting for a publication payment",
    )
  ) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Publikasi jasa tidak dapat diproses.",
      },
      {
        status: 409,
      },
    );
  }

  if (
    hasMessage(
      error,
      "payment provider is temporarily unavailable",
    )
  ) {
    return NextResponse.json(
      {
        message:
          "Sesi pembayaran belum dapat dibuat. Silakan coba lagi.",
      },
      {
        status: 503,
      },
    );
  }

  return NextResponse.json(
    {
      message:
        "Gagal memproses publikasi jasa.",
    },
    {
      status: 500,
    },
  );
}