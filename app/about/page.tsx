import type { Metadata } from "next";
import CtaBand from "../components/CtaBand";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import { principles } from "../data";

export const metadata: Metadata = { title: "About", description: "RM & Co. is the holding company for a focused portfolio of operating businesses, products and future platforms, built on patient ownership and operating discipline." };

const maturity = [
  { state: "Operating", copy: "Businesses with live operations and offerings, identified clearly as such.", examples: "RM Digital · RM Mobility" },
  { state: "Platform", copy: "Developing platforms that earn their independence through performance, governance and strategic fit.", examples: "RM Capital · RM Industrial" },
  { state: "Launching soon", copy: "New businesses introduced openly, with planned scope distinguished from what is available today.", examples: "RM Risk" },
];

const structure = [
  { name: "RM Digital", children: ["FleetOrbit", "Shopping Lyst", "OpenWheels", "Orbit eDrive", "Field Force (product)"] },
  { name: "RM Mobility", children: ["Part-owner of Element Bridge"] },
  { name: "RM Capital", children: [] },
  { name: "RM Industrial", children: [] },
  { name: "RM Risk", children: ["Launching soon"] },
];

export default function About() {
  return <>
    <PageHero
      eyebrow="About RM & Co."
      title={<>Patient ownership. <em>Operating discipline.</em></>}
      lead="RM & Co. is the holdings company for a focused portfolio of operating businesses, products and future platforms. We build capability first, then allocate capital where the strategic and commercial case is strongest."
    />

    <section className="section statement">
      <Reveal><p className="section-no">01 / Our mandate</p></Reveal>
      <div className="statement-grid">
        <Reveal as="h2">One group. Multiple capabilities. <em>A deliberately long view.</em></Reveal>
        <Reveal className="prose" delay={120}>
          <p>The group creates shared advantage across technology, distribution, data, relationships and disciplined execution, while presenting each unit&apos;s maturity honestly.</p>
          <p>We are headquartered in South Africa and organised as one disciplined group with five business lines.</p>
        </Reveal>
      </div>
    </section>

    <section className="section dark">
      <SectionHead light no="02 / Group structure" title={<>Five business lines. <em>One group.</em></>} lead="RM & Co. brings five business lines together under RM AND CO HOLDINGS (PTY) LTD." />
      <Reveal className="structure">
        <div className="structure-root"><b>RM &amp; Co.</b><small>Holding &amp; operating company</small></div>
        <ul className="structure-branches">
          {structure.map((s) => (
            <li key={s.name}>
              <b>{s.name}</b>
              {s.children.length > 0 && <ul>{s.children.map((c) => <li key={c}>{c}</li>)}</ul>}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>

    <section className="section">
      <SectionHead no="03 / How we build" title={<>Capital follows <em>capability.</em></>} />
      <div className="principle-cards">
        {principles.map((p, i) => (
          <Reveal key={p.title} delay={i * 80} className="principle-card">
            <span>{String(i + 1).padStart(2, "0")}</span>
            <h3>{p.title}</h3>
            <p>{p.copy}</p>
          </Reveal>
        ))}
      </div>
    </section>

    <section className="section stone">
      <SectionHead no="04 / Honest maturity" title={<>We say where <em>each business stands.</em></>} lead="Every unit is labelled by what it is today, not by what it intends to become." />
      <div className="maturity">
        {maturity.map((m, i) => (
          <Reveal key={m.state} delay={i * 100} className="maturity-card">
            <small className="state">{m.state}</small>
            <p>{m.copy}</p>
            <b>{m.examples}</b>
          </Reveal>
        ))}
      </div>
    </section>

    <CtaBand title="Let’s talk about the long view." copy="For operating partnerships, strategic opportunities and group enquiries, contact RM & Co." subject="RM & Co. group enquiry" />
  </>;
}
