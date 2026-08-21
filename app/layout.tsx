import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "RM & Co. | Building Enduring African Enterprises", template: "%s | RM & Co." },
  description: "RM & Co. is a South African holding and operating company building durable businesses across mobility, digital products, capital and industrial capability.",
  metadataBase: new URL("https://rmandco.co.za"),
  openGraph: {
    title: "RM & Co. | Building Enduring African Enterprises",
    description: "A long-term holding and operating company for ambitious African businesses.",
    url: "https://rmandco.co.za",
    siteName: "RM & Co.",
    locale: "en_ZA",
    type: "website",
    images: [{ url: "/social-preview.png", width: 1200, height: 630 }],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
