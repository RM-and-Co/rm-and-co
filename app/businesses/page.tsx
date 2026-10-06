import type { Metadata } from "next";
import Link from "next/link";
import CtaBand from "../components/CtaBand";
import Logo from "../components/Logo";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { mail, units } from "../data";

export const metadata: Metadata = { title: "Businesses", description: "The RM & Co. group: RM Digital, RM Mobility, RM Capital, RM Industrial and RM Risk." };

export default function Businesses() {
  return <>
    <PageHero
      eyebrow="Businesses & units"
      title={<>An expanding group. <em>A shared ambition.</em></>}
      lead="Operating businesses are identified clearly. Developing platforms earn their independence through performance, governance and strategic fit."
    />
    <section className="section unit-list">
      {units.map((unit, i) => {
        const hasPage = unit.href.indexOf("#") === -1;
        return (
          <Reveal key={unit.slug} className={`unit-row${i % 2 ? " flip" : ""}`}>
            <div className="unit-anchor" id={unit.slug} />
            <div className="unit-visual">
              <span className="unit-number">{unit.number}</span>
              <div className="unit-logo"><Logo id={unit.logo === "rm-digital-reversed" ? "rm-digital" : unit.logo} alt={unit.name} /></div>
            </div>
            <div className="unit-text">
              <small className="state">{unit.state}</small>
              <h2>{unit.name}</h2>
              <p className="tagline">{unit.tagline}</p>
              <p>{unit.copy}</p>
              <ul className="chips dark">{unit.points.map((p) => <li key={p}>{p}</li>)}</ul>
              {hasPage
                ? <Link className="button dark" href={unit.href}>Explore {unit.name}<span aria-hidden="true">→</span></Link>
                : <a className="button dark" href={mail(`${unit.name} enquiry`)}>Enquire about {unit.name}<span aria-hidden="true">→</span></a>}
              {unit.slug === "rm-industrial" && <div style={{ marginTop: "1rem" }}>
                <a className="button dark" href="/businesses/rm-industrial/egoli/index.html">Open Egoli operations demo<span aria-hidden="true">↗</span></a>
                <p style={{ fontSize: "0.85rem", marginTop: "0.75rem" }}>Interactive process maps and capacity planning. Illustrative scenarios; client inputs remain unconfirmed.</p>
              </div>}
            </div>
          </Reveal>
        );
      })}
    </section>
    <CtaBand title="Building something that belongs in the portfolio?" copy="For operating partnerships, strategic opportunities and group enquiries, contact RM & Co." />
  </>;
}
