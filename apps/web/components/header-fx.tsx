"use client";

import { useEffect } from "react";

/**
 * Marks the site header with [data-scrolled] once the page scrolls,
 * so it can fade from a translucent lobby bar into a solid one.
 */
export function HeaderFx() {
  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;
    const onScroll = () => {
      header.toggleAttribute("data-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}
