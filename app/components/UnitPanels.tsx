"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";
import { units } from "../data";

/** Five group businesses as panels: on desktop the focused panel expands; on mobile they stack. */
export default function UnitPanels() {
  const [active, setActive] = useState(0);
  return (
    <div className="panels">
      {units.map((unit, index) => (
        <article
          key={unit.slug}
          className={`panel${active === index ? " is-active" : ""}`}
          onMouseEnter={() => setActive(index)}
          onFocus={() => setActive(index)}
        >
          <div className="panel-rail" aria-hidden="true"><span>{unit.number}</span><b>{unit.name}</b></div>
          <div className="panel-body">
            <div className="panel-top">
              <span className="panel-chip"><Logo id={unit.logo === "rm-digital-reversed" ? "rm-digital" : unit.logo} alt="" /></span>
              <small className="state">{unit.state}</small>
            </div>
            <div className="panel-main">
              <h3>{unit.name}</h3>
              <p className="tagline">{unit.tagline}</p>
              <p className="panel-copy">{unit.copy}</p>
              <ul>{unit.points.map((p) => <li key={p}>{p}</li>)}</ul>
              <Link className="panel-link" href={unit.href}>Explore {unit.name}<span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
