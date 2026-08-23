import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/server/getCurrentUser";

import { confirmTaskCompletionServer } from "@/features/tasks/server";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const accessToken = authorization.replace("Bearer ", "");

    const user = await getCurrentUser(accessToken);

    const body = await request.json();

    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        {
          message: "taskId wajib diisi",
        },
        {
          status: 400,
        },
      );
    }

    await confirmTaskCompletionServer(taskId, user.id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("CONFIRM COMPLETION ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}