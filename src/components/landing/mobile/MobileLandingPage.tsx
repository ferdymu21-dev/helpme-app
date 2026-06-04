import MobileLandingNavbar from "./MobileLandingNavbar";

import MobileHero from "./MobileHero";

import MobileHowItWorks from "./MobileHowItWorks";

import MobilePopularCategories from "./MobilePopularCategories";

export default function MobileLandingPage() {
  return (
    <main className="min-h-screen bg-white lg:hidden">

      <MobileLandingNavbar />

      <MobileHero />

      <MobileHowItWorks />

      <MobilePopularCategories />

    </main>
  );
}