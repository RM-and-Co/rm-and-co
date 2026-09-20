import Link from "next/link";
import Logo from "./Logo";
import type { LogoId } from "./logo-data";

type SiteFooterProps = {
  brand: { href: string; logo: LogoId; alt: string };
  blurb: string;
  links: { href: string; label: string }[];
  copyright: string;
};

export default function SiteFooter({ brand, blurb, links, copyright }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link href={brand.href}><Logo id={brand.logo} alt={brand.alt} className="logo-footer" /></Link>
          <p>{blurb}</p>
        </div>
        <nav aria-label="Footer">
          {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <div className="footer-contact">
          <span>Enquiries</span>
          <a href="mailto:hello@rmandco.co.za">hello@rmandco.co.za</a>
        </div>
      </div>
      <p className="footer-base">{copyright}</p>
    </footer>
  );
}
