import type { LogoId } from "./components/logo-data";

export const EMAIL = "hello@rmandco.co.za";
export const mail = (subject: string) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;

export type Unit = {
  slug: string;
  number: string;
  name: string;
  state: "Operating" | "Platform" | "Launching soon";
  tagline: string;
  copy: string;
  href: string;
  logo: LogoId;
  points: string[];
};

export const units: Unit[] = [
  { slug: "rm-digital", number: "01", name: "RM Digital", state: "Operating", tagline: "Data. Intelligence. Impact.", copy: "Owner of FleetOrbit, Shopping Lyst, OpenWheels and Orbit eDrive. Also home to Field Force.", href: "/rm-digital", logo: "rm-digital-reversed", points: ["Software & AI", "Analytics & cloud", "Four owned businesses"] },
  { slug: "rm-mobility", number: "02", name: "RM Mobility", state: "Operating", tagline: "Smarter mobility. Stronger futures.", copy: "Fleet leasing, rentals, maintenance, audits, inspections and reporting. Part-owner of Element Bridge.", href: "/rm-mobility", logo: "rm-mobility", points: ["Seven service lines", "Fleet leasing & rentals", "Audits & reporting"] },
  { slug: "rm-capital", number: "03", name: "RM Capital", state: "Platform", tagline: "Invest. Grow. Transform.", copy: "Disciplined investment, corporate finance and strategic capital allocation.", href: "/businesses#rm-capital", logo: "rm-capital", points: ["Investment", "Corporate finance", "Capital allocation"] },
  { slug: "rm-industrial", number: "04", name: "RM Industrial", state: "Platform", tagline: "Engineering possibility.", copy: "Engineering, manufacturing and infrastructure-linked operating capability.", href: "/businesses#rm-industrial", logo: "rm-industrial", points: ["Engineering", "Manufacturing", "Infrastructure"] },
  { slug: "rm-risk", number: "05", name: "RM Risk", state: "Launching soon", tagline: "Protecting value. Enabling confidence.", copy: "Enterprise and operational risk, governance and compliance, insurance and claims advisory, mobility risk and business resilience.", href: "/rm-risk", logo: "rm-risk", points: ["Eight service lines", "Governance & compliance", "Resilience"] },
];

export const principles = [
  { title: "Build before we multiply", copy: "Deepen the operating engine before adding unnecessary complexity." },
  { title: "Own strategic capability", copy: "Prioritise technology, IP, distribution, data and operating know-how." },
  { title: "Allocate deliberately", copy: "Every new venture competes for capital against the core." },
  { title: "Compound over time", copy: "Prefer durable value creation over short-lived optics." },
];

export const portfolio: { name: string; category: string; logo: LogoId | null; copy: string; href: string; action: string }[] = [
  { name: "FleetOrbit", category: "Fleet technology", logo: "fleetorbit", copy: "Fleet management and connected-asset technology for clearer oversight of vehicles and operations.", href: "https://fleetorbit.co.za", action: "Visit FleetOrbit" },
  { name: "Shopping Lyst", category: "Consumer technology", logo: "shopping-lyst", copy: "A shopping platform in the RM Digital portfolio, bringing our technology focus into everyday consumer experiences.", href: mail("Shopping Lyst enquiry"), action: "Enquire about Shopping Lyst" },
  { name: "OpenWheels", category: "Vehicle marketplace", logo: "openwheels", copy: "A South African vehicle marketplace connecting people with vehicles and flexible ways to access them.", href: "https://openwheels.co.za", action: "Visit OpenWheels" },
  { name: "Orbit eDrive", category: "SME fleet & rent-to-own · In development", logo: null, copy: "A focused FleetOrbit edition for small and medium fleet operators and rent-to-own businesses. Planned scope connects customer applications, contracts, collections and vehicle lifecycle management. The complete commercial workflow is in development.", href: mail("Orbit eDrive enquiry"), action: "Enquire about Orbit eDrive" },
];

export const mobilityServices = [
  { title: "Rent-to-Own Vehicles", copy: "Structured vehicle access for professionals seeking a pathway to ownership.", href: "/rent-to-own" },
  { title: "Full Maintenance Leasing (FML)", copy: "Vehicle leasing with maintenance management, compliance and lifecycle oversight.", href: "/services#full-maintenance-leasing" },
  { title: "Operating Rentals", copy: "Flexible vehicles for short-term, medium-term and project-based fleet requirements.", href: "/services#operating-rentals" },
  { title: "Managed Maintenance", copy: "Maintenance approvals, supplier coordination, cost control and downtime monitoring.", href: "/services#managed-maintenance" },
  { title: "Fleet Audits", copy: "Verification of fleet assets, condition, allocation, utilisation and compliance.", href: "/services#fleet-audits" },
  { title: "Fleet Inspections", copy: "Digital inspections, condition records and evidence for handovers, returns and ongoing operations.", href: "/services#fleet-inspections" },
  { title: "Fleet Assessment Reporting", copy: "Fleet analysis to inform costs, utilisation, replacement planning and management decisions.", href: "/services#fleet-assessment-reporting" },
];

export const riskServices = [
  { title: "Enterprise Risk Management", copy: "A structured view of the risks that matter to strategy, and who owns them." },
  { title: "Operational Risk & Controls", copy: "Identifying where operations can fail, and the controls that keep them reliable." },
  { title: "Governance, Risk & Compliance (GRC)", copy: "Policies, accountability and assurance aligned to your regulatory obligations." },
  { title: "Insurance & Claims Advisory", copy: "Clear guidance on cover, exposure and the claims process." },
  { title: "Fleet, Asset & Mobility Risk", copy: "Risk insight for vehicles, equipment and the operations that depend on them." },
  { title: "Supplier & Contract Risk", copy: "Understanding third-party dependency, contract exposure and performance." },
  { title: "Health, Safety & Environmental Risk", copy: "Protecting people and the environment through practical, evidence-led controls." },
  { title: "Business Continuity & Crisis Readiness", copy: "Plans and preparation so the organisation can respond and recover." },
];

export const riskApproach = [
  { title: "Identify", copy: "Surface the risks across operations and strategic decisions." },
  { title: "Assess", copy: "Understand likelihood, impact and the exposure that matters." },
  { title: "Mitigate", copy: "Design practical controls, cover and response plans." },
  { title: "Monitor", copy: "Keep risk visible as the organisation changes." },
];

export const navLinks = [
  { href: "/about", label: "About" },
  { href: "/businesses", label: "Businesses" },
  { href: "/rm-digital", label: "RM Digital" },
  { href: "/rm-mobility", label: "RM Mobility" },
  { href: "/rm-risk", label: "RM Risk" },
];
