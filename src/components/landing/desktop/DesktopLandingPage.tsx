import DesktopNavbar from "./DesktopNavbar";

import HeroSection from "./HeroSection";

import PopularServicesSection from "./DesktopPopularCategories";

export default function DesktopLandingPage() {
  return (
    <div className="hidden lg:block">

      <main className="min-h-screen bg-white">

        <DesktopNavbar />

        <HeroSection />

        <PopularServicesSection />

      </main>

    </div>
  );
}