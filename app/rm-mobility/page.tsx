import type { Metadata } from "next";
import CtaBand from "../components/CtaBand";
import Logo from "../components/Logo";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import { mobilityServices } from "../data";

export const metadata: Metadata = { title: "RM Mobility", description: "RM Mobility: rent-to-own, full maintenance leasing, operating rentals, managed maintenance, fleet audits, inspections and assessment reporting. Part-owner of Element Bridge." };

export default function RmMobility() {
  return <>
    <PageHero
      eyebrow="RM & Co. / Mobility"
      title={<>From vehicle access <em>to fleet performance.</em></>}
      lead="Fleet leasing, rentals, maintenance, audits, inspections and reporting. RM Mobility holds a part-ownership stake in Element Bridge."
      actions={[{ href: "#services", label: "View services" }, { href: "/contact", label: "Discuss your fleet", ghost: true }]}
      aside={<div className="aside-card"><span className="aside-label">Smarter mobility. Stronger futures.</span><Logo id="rm-mobility" alt="RM Mobility" className="logo-aside" priority /><p>Seven service lines, from vehicle access to maintenance, assurance and reporting.</p></div>}
    />

    <section className="section" id="services">
      <SectionHead no="01 / Mobility services" title={<>Seven service lines. <em>One standard.</em></>} lead="Our mobility service offering spans the same seven service lines as Element Bridge, from vehicle access to maintenance, assurance and reporting." />
      <div className="service-grid">
        {mobilityServices.map((s, i) => (
          <Reveal key={s.title} delay={(i % 3) * 90} className="service-card">
            <span className="service-number">{String(i + 1).padStart(2, "0")}</span>
            <h3>{s.title}</h3>
            <p>{s.copy}</p>
            <a className="text-link" href={`https://www.elementbridge.co.za${s.href}`} aria-label={`${s.title} at Element Bridge`}>Explore service <span aria-hidden="true">↗</span></a>
          </Reveal>
        ))}
      </div>
    </section>

    <section className="section dark ownership">
      <Reveal className="ownership-card">
        <a href="https://www.elementbridge.co.za" aria-label="Visit Element Bridge" className="ownership-logo"><Logo id="element-bridge" alt="Element Bridge" className="logo-inline" /></a>
        <div><p className="section-no light">02 / Partnership</p><h2>Part-owned by <em>RM Mobility.</em></h2><p>Element Bridge retains its own brand and operating identity.</p></div>
        <a className="button primary" href="https://www.elementbridge.co.za/contact">Discuss your fleet needs<span aria-hidden="true">↗</span></a>
      </Reveal>
    </section>

    <CtaBand eyebrow="Work with RM Mobility" title="Move your fleet forward." copy="Talk to us about vehicle access, maintenance, assurance and fleet reporting." subject="RM Mobility enquiry" />
  </>;
}
