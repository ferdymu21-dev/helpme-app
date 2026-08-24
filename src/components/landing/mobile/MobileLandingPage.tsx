import MobileLandingNavbar from "./MobileLandingNavbar";

import MobileHero from "./MobileHero";

import MobileHowItWorks from "./MobileHowItWorks";

import MobilePopularCategories from "./MobilePopularCategories";

import MobileSecuritySection from "./MobileSecuritySection";

import MobileFinalCTA from "./MobileFinalCTA";

import MobileFAQSection from "./MobileFAQSection";

import MobileFooter from "./MobileFooter";

export default function MobileLandingPage() {
  return (
    <main className="min-h-screen bg-white lg:hidden">
      <MobileLandingNavbar />

      <MobileHero />

      <MobileHowItWorks />

      <MobilePopularCategories />

      <MobileSecuritySection />

      <MobileFinalCTA />

      <MobileFAQSection />

      <MobileFooter />
    </main>
  );
}