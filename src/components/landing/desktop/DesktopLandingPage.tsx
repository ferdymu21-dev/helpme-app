import DesktopNavbar from "./DesktopNavbar";

import HeroSection from "./HeroSection";

import LandingHelpPaths from "../shared/LandingHelpPaths";

import DesktopHowItWorks from "./DesktopHowItWorks";

import PopularServicesSection from "./DesktopPopularCategories";

import LandingPaymentTransparency from "../shared/LandingPaymentTransparency";

import DesktopSecuritySection from "./DesktopSecuritySection";

import LandingProviderCTA from "../shared/LandingProviderCTA";

import DesktopFinalCTA from "./DesktopFinalCTA";

import DesktopFAQSection from "./DesktopFAQSection";

import DesktopFooter from "./DesktopFooter";

import LandingReveal from "../shared/LandingReveal";

import motionStyles from "../shared/LandingSectionMotion.module.css";

export default function DesktopLandingPage() {
  return (
    <div className="hidden lg:block">
      <main
        className={`
          ${motionStyles.motionRoot}
          min-h-screen
        bg-white
       `}
      >
        <DesktopNavbar />

        <HeroSection />

        <LandingReveal>
          <LandingHelpPaths />
        </LandingReveal>

        <LandingReveal>
          <DesktopHowItWorks />
        </LandingReveal>

        <LandingReveal>
          <PopularServicesSection />
        </LandingReveal>

        <LandingReveal>
          <LandingPaymentTransparency sectionId="pembayaran" />
        </LandingReveal>

        <LandingReveal>
          <DesktopSecuritySection />
        </LandingReveal>

        <LandingReveal>
          <LandingProviderCTA />
        </LandingReveal>

        <LandingReveal>
          <DesktopFinalCTA />
        </LandingReveal>

        <LandingReveal>
          <DesktopFAQSection />
        </LandingReveal>

        <DesktopFooter />
      </main>
    </div>
  );
}