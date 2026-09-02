import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/server/getCurrentUser";

import {
  applyTaskServer,
  TaskAlreadyAppliedError,
} from "@/features/tasks/server/apply-task.server";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
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

    const result = await applyTaskServer(body.taskId, user.id);

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    console.error("========== APPLY TASK ERROR ==========");
    console.error(error);

    if (error instanceof TaskAlreadyAppliedError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 409,
        },
      );
    }

    if (error instanceof Error) {
      console.error("MESSAGE :", error.message);
      console.error("STACK :", error.stack);
    }

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