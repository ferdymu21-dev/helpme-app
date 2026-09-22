import MobileLandingNavbar from "./MobileLandingNavbar";

import MobileHero from "./MobileHero";

import LandingHelpPaths from "../shared/LandingHelpPaths";

import MobileHowItWorks from "./MobileHowItWorks";

import MobilePopularCategories from "./MobilePopularCategories";

import LandingPaymentTransparency from "../shared/LandingPaymentTransparency";

import MobileSecuritySection from "./MobileSecuritySection";

import LandingProviderCTA from "../shared/LandingProviderCTA";

import MobileFinalCTA from "./MobileFinalCTA";

import MobileFAQSection from "./MobileFAQSection";

import MobileFooter from "./MobileFooter";

import LandingReveal from "../shared/LandingReveal";

import motionStyles from "../shared/LandingSectionMotion.module.css";

export default function MobileLandingPage() {
  return (
    <main
      className={`
            ${motionStyles.motionRoot}
            min-h-screen
          bg-white
            lg:hidden
          `}
    >
      <MobileLandingNavbar />

      <MobileHero />

      <LandingReveal>
        <LandingHelpPaths />
      </LandingReveal>

      <LandingReveal>
        <MobileHowItWorks />
      </LandingReveal>

      <LandingReveal>
        <MobilePopularCategories />
      </LandingReveal>

      <LandingReveal>
        <LandingPaymentTransparency sectionId="pembayaran-mobile" />
      </LandingReveal>

      <LandingReveal>
        <MobileSecuritySection />
      </LandingReveal>

      <LandingReveal>
        <LandingProviderCTA />
      </LandingReveal>

      <LandingReveal>
        <MobileFinalCTA />
      </LandingReveal>

      <LandingReveal>
        <MobileFAQSection />
      </LandingReveal>

      <MobileFooter />
    </main>
  );
}