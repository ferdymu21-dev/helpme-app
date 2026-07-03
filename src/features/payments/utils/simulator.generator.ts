export function generateSimulatorOrderId(

    transactionType: string

): string {

    const timestamp =

        Date.now();

    const random =

        Math.floor(

            10000 +

            Math.random() * 90000

        );

    return `HELPME-${transactionType}-${timestamp}-${random}`;

}

export function generateSimulatorTransactionId(): string {

    return crypto.randomUUID();

}