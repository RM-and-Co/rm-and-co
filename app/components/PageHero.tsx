import type { ReactNode } from "react";
import Link from "next/link";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  actions?: { href: string; label: string; ghost?: boolean }[];
  aside?: ReactNode;
  stats?: ReactNode;
  tall?: boolean;
};

/** Dark, animated page opener shared by every page. The h1 is the only h1 on each page. */
export default function PageHero({ eyebrow, title, lead, actions, aside, stats, tall }: PageHeroProps) {
  return (
    <section className={`hero${tall ? " hero-tall" : ""}${aside ? " has-aside" : ""}`}>
      <div className="hero-bg" aria-hidden="true"><i className="orb orb-a" /><i className="orb orb-b" /><i className="grid-lines" /></div>
      <div className="hero-copy">
        <p className="eyebrow rise" style={{ "--i": 0 } as React.CSSProperties}>{eyebrow}</p>
        <h1 className="rise" style={{ "--i": 1 } as React.CSSProperties}>{title}</h1>
        <p className="hero-lead rise" style={{ "--i": 2 } as React.CSSProperties}>{lead}</p>
        {actions && (
          <div className="actions rise" style={{ "--i": 3 } as React.CSSProperties}>
            {actions.map((a) => <Link key={a.href} className={`button ${a.ghost ? "ghost" : "primary"}`} href={a.href}>{a.label}<span aria-hidden="true">→</span></Link>)}
          </div>
        )}
      </div>
      {aside && <div className="hero-aside rise" style={{ "--i": 3 } as React.CSSProperties}>{aside}</div>}
      {stats && <div className="hero-stats rise" style={{ "--i": 4 } as React.CSSProperties}>{stats}</div>}
    </section>
  );
}
