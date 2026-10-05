import Link from "next/link";
import Reveal from "./Reveal";
import { EMAIL } from "../data";

export default function CtaBand({ eyebrow = "Work with RM & Co.", title, copy, subject = "RM & Co. enquiry" }: { eyebrow?: string; title: string; copy: string; subject?: string }) {
  return (
    <section className="cta-band">
      <i className="orb orb-a" aria-hidden="true" />
      <Reveal className="cta-inner">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{copy}</p>
        <div className="actions">
          <a className="button primary" href={`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`}>{EMAIL}<span aria-hidden="true">→</span></a>
          <Link className="button ghost" href="/contact">All enquiries</Link>
        </div>
      </Reveal>
    </section>
  );
}
