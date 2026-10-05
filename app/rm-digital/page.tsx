import type { Metadata } from "next";
import CtaBand from "../components/CtaBand";
import Logo from "../components/Logo";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import { portfolio } from "../data";

export const metadata: Metadata = { title: "RM Digital", description: "RM Digital owns FleetOrbit, Shopping Lyst, OpenWheels and Orbit eDrive, and builds digital products including Field Force. Part of RM & Co." };

const capabilities = [
  { number: "01", label: "Performance", title: "Sales intelligence", copy: "Targets, trends, team comparisons and adviser-level coaching signals." },
  { number: "02", label: "Operations", title: "Workflow control", copy: "Structured intake, evidence requirements and source-aware queues." },
  { number: "03", label: "Trust", title: "Honest reporting", copy: "Unavailable measures remain unavailable until their real source is connected." },
];

export default function RmDigital() {
  return <>
    <PageHero
      eyebrow="RM & Co. / Digital business"
      title={<>Data. Intelligence. <em>Impact.</em></>}
      lead="The digital home of FleetOrbit, Shopping Lyst, OpenWheels and Orbit eDrive. RM Digital is a subsidiary of RM & Co. We own and build businesses that bring useful technology into everyday life and real operations."
      actions={[{ href: "#portfolio", label: "Explore our businesses" }, { href: "/businesses", label: "Back to the group", ghost: true }]}
      aside={<div className="aside-card"><span className="aside-label">Flagship product</span><Logo id="field-force" alt="Field Force" className="logo-aside" priority /><p>A sales-performance and insurance-distribution workflow platform for field teams, operations and compliance.</p><a href="https://fieldforce.rmandco.co.za">Visit product site <i aria-hidden="true">↗</i></a></div>}
      stats={<><div><b>SW</b><span>Software</span></div><div><b>AI</b><span>Intelligence</span></div><div><b>AN</b><span>Analytics</span></div><div><b>CL</b><span>Cloud</span></div></>}
    />

    <section className="section" id="portfolio">
      <SectionHead no="01 / The RM Digital portfolio" title={<>Four businesses. <em>One digital home.</em></>} lead="RM Digital owns FleetOrbit, Shopping Lyst, OpenWheels and Orbit eDrive. Each brings its own focus to a portfolio built around useful technology." />
      <div className="portfolio-grid">
        {portfolio.map((c, i) => (
          <Reveal as="article" key={c.name} delay={(i % 2) * 100} className="portfolio-card">
            <div className="portfolio-top">
              <div className="product-logo">{c.logo ? <Logo id={c.logo} alt="" /> : <span className="text-wordmark" aria-hidden="true">Orbit eDrive</span>}</div>
              <span className="portfolio-number">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="visually-hidden">{c.name}</h3>
            <p className="portfolio-category">{c.category}</p>
            <p className="portfolio-description">{c.copy}</p>
            <a className="text-link" href={c.href}>{c.action}<span aria-hidden="true">↗</span></a>
          </Reveal>
        ))}
      </div>
    </section>

    <section className="section dark" id="field-force">
      <SectionHead light no="02 / Flagship product" title={<>Field <em>Force.</em></>} lead="One operating view for field sales performance, source-controlled evidence, commission reconciliation and the workflows that connect them." />
      <div className="capability-grid">
        {capabilities.map((item, i) => (
          <Reveal key={item.title} delay={i * 100} className="capability-card">
            <div className="card-meta"><span>{item.number}</span><small>{item.label}</small></div>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </Reveal>
        ))}
      </div>
      <Reveal className="section-cta"><a className="button primary" href="https://fieldforce.rmandco.co.za">Visit Field Force<span aria-hidden="true">↗</span></a></Reveal>
    </section>

    <section className="section statement" id="capabilities">
      <Reveal><p className="section-no">03 / What we build</p></Reveal>
      <div className="statement-grid">
        <Reveal as="h2">Digital products grounded in <em>real operations.</em></Reveal>
        <Reveal className="prose" delay={120}>
          <p>RM Digital translates field processes, source documents and fragmented reporting into clear systems that help teams execute, supervise and improve.</p>
          <p>Our products preserve source truth, expose data gaps and scale from operational pilots into durable enterprise platforms.</p>
        </Reveal>
      </div>
    </section>

    <CtaBand eyebrow="Work with RM Digital" title="Turn operational complexity into a product advantage." copy="Talk to us about our portfolio businesses, a Field Force pilot or a strategic digital partnership." subject="RM Digital enquiry" />
  </>;
}
