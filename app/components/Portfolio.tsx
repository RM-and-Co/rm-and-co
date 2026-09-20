import Logo from "./Logo";
import type { LogoId } from "./logo-data";

type Company = { name: string; category: string; logo: LogoId | null; copy: string; href: string; action: string };

const companies: Company[] = [
  { name: "FleetOrbit", category: "Fleet technology", logo: "fleetorbit", copy: "Fleet management and connected-asset technology for clearer oversight of vehicles and operations.", href: "https://fleetorbit.co.za", action: "Visit FleetOrbit" },
  { name: "Shopping Lyst", category: "Consumer technology", logo: "shopping-lyst", copy: "A shopping platform in the RM Digital portfolio, bringing our technology focus into everyday consumer experiences.", href: "mailto:hello@rmandco.co.za?subject=Shopping%20Lyst%20enquiry", action: "Enquire about Shopping Lyst" },
  { name: "OpenWheels", category: "Vehicle marketplace", logo: "openwheels", copy: "A South African vehicle marketplace connecting people with vehicles and flexible ways to access them.", href: "https://openwheels.co.za", action: "Visit OpenWheels" },
  { name: "Orbit eDrive", category: "SME fleet & rent-to-own · In development", logo: null, copy: "A focused FleetOrbit edition for small and medium fleet operators and rent-to-own businesses. Planned scope connects customer applications, contracts, collections and vehicle lifecycle management. The complete commercial workflow is in development.", href: "mailto:hello@rmandco.co.za?subject=Orbit%20eDrive%20enquiry", action: "Enquire about Orbit eDrive" },
];

export default function Portfolio() {
  return (
    <section className="section portfolio" id="portfolio">
      <div className="section-heading">
        <div>
          <p className="section-no">The RM Digital portfolio</p>
          <h2>Four businesses.<br />One digital home.</h2>
        </div>
        <p>RM Digital owns FleetOrbit, Shopping Lyst, OpenWheels and Orbit eDrive. Each brings its own focus to a portfolio built around useful technology.</p>
      </div>
      <div className="portfolio-grid">
        {companies.map((company, index) => (
          <article className="portfolio-card" key={company.name}>
            <div className="portfolio-top">
              <div className="product-logo">
                {company.logo ? <Logo id={company.logo} alt="" /> : <span className="text-wordmark" aria-hidden="true">Orbit eDrive</span>}
              </div>
              <span className="portfolio-number">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="visually-hidden">{company.name}</h3>
            <p className="portfolio-category">{company.category}</p>
            <p className="portfolio-description">{company.copy}</p>
            <a className="text-link" href={company.href}>{company.action}<span aria-hidden="true">↗</span></a>
          </article>
        ))}
      </div>
      <div className="portfolio-note">
        <div className="portfolio-note-brand">
          <span className="portfolio-note-label">Also from RM Digital</span>
          <Logo id="field-force" alt="Field Force" className="logo-inline" />
        </div>
        <p><strong>Field Force</strong> — our sales-performance and insurance-distribution workflow product.</p>
        <a className="text-link" href="https://fieldforce.rmandco.co.za">Explore Field Force <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}

const riskServices = [
  "Enterprise Risk Management",
  "Operational Risk & Controls",
  "Governance, Risk & Compliance (GRC)",
  "Insurance & Claims Advisory",
  "Fleet, Asset & Mobility Risk",
  "Supplier & Contract Risk",
  "Health, Safety & Environmental Risk",
  "Business Continuity & Crisis Readiness",
];

export function RiskLaunch() {
  return (
    <section className="section risk-launch" id="rm-risk">
      <div className="risk-introduction">
        <p className="section-no">Introducing RM Risk</p>
        <div className="risk-logo-plate"><Logo id="rm-risk" alt="RM Risk — Protecting value. Enabling confidence." /></div>
        <span className="launch-status">Launching soon</span>
        <h2>Protecting value.<br />Enabling confidence.</h2>
        <p>Helping organisations identify, assess, mitigate and monitor risk across operations and strategic decision-making.</p>
        <a className="button primary" href="mailto:hello@rmandco.co.za?subject=RM%20Risk%20enquiry">Enquire about RM Risk <span aria-hidden="true">↗</span></a>
      </div>
      <div className="risk-focus">
        <p className="eyebrow">Core service lines</p>
        <h3 className="risk-services-heading">Expertise for a more resilient tomorrow.</h3>
        <ol className="risk-services-list">
          {riskServices.map((service, index) => (
            <li key={service}><span>{String(index + 1).padStart(2, "0")}</span><h4>{service}</h4></li>
          ))}
        </ol>
        <p className="launch-note">Launching soon. Contact us to discuss these planned service lines.</p>
        <p className="risk-values">People · Insight · Resilience · Long-term value</p>
      </div>
    </section>
  );
}
