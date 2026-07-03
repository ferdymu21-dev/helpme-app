export function paymentLog(
    title: string,
    error: unknown,
    metadata?: Record<string, unknown>
) {

    console.error(
        `[PAYMENT] ${title}`,
        {
            error,
            ...metadata,
        }
    );

}