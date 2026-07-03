export async function copyToClipboard(

    text: string

) {

    if (

        !navigator.clipboard

    ) {

        throw new Error(

            "Clipboard API is not supported."

        );

    }

    await navigator.clipboard.writeText(

        text

    );

}