"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { navLinks, units } from "../data";

const isActive = (pathname: string, href: string) => pathname.replace(/\/$/, "") === href;

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [seen, setSeen] = useState(pathname);
  const wrap = useRef<HTMLDivElement>(null);

  // Close menus when the route changes (state adjusted during render, per React guidance).
  if (seen !== pathname) { setSeen(pathname); setOpen(false); setMenu(false); }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); setMenu(false); } };
    const onClick = (event: MouseEvent) => { if (wrap.current && !wrap.current.contains(event.target as Node)) setMenu(false); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, []);

  useEffect(() => { document.body.classList.toggle("menu-locked", open); return () => document.body.classList.remove("menu-locked"); }, [open]);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <Link className="brand-link" href="/" aria-label="RM & Co. home">
        <Logo id="rm-and-co" alt="RM & Co." className="logo-header" priority />
      </Link>
      <button type="button" className="nav-toggle" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((v) => !v)}>
        <span className="nav-toggle-bars" aria-hidden="true" />
        <span className="nav-toggle-label">{open ? "Close" : "Menu"}</span>
      </button>
      <nav id="site-nav" className="site-nav" aria-label="Primary">
        <div className="nav-links" ref={wrap}>
          {navLinks.map((link) => link.href === "/businesses" ? (
            <div className="nav-group" key={link.href} onMouseEnter={() => matchMedia("(hover:hover)").matches && setMenu(true)} onMouseLeave={() => setMenu(false)}>
              <Link href={link.href} aria-current={isActive(pathname, link.href) ? "page" : undefined}>{link.label}</Link>
              <button type="button" className="nav-caret" aria-label="Show businesses menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)}><span aria-hidden="true" /></button>
              <div className={`mega${menu ? " is-open" : ""}`}>
                <div className="mega-grid">
                  {units.map((unit) => (
                    <Link key={unit.slug} href={unit.href} className="mega-item" tabIndex={menu ? 0 : -1}>
                      <span className="mega-logo"><Logo id={unit.logo === "rm-digital-reversed" ? "rm-digital" : unit.logo} alt="" /></span>
                      <span className="mega-text"><b>{unit.name}</b><small>{unit.tagline}</small></span>
                      <i aria-hidden="true">→</i>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Link key={link.href} href={link.href} aria-current={isActive(pathname, link.href) ? "page" : undefined}>{link.label}</Link>
          ))}
        </div>
        <Link className="nav-cta" href="/contact">Contact us</Link>
      </nav>
    </header>
  );
}
