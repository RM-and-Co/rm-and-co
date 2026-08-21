import Link from "next/link";

const businesses = [
  { number: "01", name: "RM Mobility", state: "Operating", copy: "Fleet management, connected assets and mobility technology, anchored by FleetOrbit.", href: "https://fleetorbit.co.za" },
  { number: "02", name: "RM Digital", state: "Building", copy: "Enterprise software, data products and practical workflow intelligence, including Field Force.", href: "/rm-digital" },
  { number: "03", name: "RM Capital", state: "Platform", copy: "Disciplined investment, corporate finance and strategic capital allocation.", href: "#contact" },
  { number: "04", name: "RM Industrial", state: "Platform", copy: "Engineering, manufacturing and infrastructure-linked operating capability.", href: "#contact" },
  { number: "05", name: "RM Ventures", state: "Platform", copy: "Selective incubation of new ventures with a clear route to durable value.", href: "#contact" },
  { number: "06", name: "RM Foundation", state: "Impact", copy: "Education, enterprise development and long-horizon social investment.", href: "#contact" },
];

function Header() {
  return <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">RM</span><span><strong>RM &amp; CO.</strong><small>Holdings &amp; operating company</small></span></Link><nav><Link href="#about">About</Link><Link href="#businesses">Businesses</Link><Link href="/rm-digital">RM Digital</Link><Link className="nav-cta" href="#contact">Contact</Link></nav></header>;
}

export default function Home() {
  return <>
    <Header />
    <main>
      <section className="hero" id="home">
        <div className="hero-copy"><p className="eyebrow">African holding &amp; operating company</p><h1>Building enduring enterprises for the next generation.</h1><p>RM &amp; Co. brings patient ownership and operating discipline to businesses at the intersection of mobility, technology, infrastructure and long-term value creation.</p><div className="actions"><Link className="button primary" href="#businesses">Explore the group</Link><Link className="button ghost" href="#about">Our mandate</Link></div></div>
        <aside className="hero-aside"><span>Now building</span><strong>RM Digital</strong><p>Enterprise software and data products designed around real operational work.</p><Link href="/rm-digital">Explore RM Digital <b>↗</b></Link></aside>
        <div className="hero-index"><span><b>02</b> active operating brands</span><span><b>06</b> group platforms</span><span><b>ZA</b> South African base</span></div>
      </section>

      <section className="section manifesto" id="about"><p className="section-no">01 / Our mandate</p><div><h2>One group. Multiple capabilities. A deliberately long view.</h2><div className="prose"><p>RM &amp; Co. is the holding company for a focused portfolio of operating businesses, products and future platforms. We build capability first, then allocate capital where the strategic and commercial case is strongest.</p><p>The group is designed to create shared advantage across technology, distribution, data, relationships and disciplined execution—without pretending every platform is equally mature.</p></div></div></section>

      <section className="section businesses" id="businesses"><div className="section-heading"><div><p className="section-no">02 / Businesses &amp; units</p><h2>A portfolio built to compound capability.</h2></div><p>Operating brands are named clearly. Developing platforms are presented honestly and earn their independence through performance.</p></div><div className="business-grid">{businesses.map((business) => <Link className={`business-card ${business.name === "RM Digital" ? "featured" : ""}`} key={business.name} href={business.href}><span>{business.number}</span><small>{business.state}</small><h3>{business.name}</h3><p>{business.copy}</p><b>Explore <i>↗</i></b></Link>)}</div></section>

      <section className="section principles"><p className="section-no light">03 / Operating principles</p><div className="principles-grid"><div><p className="eyebrow">How we build</p><h2>Capital follows capability.</h2></div><ol><li><span>01</span><div><strong>Build before we multiply</strong><p>Deepen the operating engine before adding unnecessary complexity.</p></div></li><li><span>02</span><div><strong>Own strategic capability</strong><p>Prioritise technology, IP, distribution, data and operating know-how.</p></div></li><li><span>03</span><div><strong>Allocate deliberately</strong><p>Every new venture competes for capital against the core.</p></div></li><li><span>04</span><div><strong>Compound over time</strong><p>Prefer durable value creation over short-lived optics.</p></div></li></ol></div></section>

      <section className="section contact" id="contact"><div><p className="section-no">04 / Work with RM &amp; Co.</p><h2>Building something that belongs in the portfolio?</h2></div><div><p>For operating partnerships, strategic opportunities and group enquiries, contact RM &amp; Co.</p><a className="button primary" href="mailto:hello@rmandco.co.za">hello@rmandco.co.za</a></div></section>
    </main>
    <footer><Link className="brand" href="/"><span className="brand-mark">RM</span><span><strong>RM &amp; CO.</strong><small>Building enduring African enterprises</small></span></Link><p>RM &amp; Co. is the holding company of RM Digital. Field Force is a product of RM Digital.</p><span>© 2026 RM &amp; Co. · South Africa</span></footer>
  </>;
}
