import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/lib/auth/server/getCurrentUser";

import {
  cancelTaskServer,
} from "@/features/tasks/server";

export async function POST(
  request: NextRequest
) {

  try {

    const authorization =
      request.headers.get("authorization");

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken =
      authorization.replace(
        "Bearer ",
        ""
      );

    const user =
      await getCurrentUser(
        accessToken
      );

    const body =
      await request.json();

    await cancelTaskServer(
      body.taskId,
      user.id,
    );

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "CANCEL TASK ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      {
        status: 500,
      }
    );

  }

}