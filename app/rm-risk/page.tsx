import type { Metadata } from "next";
import CtaBand from "../components/CtaBand";
import Logo from "../components/Logo";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import { riskApproach, riskServices } from "../data";

export const metadata: Metadata = { title: "RM Risk", description: "RM Risk is launching soon: enterprise and operational risk, GRC, insurance and claims advisory, fleet and mobility risk, supplier risk, health and safety, and business continuity." };

export default function RmRisk() {
  return <>
    <PageHero
      eyebrow="RM & Co. / Risk"
      title={<>Protecting value. <em>Enabling confidence.</em></>}
      lead="Helping organisations identify, assess, mitigate and monitor risk across operations and strategic decision-making."
      actions={[{ href: "#services", label: "Core service lines" }, { href: "/contact", label: "Enquire about RM Risk", ghost: true }]}
      aside={<div className="aside-card plate"><span className="launch-status">Launching soon</span><div className="risk-logo-plate"><Logo id="rm-risk" alt="RM Risk" priority /></div><p>People · Insight · Resilience · Long-term value</p></div>}
    />

    <section className="section" id="approach">
      <SectionHead no="01 / Our approach" title={<>Risk, made <em>visible and manageable.</em></>} lead="A disciplined cycle that keeps risk in view as your organisation changes." />
      <ol className="steps">
        {riskApproach.map((s, i) => (
          <Reveal as="li" key={s.title} delay={i * 100}><span>{String(i + 1).padStart(2, "0")}</span><h3>{s.title}</h3><p>{s.copy}</p></Reveal>
        ))}
      </ol>
    </section>

    <section className="section dark" id="services">
      <SectionHead light no="02 / Core service lines" title={<>Expertise for a <em>more resilient tomorrow.</em></>} lead="Launching soon. Contact us to discuss these planned service lines." />
      <div className="risk-grid">
        {riskServices.map((s, i) => (
          <Reveal key={s.title} delay={(i % 4) * 80} className="risk-card">
            <span>{String(i + 1).padStart(2, "0")}</span>
            <h3>{s.title}</h3>
            <p>{s.copy}</p>
          </Reveal>
        ))}
      </div>
    </section>

    <section className="section values">
      <Reveal className="values-row">
        {["People", "Insight", "Resilience", "Long-term value"].map((v) => <span key={v}>{v}</span>)}
      </Reveal>
    </section>

    <CtaBand eyebrow="RM Risk" title="Be among the first to talk to RM Risk." copy="Contact us to discuss the planned service lines and how RM Risk can support your organisation." subject="RM Risk enquiry" />
  </>;
}
