import Link from "next/link";
import CtaBand from "./components/CtaBand";
import Logo from "./components/Logo";
import Reveal from "./components/Reveal";
import SectionHead from "./components/SectionHead";
import UnitPanels from "./components/UnitPanels";
import { mobilityServices, portfolio, principles, riskServices } from "./data";

export default function Home() {
  return <>
    <section className="signature-hero">
      {/* Pre-compressed static artwork: 95 KB, served directly by the static export. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="architecture" src="/images/rm-architecture.webp" alt="" width="1920" height="1081" fetchPriority="high" />
      <div className="signature-content">
        <p className="eyebrow rise">RM &amp; Co. / Holding &amp; operating company</p>
        <h1 className="rise">Ambition.<br /><em>Made real.</em></h1>
        <div className="signature-intro rise"><span className="fine-rule" /><p>We build capability.<br />We connect opportunity.<br />We take the long view.</p></div>
        <Link href="/businesses" className="signature-link">Explore our world <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="hero-caption"><span>Independent thinking. Shared ambition.</span><span>Rooted in South Africa. Looking ahead.</span></div>
    </section>
    <div className="chapter-strip"><span>Five perspectives. One RM &amp; Co.</span><nav aria-label="Business lines"><Link href="/rm-digital">Digital</Link><Link href="/rm-mobility">Mobility</Link><Link href="/businesses#rm-capital">Capital</Link><Link href="/businesses#rm-industrial">Industrial</Link><Link href="/rm-risk">Risk</Link></nav></div>

    <section className="section statement">
      <Reveal><p className="section-no">01 / Our mandate</p></Reveal>
      <div className="statement-grid">
        <Reveal as="h2">Built with purpose.<br /><em>Owned with conviction.</em></Reveal>
        <Reveal className="prose" delay={120}>
          <p>From technology that simplifies operations to mobility that keeps businesses moving, RM &amp; Co. brings specialist capabilities together under one ambitious South African company.</p>
          <p>Our approach is practical: build useful businesses, develop strong partnerships and create value that lasts.</p>
          <Link className="text-link" href="/about">About RM &amp; Co. <span aria-hidden="true">→</span></Link>
        </Reveal>
      </div>
    </section>

    <section className="section dark businesses-home">
      <SectionHead light no="02 / Businesses & units" title={<>Specialist focus.<br /><em>Collective strength.</em></>} lead="Discover the five business lines shaping our direction, from operating capabilities to our next chapter in risk." />
      <Reveal><UnitPanels /></Reveal>
    </section>

    <section className="section spotlight-digital">
      <SectionHead no="03 / RM Digital" title={<>Ideas become products.<br /><em>Products create possibility.</em></>} lead="RM Digital owns FleetOrbit, Shopping Lyst, OpenWheels and Orbit eDrive, and builds products including Field Force." />
      <div className="logo-wall">
        {portfolio.map((c, i) => (
          <Reveal key={c.name} delay={i * 80} className="logo-tile">
            {c.logo ? <Logo id={c.logo} alt={c.name} /> : <span className="text-wordmark">Orbit eDrive</span>}
            <small>{c.category.split(" · ")[0]}</small>
          </Reveal>
        ))}
      </div>
      <Reveal className="section-cta"><Link className="button dark" href="/rm-digital">Explore RM Digital<span aria-hidden="true">→</span></Link></Reveal>
    </section>

    <section className="section split-feature">
      <Reveal className="feature-card mobility">
        <p className="section-no">04 / RM Mobility</p>
        <h2>From vehicle access <em>to fleet performance.</em></h2>
        <p>{mobilityServices.length} service lines spanning rent-to-own, leasing, rentals, maintenance, audits, inspections and reporting, alongside our part-ownership of Element Bridge.</p>
        <Link className="text-link" href="/rm-mobility">Explore RM Mobility <span aria-hidden="true">→</span></Link>
      </Reveal>
      <Reveal className="feature-card risk" delay={120}>
        <p className="section-no light">05 / RM Risk · Launching soon</p>
        <h2>Expertise for a <em>more resilient tomorrow.</em></h2>
        <ul className="chips">{riskServices.slice(0, 5).map((s) => <li key={s.title}>{s.title}</li>)}<li>+3 more</li></ul>
        <Link className="text-link light" href="/rm-risk">Explore RM Risk <span aria-hidden="true">→</span></Link>
      </Reveal>
    </section>

    <section className="section principles">
      <div className="principles-grid">
        <Reveal className="sticky-head"><p className="section-no light">06 / Operating principles</p><h2>Capital follows <em>capability.</em></h2></Reveal>
        <ol>
          {principles.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 80}><span>{String(i + 1).padStart(2, "0")}</span><div><strong>{p.title}</strong><p>{p.copy}</p></div></Reveal>
          ))}
        </ol>
      </div>
    </section>

    <CtaBand title="Building something that belongs in the portfolio?" copy="For operating partnerships, strategic opportunities and group enquiries, contact RM & Co." />
  </>;
}
