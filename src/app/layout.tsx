import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { site, socials } from "@/content/site";

// Organization identity for search engines: ties thelvanor.com to its official accounts.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/apple-icon.png`,
  founder: { "@type": "Person", name: site.founder },
  sameAs: socials.map((s) => s.url),
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}. ${site.tagline}`,
    template: `%s. ${site.name}`,
  },
  description:
    "Thelvanor, PBC builds a sub-$1,000 solar-powered three-node data center inside a stainless keg, instruments every design claim, and publishes what it measures.",
  openGraph: {
    siteName: site.name,
    type: "website",
    url: site.url,
  },
  twitter: { card: "summary_large_image", site: "@Thelvanor" },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
