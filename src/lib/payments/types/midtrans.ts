export interface MidtransExpiry {
  start_time: string;

  duration: number;

  unit:
    | "minute"
    | "minutes"
    | "hour"
    | "hours"
    | "day"
    | "days";
}

export interface MidtransTransaction {
  transaction_details: {
    order_id: string;

    gross_amount: number;
  };

  enabled_payments?: string[];

  expiry?: MidtransExpiry;

  qris?: {
    acquirer?: string;
  };

  customer_details?: {
    first_name?: string;

    email?: string;
  };
}