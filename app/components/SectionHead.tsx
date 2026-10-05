import type { ReactNode } from "react";
import Reveal from "./Reveal";

export default function SectionHead({ no, title, lead, light }: { no: string; title: ReactNode; lead?: ReactNode; light?: boolean }) {
  return (
    <Reveal className={`section-head${light ? " on-dark" : ""}`}>
      <div><p className="section-no">{no}</p><h2>{title}</h2></div>
      {lead && <p className="section-lead">{lead}</p>}
    </Reveal>
  );
}
