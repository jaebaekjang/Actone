"use client";

import { useEffect } from "react";

/**
 * Landing scroll effects, CSS-first with minimal JS:
 * - [data-reveal] elements fade/rise in once when they enter the viewport
 * - [data-parallax] elements drift slightly against the scroll (hero title)
 * Both are disabled for prefers-reduced-motion users.
 */
export function ScrollFx() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document
        .querySelectorAll("[data-reveal]")
        .forEach((el) => el.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));

    const parallaxEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]"),
    );
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        for (const el of parallaxEls) {
          el.style.transform = `translateY(${Math.min(y * 0.06, 48)}px)`;
          el.style.opacity = String(Math.max(1 - y / 700, 0));
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
