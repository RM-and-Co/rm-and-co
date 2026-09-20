import Link from "next/link";
import Logo from "./components/Logo";
import type { LogoId } from "./components/logo-data";
import MobilityServices from "./components/MobilityServices";
import Portfolio, { RiskLaunch } from "./components/Portfolio";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";

const businesses: { number: string; name: string; state: string; tagline: string; copy: string; href: string; logo: LogoId }[] = [
  { number: "01", name: "RM Digital", state: "Operating", tagline: "Data. Intelligence. Impact.", copy: "Owner of FleetOrbit, Shopping Lyst, OpenWheels and Orbit eDrive. Also home to Field Force.", href: "/rm-digital", logo: "rm-digital-reversed" },
  { number: "02", name: "RM Mobility", state: "Operating", tagline: "Smarter mobility. Stronger futures.", copy: "Fleet leasing, rentals, maintenance, audits, inspections and reporting. RM Mobility holds a part-ownership stake in Element Bridge.", href: "#rm-mobility", logo: "rm-mobility" },
  { number: "03", name: "RM Capital", state: "Platform", tagline: "Invest. Grow. Transform.", copy: "Disciplined investment, corporate finance and strategic capital allocation.", href: "#contact", logo: "rm-capital" },
  { number: "04", name: "RM Industrial", state: "Platform", tagline: "Engineering possibility.", copy: "Engineering, manufacturing and infrastructure-linked operating capability.", href: "#contact", logo: "rm-industrial" },
  { number: "05", name: "RM Risk", state: "Launching soon", tagline: "Protecting value. Enabling confidence.", copy: "Enterprise and operational risk, governance and compliance, insurance and claims advisory, mobility risk and business resilience.", href: "#rm-risk", logo: "rm-risk" },
];

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#businesses", label: "Businesses" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#rm-mobility", label: "Mobility" },
  { href: "#rm-risk", label: "RM Risk" },
];

const principles = [
  { title: "Build before we multiply", copy: "Deepen the operating engine before adding unnecessary complexity." },
  { title: "Own strategic capability", copy: "Prioritise technology, IP, distribution, data and operating know-how." },
  { title: "Allocate deliberately", copy: "Every new venture competes for capital against the core." },
  { title: "Compound over time", copy: "Prefer durable value creation over short-lived optics." },
];

export default function Home() {
  return <>
    <SiteHeader
      brand={{ href: "/", logo: "rm-and-co", label: "RM & Co. home", alt: "RM & Co." }}
      links={navLinks}
      cta={{ href: "#contact", label: "Contact" }}
    />
    <main id="main-content">
      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">Holding &amp; operating company</p>
          <h1>Capability first. Then capital.</h1>
          <p>RM &amp; Co. brings patient ownership and operating discipline to digital products, mobility, capital and industrial capability. Our next chapter introduces RM Risk.</p>
          <div className="actions"><Link className="button primary" href="#businesses">Explore the group</Link><Link className="button ghost" href="#about">Our mandate</Link></div>
        </div>
        <aside className="hero-aside">
          <Logo id="rm-digital" alt="RM Digital — Data. Intelligence. Impact." className="logo-aside" priority />
          <p>FleetOrbit. Shopping Lyst. OpenWheels. Orbit eDrive. Four businesses, now owned by RM Digital.</p>
          <Link href="/rm-digital">Explore RM Digital <b aria-hidden="true">↗</b></Link>
        </aside>
        <div className="hero-index"><span><b>05</b> business lines, including RM Risk</span><span><b>01</b> disciplined group</span><span><b>ZA</b> South African base</span></div>
      </section>

      <section className="section manifesto" id="about">
        <p className="section-no">01 / Our mandate</p>
        <div>
          <h2>One group. Multiple capabilities. A deliberately long view.</h2>
          <div className="prose">
            <p>RM &amp; Co. is the holdings company for a focused portfolio of operating businesses, products and future platforms. We build capability first, then allocate capital where the strategic and commercial case is strongest.</p>
            <p>The group creates shared advantage across technology, distribution, data, relationships and disciplined execution—while presenting each unit&apos;s maturity honestly.</p>
          </div>
        </div>
      </section>

      <section className="section businesses" id="businesses">
        <div className="section-heading">
          <div><p className="section-no">02 / Businesses &amp; units</p><h2>An expanding group. A shared ambition.</h2></div>
          <p>Operating businesses are identified clearly. Developing platforms earn their independence through performance, governance and strategic fit.</p>
        </div>
        <div className="business-grid">
          {businesses.map((business) => (
            <Link className={`company-card${business.name === "RM Digital" ? " featured" : ""}`} key={business.name} href={business.href}>
              <div className="card-meta"><span className="card-index">{business.number}</span><small className="card-status">{business.state}</small></div>
              <div className="company-logo"><Logo id={business.logo} alt="" /></div>
              <h3 className="visually-hidden">{business.name}</h3>
              <p className="tagline">{business.tagline}</p>
              <p className="company-copy">{business.copy}</p>
              <b className="card-link">Explore <i aria-hidden="true">↗</i></b>
            </Link>
          ))}
        </div>
      </section>

      <Portfolio />
      <MobilityServices />
      <RiskLaunch />

      <section className="section principles">
        <p className="section-no light">03 / Operating principles</p>
        <div className="principles-grid">
          <div><p className="eyebrow">How we build</p><h2>Capital follows capability.</h2></div>
          <ol>
            {principles.map((principle, index) => (
              <li key={principle.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{principle.title}</strong><p>{principle.copy}</p></div></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section contact" id="contact">
        <div><p className="section-no">04 / Work with RM &amp; Co.</p><h2>Building something that belongs in the portfolio?</h2></div>
        <div><p>For operating partnerships, strategic opportunities and group enquiries, contact RM &amp; Co.</p><a className="button primary" href="mailto:hello@rmandco.co.za">hello@rmandco.co.za</a></div>
      </section>
    </main>
    <SiteFooter
      brand={{ href: "/", logo: "rm-and-co", alt: "RM & Co." }}
      blurb="RM & Co. is the holding company of RM Digital. Our growing group includes the upcoming RM Risk business."
      links={[{ href: "#about", label: "About" }, { href: "#businesses", label: "Businesses" }, { href: "/rm-digital", label: "RM Digital" }, { href: "#rm-mobility", label: "RM Mobility" }, { href: "#rm-risk", label: "RM Risk" }, { href: "#contact", label: "Contact" }]}
      copyright="© 2026 RM & Co. · South Africa"
    />
  </>;
}
