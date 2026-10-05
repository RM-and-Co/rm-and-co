import Link from "next/link";
import CountUp from "./components/CountUp";
import CtaBand from "./components/CtaBand";
import Logo from "./components/Logo";
import PageHero from "./components/PageHero";
import Reveal from "./components/Reveal";
import SectionHead from "./components/SectionHead";
import UnitPanels from "./components/UnitPanels";
import { mobilityServices, portfolio, principles, riskServices } from "./data";

const stats = [
  { n: 5, label: "Business lines" },
  { n: 4, label: "Digital businesses" },
  { n: 7, label: "Mobility service lines" },
  { n: 8, label: "Risk service lines" },
];

const words = ["Digital", "Mobility", "Capital", "Industrial", "Risk"];

export default function Home() {
  return <>
    <PageHero
      tall
      eyebrow="Holding & operating company"
      title={<>Capability first.<br /><em>Then capital.</em></>}
      lead="RM & Co. brings patient ownership and operating discipline to digital products, mobility, capital and industrial capability. Our next chapter introduces RM Risk."
      actions={[{ href: "/businesses", label: "Explore the group" }, { href: "/about", label: "Our mandate", ghost: true }]}
      aside={
        <Link href="/rm-risk" className="spotlight">
          <span className="launch-status">Launching soon</span>
          <b>RM Risk</b>
          <p>Protecting value. Enabling confidence.</p>
          <span className="spotlight-link">Discover RM Risk <i aria-hidden="true">→</i></span>
        </Link>
      }
      stats={<>{stats.map((s) => <div key={s.label}><b><CountUp to={s.n} /></b><span>{s.label}</span></div>)}</>}
    />

    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[...words, ...words, ...words, ...words].map((w, i) => <span key={i}>{w}<i /></span>)}
      </div>
    </div>

    <section className="section statement">
      <Reveal><p className="section-no">01 / Our mandate</p></Reveal>
      <div className="statement-grid">
        <Reveal as="h2">One group. Multiple capabilities. <em>A deliberately long view.</em></Reveal>
        <Reveal className="prose" delay={120}>
          <p>RM &amp; Co. is the holdings company for a focused portfolio of operating businesses, products and future platforms. We build capability first, then allocate capital where the strategic and commercial case is strongest.</p>
          <p>The group creates shared advantage across technology, distribution, data, relationships and disciplined execution—while presenting each unit&apos;s maturity honestly.</p>
          <Link className="text-link" href="/about">About RM &amp; Co. <span aria-hidden="true">→</span></Link>
        </Reveal>
      </div>
    </section>

    <section className="section dark businesses-home">
      <SectionHead light no="02 / Businesses & units" title={<>An expanding group. <em>A shared ambition.</em></>} lead="Operating businesses are identified clearly. Developing platforms earn their independence through performance, governance and strategic fit." />
      <Reveal><UnitPanels /></Reveal>
    </section>

    <section className="section spotlight-digital">
      <SectionHead no="03 / RM Digital" title={<>Four businesses. <em>One digital home.</em></>} lead="RM Digital owns FleetOrbit, Shopping Lyst, OpenWheels and Orbit eDrive, and builds products including Field Force." />
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
