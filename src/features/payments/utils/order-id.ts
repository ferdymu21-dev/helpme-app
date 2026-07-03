export function generateOrderId() {

    const now = Date.now();

    const random =

        Math.floor(

            Math.random() * 100000

        );

    return `HELPME-${now}-${random}`;

}