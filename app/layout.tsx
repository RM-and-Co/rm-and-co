import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import ScrollEffects from "./components/ScrollEffects";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  title: { default: "RM & Co. | Holding & Operating Company", template: "%s | RM & Co." },
  description: "RM & Co. is a South African holding and operating company spanning digital products, mobility, capital and industrial capability, with RM Risk launching soon.",
  metadataBase: new URL("https://rmandco.co.za"),
  openGraph: {
    title: "RM & Co. | Holding & Operating Company",
    description: "Discover RM Digital’s portfolio: FleetOrbit, Shopping Lyst, OpenWheels and Orbit eDrive, and the upcoming launch of RM Risk.",
    url: "https://rmandco.co.za",
    siteName: "RM & Co.",
    locale: "en_ZA",
    type: "website",
    images: [{ url: "/social-preview.png", width: 1200, height: 630, alt: "RM & Co. — RM Capital, RM Digital, RM Industrial, RM Mobility" }],
  },
  icons: { icon: "/brand/rm-and-co/icon.png", shortcut: "/brand/rm-and-co/icon.png", apple: "/brand/rm-and-co/icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} /></head>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <ScrollEffects />
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
