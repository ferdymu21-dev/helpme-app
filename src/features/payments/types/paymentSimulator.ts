export type SimulatorTransactionType =

    | "DONATION"

    | "ESCROW"

    | "WITHDRAW"

    | "REFUND"

    | "PREMIUM";



export type SimulatorPaymentMethod =

    | "QRIS"

    | "GOPAY"

    | "SHOPEEPAY"

    | "BCA_VA"

    | "BNI_VA"

    | "BRI_VA";



export type SimulatorTransactionStatus =

    | "SETTLEMENT"

    | "PENDING"

    | "EXPIRE"

    | "CANCEL"

    | "DENY"

    | "FAILURE"

    | "CAPTURE";