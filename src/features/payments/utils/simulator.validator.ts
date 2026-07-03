export function validateSimulatorAmount(

    value: string

): string | null {

    if (

        value.trim() === ""

    ) {

        return "Amount wajib diisi.";

    }

    const amount =

        Number(value);

    if (

        Number.isNaN(amount)

    ) {

        return "Amount harus berupa angka.";

    }

    if (

        amount < 1000

    ) {

        return "Minimal simulasi adalah Rp1.000.";

    }

    if (

        amount > 100000000

    ) {

        return "Maksimal simulasi adalah Rp100.000.000.";

    }

    return null;

}

export function validateSimulatorOrderId(

    value: string

): string | null {

    if (

        value.trim() === ""

    ) {

        return "Order ID wajib diisi.";

    }

    if (

        !value.startsWith("HELPME-")

    ) {

        return "Format Order ID tidak valid.";

    }

    return null;

}