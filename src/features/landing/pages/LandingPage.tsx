"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import HeroSection from "@/components/landing/desktop/HeroSection";
import PopularServicesSection from "@/components/landing/desktop/DesktopPopularCategories";

import { useAuthStore } from "@/store/auth.store";

export default function LandingPage() {
  const router = useRouter();

  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <HeroSection />

      <PopularServicesSection />
    </main>
  );
}