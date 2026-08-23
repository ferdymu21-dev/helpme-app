import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/server/getCurrentUser";

import { completeTaskServer } from "@/features/tasks/server";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const accessToken = authorization.replace("Bearer ", "");

    const user = await getCurrentUser(accessToken);

    const body = await request.json();

    const { taskId, proofUrl } = body;

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

    if (!proofUrl) {
      return NextResponse.json(
        {
          message: "proofUrl wajib diisi",
        },
        {
          status: 400,
        },
      );
    }

    await completeTaskServer(taskId, proofUrl, user.id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}