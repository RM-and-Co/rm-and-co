import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../components/Logo";
import Portfolio from "../components/Portfolio";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

export const metadata: Metadata = { title: "RM Digital", description: "RM Digital owns FleetOrbit, Shopping Lyst, OpenWheels and Orbit eDrive, and builds digital products including Field Force. Part of RM & Co." };

const capabilities = [
  { number: "01", label: "Performance", title: "Sales intelligence", copy: "Targets, trends, team comparisons and adviser-level coaching signals.", featured: true },
  { number: "02", label: "Operations", title: "Workflow control", copy: "Structured intake, evidence requirements and source-aware queues." },
  { number: "03", label: "Trust", title: "Honest reporting", copy: "Unavailable measures remain unavailable until their real source is connected." },
];

export default function RmDigital() {
  return <>
    <SiteHeader
      brand={{ href: "/rm-digital", logo: "rm-digital", label: "RM Digital home", alt: "RM Digital — Data. Intelligence. Impact." }}
      links={[{ href: "/", label: "RM & Co." }, { href: "#portfolio", label: "Our businesses" }, { href: "/#rm-risk", label: "RM Risk" }]}
      cta={{ href: "https://fieldforce.rmandco.co.za", label: "Field Force", external: true }}
    />
    <main id="main-content">
      <section className="hero digital-hero">
        <div className="hero-copy">
          <p className="eyebrow">RM &amp; Co. / Digital business</p>
          <h1>Data. Intelligence. Impact.</h1>
          <p>The digital home of FleetOrbit, Shopping Lyst, OpenWheels and Orbit eDrive. We own and build businesses that bring useful technology into everyday life and real operations.</p>
          <div className="actions"><Link className="button primary" href="#portfolio">Explore our businesses</Link><Link className="button ghost" href="/">Back to the group</Link></div>
        </div>
        <aside className="hero-aside product-aside">
          <span>Flagship product</span>
          <Logo id="field-force" alt="Field Force" className="logo-aside" priority />
          <p>A sales-performance and insurance-distribution workflow platform for field teams, operations and compliance.</p>
          <a href="https://fieldforce.rmandco.co.za">Visit product site <b aria-hidden="true">↗</b></a>
        </aside>
        <div className="hero-index"><span><b>SW</b> Software</span><span><b>AI</b> Intelligence</span><span><b>AN</b> Analytics</span><span><b>CL</b> Cloud</span></div>
      </section>

      <Portfolio />

      <section className="section manifesto" id="capabilities">
        <p className="section-no">01 / What we build</p>
        <div>
          <h2>Digital products grounded in real operations.</h2>
          <div className="prose">
            <p>RM Digital translates field processes, source documents and fragmented reporting into clear systems that help teams execute, supervise and improve.</p>
            <p>Our products preserve source truth, expose data gaps and scale from operational pilots into durable enterprise platforms.</p>
          </div>
        </div>
      </section>

      <section className="section businesses" id="field-force">
        <div className="section-heading">
          <div><p className="section-no">02 / Flagship product</p><h2>Field Force</h2></div>
          <p>One operating view for field sales performance, source-controlled evidence, commission reconciliation and the workflows that connect them.</p>
        </div>
        <div className="capability-grid">
          {capabilities.map((item) => (
            <article className={`capability-card${item.featured ? " featured" : ""}`} key={item.title}>
              <div className="card-meta"><span className="card-index">{item.number}</span><small className="card-status">{item.label}</small></div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section contact" id="contact">
        <div><p className="section-no">03 / Work with RM Digital</p><h2>Turn operational complexity into a product advantage.</h2></div>
        <div><p>Talk to us about our portfolio businesses, a Field Force pilot or a strategic digital partnership.</p><a className="button primary" href="mailto:hello@rmandco.co.za?subject=RM%20Digital%20enquiry">Start a conversation</a></div>
      </section>
    </main>
    <SiteFooter
      brand={{ href: "/rm-digital", logo: "rm-digital", alt: "RM Digital" }}
      blurb="RM Digital is a subsidiary of RM & Co. Owner of FleetOrbit, Shopping Lyst, OpenWheels and Orbit eDrive. Field Force is a product of RM Digital."
      links={[{ href: "/", label: "RM & Co." }, { href: "#portfolio", label: "Our businesses" }, { href: "#contact", label: "Contact" }, { href: "https://fieldforce.rmandco.co.za", label: "Field Force" }]}
      copyright="© 2026 RM & Co."
    />
  </>;
}
