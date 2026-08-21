import Link from "next/link";

const businesses = [
  { number: "01", name: "RM Mobility", state: "Operating", copy: "Fleet management, connected assets and mobility technology, anchored by FleetOrbit.", href: "https://fleetorbit.co.za", icon: "/brand/units/rm-mobility-icon.png" },
  { number: "02", name: "RM Digital", state: "Operating", copy: "Software, AI, analytics and cloud products—including Field Force—for real operational work.", href: "/rm-digital", icon: "/brand/units/rm-digital-icon.png" },
  { number: "03", name: "RM Capital", state: "Platform", copy: "Disciplined investment, corporate finance and strategic capital allocation.", href: "#contact", icon: "/brand/units/rm-capital-icon.png" },
  { number: "04", name: "RM Industrial", state: "Platform", copy: "Engineering, manufacturing and infrastructure-linked operating capability.", href: "#contact", icon: "/brand/units/rm-industrial-icon.png" },
  { number: "05", name: "RM Ventures", state: "Platform", copy: "Selective incubation of new ventures with a clear route to durable value.", href: "#contact", icon: "/brand/units/rm-ventures-icon.png" },
  { number: "06", name: "RM Agriculture", state: "Platform", copy: "Technology-enabled production, food systems and resilient agricultural value chains.", href: "#contact", icon: "/brand/units/rm-agriculture-icon.png" },
  { number: "07", name: "RM Energy", state: "Platform", copy: "Practical energy solutions supporting productive, resilient African enterprises.", href: "#contact", icon: "/brand/units/rm-energy-icon.png" },
  { number: "08", name: "RM Property", state: "Platform", copy: "Property platforms and places designed for long-term utility and value.", href: "#contact", icon: "/brand/units/rm-property-icon.png" },
  { number: "09", name: "RM Foundation", state: "Impact", copy: "Education, enterprise development and long-horizon social investment.", href: "#contact", icon: "/brand/units/rm-foundation-icon.png" },
];

function Header() {
  return <header className="site-header"><Link className="brand-image" href="/" aria-label="RM & Co. home"><img src="/brand/rm-and-co/horizontal-lockup.png" alt="RM & Co. — Holding Africa’s Future" /></Link><nav><Link href="#about">About</Link><Link href="#businesses">Businesses</Link><Link href="/rm-digital">RM Digital</Link><Link className="nav-cta" href="#contact">Contact</Link></nav></header>;
}

export default function Home() {
  return <>
    <Header />
    <main>
      <section className="hero" id="home">
        <div className="hero-copy"><p className="eyebrow">African holding &amp; operating company</p><h1>Holding Africa&apos;s future.</h1><p>RM &amp; Co. brings patient ownership and operating discipline to businesses at the intersection of mobility, technology, infrastructure and long-term value creation.</p><div className="actions"><Link className="button primary" href="#businesses">Explore the group</Link><Link className="button ghost" href="#about">Our mandate</Link></div></div>
        <aside className="hero-aside"><img className="aside-brand" src="/brand/rm-digital/horizontal-lockup.png" alt="RM Digital — Data. Intelligence. Impact." /><p>Enterprise software and data products designed around real operational work.</p><Link href="/rm-digital">Explore RM Digital <b>↗</b></Link></aside>
        <div className="hero-index"><span><b>02</b> operating businesses</span><span><b>09</b> group units</span><span><b>ZA</b> South African base</span></div>
      </section>

      <section className="section manifesto" id="about"><p className="section-no">01 / Our mandate</p><div><h2>One group. Multiple capabilities. A deliberately long view.</h2><div className="prose"><p>RM &amp; Co. is the holdings company for a focused portfolio of operating businesses, products and future platforms. We build capability first, then allocate capital where the strategic and commercial case is strongest.</p><p>The group creates shared advantage across technology, distribution, data, relationships and disciplined execution—while presenting each unit&apos;s maturity honestly.</p></div></div></section>

      <section className="section businesses" id="businesses"><div className="section-heading"><div><p className="section-no">02 / Businesses &amp; units</p><h2>A portfolio built to compound capability.</h2></div><p>Operating businesses are identified clearly. Developing platforms earn their independence through performance, governance and strategic fit.</p></div><div className="business-grid">{businesses.map((business) => <Link className={`business-card ${business.name === "RM Digital" ? "featured" : ""}`} key={business.name} href={business.href}><span>{business.number}</span><small>{business.state}</small><img src={business.icon} alt="" /><h3>{business.name}</h3><p>{business.copy}</p><b>Explore <i>↗</i></b></Link>)}</div></section>

      <section className="section principles"><p className="section-no light">03 / Operating principles</p><div className="principles-grid"><div><p className="eyebrow">How we build</p><h2>Capital follows capability.</h2></div><ol><li><span>01</span><div><strong>Build before we multiply</strong><p>Deepen the operating engine before adding unnecessary complexity.</p></div></li><li><span>02</span><div><strong>Own strategic capability</strong><p>Prioritise technology, IP, distribution, data and operating know-how.</p></div></li><li><span>03</span><div><strong>Allocate deliberately</strong><p>Every new venture competes for capital against the core.</p></div></li><li><span>04</span><div><strong>Compound over time</strong><p>Prefer durable value creation over short-lived optics.</p></div></li></ol></div></section>

      <section className="section contact" id="contact"><div><p className="section-no">04 / Work with RM &amp; Co.</p><h2>Building something that belongs in the portfolio?</h2></div><div><p>For operating partnerships, strategic opportunities and group enquiries, contact RM &amp; Co.</p><a className="button primary" href="mailto:hello@rmandco.co.za">hello@rmandco.co.za</a></div></section>
    </main>
    <footer><Link className="footer-brand" href="/"><img src="/brand/rm-and-co/horizontal-lockup.png" alt="RM & Co." /></Link><p>RM &amp; Co. is the holdings company of RM Digital. Field Force is a product of RM Digital.</p><span>© 2026 RM &amp; Co. · South Africa</span></footer>
  </>;
}
