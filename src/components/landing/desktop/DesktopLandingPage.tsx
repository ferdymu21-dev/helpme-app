import DesktopNavbar from "./DesktopNavbar";

import HeroSection from "./HeroSection";

import DesktopHowItWorks from "./DesktopHowItWorks";

import PopularServicesSection from "./DesktopPopularCategories";

import DesktopSecuritySection from "./DesktopSecuritySection";

import DesktopFinalCTA from "./DesktopFinalCTA";

import DesktopFAQSection from "./DesktopFAQSection";

import DesktopFooter from "./DesktopFooter";

export default function DesktopLandingPage() {
  return (
    <div className="hidden lg:block">
      <main className="min-h-screen bg-white">
        <DesktopNavbar />

        <HeroSection />

        <DesktopHowItWorks />

        <PopularServicesSection />

        <DesktopSecuritySection />

        <DesktopFinalCTA />

        <DesktopFAQSection />

        <DesktopFooter />
      </main>
    </div>
  );
}