import Logo from "./Logo";

const services = [
  { title: "Rent-to-Own Vehicles", copy: "Structured vehicle access for professionals seeking a pathway to ownership.", href: "/rent-to-own" },
  { title: "Full Maintenance Leasing (FML)", copy: "Vehicle leasing with maintenance management, compliance and lifecycle oversight.", href: "/services#full-maintenance-leasing" },
  { title: "Operating Rentals", copy: "Flexible vehicles for short-term, medium-term and project-based fleet requirements.", href: "/services#operating-rentals" },
  { title: "Managed Maintenance", copy: "Maintenance approvals, supplier coordination, cost control and downtime monitoring.", href: "/services#managed-maintenance" },
  { title: "Fleet Audits", copy: "Verification of fleet assets, condition, allocation, utilisation and compliance.", href: "/services#fleet-audits" },
  { title: "Fleet Inspections", copy: "Digital inspections, condition records and evidence for handovers, returns and ongoing operations.", href: "/services#fleet-inspections" },
  { title: "Fleet Assessment Reporting", copy: "Fleet analysis to inform costs, utilisation, replacement planning and management decisions.", href: "/services#fleet-assessment-reporting" },
];

export default function MobilityServices() {
  return (
    <section className="section mobility-services" id="rm-mobility">
      <div className="section-heading">
        <div>
          <Logo id="rm-mobility" alt="RM Mobility" className="logo-section" />
          <p className="section-no">Mobility services</p>
          <h2>From vehicle access<br />to fleet performance.</h2>
        </div>
        <div className="mobility-intro">
          <p>RM Mobility holds a part-ownership stake in Element Bridge. Our mobility service offering spans the same seven service lines as Element Bridge, from vehicle access to maintenance, assurance and reporting.</p>
          <a className="text-link" href="https://www.elementbridge.co.za/services">Explore Element Bridge’s services <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="mobility-service-grid">
        {services.map((service, index) => (
          <article className="mobility-service" key={service.title}>
            <span className="service-number">{String(index + 1).padStart(2, "0")}</span>
            <h3>{service.title}</h3>
            <p>{service.copy}</p>
            <a className="text-link" href={`https://www.elementbridge.co.za${service.href}`} aria-label={`${service.title} at Element Bridge`}>Explore service <span aria-hidden="true">↗</span></a>
          </article>
        ))}
      </div>
      <div className="ownership-strip">
        <a href="https://www.elementbridge.co.za" aria-label="Visit Element Bridge"><Logo id="element-bridge" alt="Element Bridge" className="logo-inline" /></a>
        <p><strong>Part-owned by RM Mobility.</strong><br />Element Bridge retains its own brand and operating identity.</p>
        <a className="button primary" href="https://www.elementbridge.co.za/contact">Discuss your fleet needs</a>
      </div>
    </section>
  );
}
