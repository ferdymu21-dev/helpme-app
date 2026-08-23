import { createDonationController } from "./donation.controller";

import type { CreateDonationCommand } from "@/lib/payments/types/donation";

import { createUrgentTaskController } from "./urgentTask.controller";

import type { PaymentType } from "../types/payment";

interface CreatePaymentCommand {
  paymentType: PaymentType;

  userId: string;

  amount: number;

  metadata?: Record<string, unknown>;
}

export async function createPaymentController(command: CreatePaymentCommand) {
  switch (command.paymentType) {
    case "DONATION":
      const payload: CreateDonationCommand = {
        userId: command.userId,

        amount: command.amount,
      };

      return await createDonationController(payload);

    case "URGENT_TASK":
      return await createUrgentTaskController({
        userId: command.userId,

        amount: command.amount,

        metadata: command.metadata,
      });

    default:
      throw new Error(`Payment type "${command.paymentType}" belum didukung.`);
  }
}