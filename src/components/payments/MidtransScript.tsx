import Script from "next/script";

export default function MidtransScript() {
  const isProduction =
    process.env.MIDTRANS_IS_PRODUCTION === "true";

  const snapScriptUrl = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <Script
      id="midtrans-script"
      src={snapScriptUrl}
      data-client-key={
        process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
      }
      strategy="afterInteractive"
    />
  );
}