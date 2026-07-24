import type {
    CreatePaymentResponse,
} from "@/features/payments/types/payment";

/*
|--------------------------------------------------------------------------
| REQUEST
|--------------------------------------------------------------------------
| Payload yang dikirim dari Frontend
*/

export interface CreateDonationRequest {

    amount: number;

}

/*
|--------------------------------------------------------------------------
| COMMAND
|--------------------------------------------------------------------------
| Payload internal yang sudah memiliki userId
*/

export interface CreateDonationCommand {

    userId: string;

    amount: number;

}

/*
|--------------------------------------------------------------------------
| RESULT
|--------------------------------------------------------------------------
*/

export interface DonationResult {

    orderId: string;

    snapToken: string;

    redirectUrl: string;

}

/*
|--------------------------------------------------------------------------
| RESPONSE
|--------------------------------------------------------------------------
| Response yang dikembalikan ke Frontend
*/

export type DonationResponse =
    CreatePaymentResponse;