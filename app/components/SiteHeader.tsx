"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import type { LogoId } from "./logo-data";

type NavLink = { href: string; label: string };
type SiteHeaderProps = {
  brand: { href: string; logo: LogoId; label: string; alt: string };
  links: NavLink[];
  cta: NavLink & { external?: boolean };
};

export default function SiteHeader({ brand, links, cta }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Highlight the nav link for the section crossing the middle of the viewport.
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("main section[id]");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <Link className="brand-link" href={brand.href} aria-label={brand.label} onClick={close}>
        <Logo id={brand.logo} alt={brand.alt} className="logo-header" priority />
      </Link>
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="nav-toggle-bars" aria-hidden="true" />
        <span className="nav-toggle-label">{open ? "Close" : "Menu"}</span>
      </button>
      <nav id="site-nav" className="site-nav" aria-label="Primary">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={close}
            aria-current={active && link.href === `#${active}` ? "location" : undefined}
          >
            {link.label}
          </Link>
        ))}
        {cta.external ? (
          <a className="nav-cta" href={cta.href} onClick={close}>{cta.label}</a>
        ) : (
          <Link className="nav-cta" href={cta.href} onClick={close}>{cta.label}</Link>
        )}
      </nav>
    </header>
  );
}
