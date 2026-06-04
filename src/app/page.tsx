import MobileLandingPage from "@/components/landing/mobile/MobileLandingPage";

import DesktopLandingPage from "@/components/landing/desktop/DesktopLandingPage";

export default function LandingPage() {
  return (
    <>
      <MobileLandingPage />

      <DesktopLandingPage />
    </>
  );
}