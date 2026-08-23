"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

export default function AutoHideMobileBottomNavbar() {
  const [
    isVisible,
    setIsVisible,
  ] = useState(true);

  const lastScrollYRef =
    useRef(0);

  useEffect(() => {
    lastScrollYRef.current =
      window.scrollY;

    function handleScroll() {
      const currentScrollY =
        window.scrollY;

      const previousScrollY =
        lastScrollYRef.current;

      /* =========================
          ALWAYS SHOW NEAR TOP
      ========================= */
      if (currentScrollY <= 16) {
        setIsVisible(true);

        lastScrollYRef.current =
          currentScrollY;

        return;
      }

      /* =========================
          SCROLL DOWN
          HIDE NAVBAR
      ========================= */
      if (
        currentScrollY >
        previousScrollY + 8
      ) {
        setIsVisible(false);

        lastScrollYRef.current =
          currentScrollY;

        return;
      }

      /* =========================
          SCROLL UP
          SHOW NAVBAR
      ========================= */
      if (
        currentScrollY <
        previousScrollY - 8
      ) {
        setIsVisible(true);

        lastScrollYRef.current =
          currentScrollY;
      }
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="lg:hidden">
      <MobileBottomNavbar />
    </div>
  );
}