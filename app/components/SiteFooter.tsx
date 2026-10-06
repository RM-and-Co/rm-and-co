import Link from "next/link";
import Logo from "./Logo";
import { EMAIL, navLinks, units } from "../data";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link href="/" aria-label="RM & Co. home"><Logo id="rm-and-co" alt="RM & Co." className="logo-footer" /></Link>
          <p>RM &amp; Co. is a South African holding and operating company. Our group includes RM Digital, RM Mobility, RM Capital and RM Industrial, with RM Risk launching soon.</p>
        </div>
        <nav aria-label="Footer">
          <span className="footer-label">Company</span>
          {navLinks.filter((l) => !units.some((u) => u.href === l.href)).map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="footer-col">
          <span className="footer-label">Group businesses</span>
          {units.map((unit) => <Link key={unit.slug} href={unit.href}>{unit.name}</Link>)}
        </div>
        <div className="footer-col footer-contact">
          <span className="footer-label">Enquiries</span>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <p>South Africa</p>
        </div>
      </div>
      <div className="footer-signature" aria-hidden="true">RM <em>&amp;</em> Co.</div>
      <p className="footer-base"><span>© 2026 RM &amp; Co. · South Africa</span><span>RM AND CO HOLDINGS (PTY) LTD · 2026/789027/07</span></p>
    </footer>
  );
}
