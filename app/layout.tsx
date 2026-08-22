import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "RM & Co. | Holding & Operating Company", template: "%s | RM & Co." },
  description: "RM & Co. is a South African holding and operating company focused on digital products, mobility, capital and industrial capability.",
  metadataBase: new URL("https://rmandco.co.za"),
  openGraph: {
    title: "RM & Co. | Holding & Operating Company",
    description: "A long-term holding and operating company for four focused businesses: digital, mobility, capital and industrial.",
    url: "https://rmandco.co.za",
    siteName: "RM & Co.",
    locale: "en_ZA",
    type: "website",
    images: [{ url: "/social-preview.png", width: 1200, height: 630, alt: "RM & Co. — RM Capital, RM Digital, RM Industrial, RM Mobility" }],
  },
  icons: { icon: "/brand/rm-and-co/icon.png", shortcut: "/brand/rm-and-co/icon.png", apple: "/brand/rm-and-co/icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
