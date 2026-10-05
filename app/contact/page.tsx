import type { Metadata } from "next";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { EMAIL, mail } from "../data";

export const metadata: Metadata = { title: "Contact", description: "Contact RM & Co. for operating partnerships, strategic opportunities and group enquiries." };

const enquiries = [
  { title: "Group & partnerships", copy: "Operating partnerships, strategic opportunities and group enquiries.", subject: "RM & Co. group enquiry" },
  { title: "RM Digital", copy: "Our portfolio businesses, a Field Force pilot or a strategic digital partnership.", subject: "RM Digital enquiry" },
  { title: "RM Mobility", copy: "Vehicle access, maintenance, assurance and fleet reporting.", subject: "RM Mobility enquiry" },
  { title: "RM Capital & RM Industrial", copy: "Investment, corporate finance, engineering and manufacturing opportunities.", subject: "RM Capital / RM Industrial enquiry" },
  { title: "RM Risk", copy: "Planned risk, governance, insurance advisory and continuity service lines.", subject: "RM Risk enquiry" },
];

export default function Contact() {
  return <>
    <PageHero
      eyebrow="Contact"
      title={<>Building something that belongs <em>in the portfolio?</em></>}
      lead="For operating partnerships, strategic opportunities and group enquiries, contact RM & Co."
      actions={[{ href: `mailto:${EMAIL}`, label: EMAIL }]}
    />
    <section className="section">
      <div className="enquiry-grid">
        {enquiries.map((e, i) => (
          <Reveal key={e.title} delay={(i % 3) * 90}>
            <a className="enquiry-card" href={mail(e.subject)}>
              <span className="enquiry-no">{String(i + 1).padStart(2, "0")}</span>
              <h2>{e.title}</h2>
              <p>{e.copy}</p>
              <b>Email us <i aria-hidden="true">→</i></b>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  </>;
}
