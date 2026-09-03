import { NextRequest, NextResponse } from "next/server";

import { findPaymentByOrderId } from "@/lib/payments/server/payment.repository";

import { fetchPaymentStatus } from "@/lib/payments/server/paymentStatus.service";

import { getMidtransTransactionStatus } from "@/lib/payments/server/midtrans.server";

import {
  getMidtransHttpStatusCode,
  parseMidtransStatusResponse,
} from "@/lib/payments/server/midtransStatus.parser";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest) {
  /*
   * Dev reconciliation tool tidak boleh
   * hidup pada production application
   * maupun ketika Midtrans production
   * credentials sedang digunakan.
   */
  if (
    process.env.NODE_ENV === "production" ||
    process.env.MIDTRANS_IS_PRODUCTION === "true"
  ) {
    return NextResponse.json(
      {
        message: "Not Found",
      },
      {
        status: 404,
      },
    );
  }

  try {
    const body: unknown = await request.json();

    if (!isRecord(body) || typeof body.orderId !== "string") {
      return NextResponse.json(
        {
          message: "Order ID wajib diisi.",
        },
        {
          status: 400,
        },
      );
    }

    const orderId = body.orderId.trim();

    if (!orderId) {
      return NextResponse.json(
        {
          message: "Order ID wajib diisi.",
        },
        {
          status: 400,
        },
      );
    }

    const paymentRecord = await findPaymentByOrderId(orderId);

    if (!paymentRecord) {
      return NextResponse.json(
        {
          message: "Payment tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

    const userId = paymentRecord.payment["user_id"];

    const beforeStatus = paymentRecord.payment["payment_status"];

    if (typeof userId !== "string" || typeof beforeStatus !== "string") {
      throw new Error("Data payment HelpMe tidak valid.");
    }

    /*
     * Gunakan service reconciliation
     * production yang sama.
     *
     * Tool ini TIDAK menentukan status.
     */
    const reconciled = await fetchPaymentStatus(
      userId,

      orderId,
    );

    /*
     * Ambil status provider terbaru
     * hanya untuk diagnostic response.
     */
    let midtransStatus = "UNKNOWN";

    try {
      const rawStatus = await getMidtransTransactionStatus(orderId);

      const status = parseMidtransStatusResponse(rawStatus);

      if (status.order_id !== orderId) {
        throw new Error("Order ID response Midtrans tidak sesuai.");
      }

      midtransStatus = status.transaction_status;
    } catch (error) {
      if (getMidtransHttpStatusCode(error) === 404) {
        midtransStatus = "NOT_FOUND";
      } else {
        throw error;
      }
    }

    return NextResponse.json(
      {
        success: true,

        orderId,

        paymentType: paymentRecord.paymentType,

        helpMeBefore: beforeStatus,

        midtransStatus,

        helpMeAfter: reconciled.status,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[Payment Sync Tool]", error);

    return NextResponse.json(
      {
        success: false,

        message: error instanceof Error ? error.message : "Payment sync gagal.",
      },
      {
        status: 500,
      },
    );
  }
}