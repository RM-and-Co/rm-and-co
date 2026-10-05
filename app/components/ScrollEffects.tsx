"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Scroll progress bar, hero parallax, and legacy #hash links from the old single-page site. */
const legacy: Record<string, string> = {
  "#rm-risk": "/rm-risk/", "#rm-mobility": "/rm-mobility/", "#portfolio": "/rm-digital/",
  "#about": "/about/", "#businesses": "/businesses/", "#contact": "/contact/",
};

export default function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/" && legacy[window.location.hash]) window.location.replace(legacy[window.location.hash]);
  }, [pathname]);

  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".scroll-progress");
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = root.scrollHeight - window.innerHeight;
      bar?.style.setProperty("--p", max > 0 ? String(window.scrollY / max) : "0");
      root.style.setProperty("--sy", String(Math.min(window.scrollY, 900)));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(frame); };
  }, [pathname]);

  return <div className="scroll-progress" aria-hidden="true" />;
}
