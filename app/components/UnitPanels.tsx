import Link from "next/link";
import Logo from "./Logo";
import { units } from "../data";

export default function UnitPanels() {
  return <div className="business-index">{units.map(unit => <Link className="business-index-row" key={unit.slug} href={unit.href}>
    <span className="index-number">{unit.number}</span>
    <div className="index-name"><h3>{unit.name}</h3><span>{unit.state}</span></div>
    <p>{unit.tagline}</p>
    <div className="index-brand"><Logo id={unit.logo === "rm-digital-reversed" ? "rm-digital" : unit.logo} alt="" /></div>
    <span className="index-arrow" aria-hidden="true">↗</span>
  </Link>)}</div>;
}
