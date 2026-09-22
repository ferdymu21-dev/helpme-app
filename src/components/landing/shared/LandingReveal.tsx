"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import styles from "./LandingSectionMotion.module.css";

interface LandingRevealProps {
  children: ReactNode;
}

export default function LandingReveal({
  children,
}: LandingRevealProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element =
      containerRef.current;

    if (!element) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    if (reducedMotion.matches) {
      element.dataset.revealState =
        "visible";

      return;
    }

    const rect =
      element.getBoundingClientRect();

    const initiallyVisible =
      rect.bottom > 0 &&
      rect.top <
        window.innerHeight * 0.92;

    if (initiallyVisible) {
      element.dataset.revealState =
        "visible";

      return;
    }

    element.dataset.revealState =
      "hidden";

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (!entry?.isIntersecting) {
            return;
          }

          element.dataset.revealState =
            "visible";

          observer.disconnect();
        },
        {
          threshold: 0.08,
          rootMargin:
            "0px 0px -10% 0px",
        },
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.reveal}
    >
      {children}
    </div>
  );
}