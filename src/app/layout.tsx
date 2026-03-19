import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "@/styles/globals.css";
import "@/styles/layout.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "RiskGuard Compare — SME Insurance Quotation Generator",
  description:
    "Compare insurance quotations across multiple insurers for Singapore SMEs. Get indicative quotes for WICA, Public Liability, Professional Indemnity, Fire & Property, Business Interruption, and Foreign Worker Medical insurance.",
  keywords: [
    "Singapore",
    "SME",
    "insurance",
    "quotation",
    "WICA",
    "public liability",
    "professional indemnity",
    "fire insurance",
    "business interruption",
    "foreign worker medical",
    "comparison",
  ],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        <div className="app-wrapper">
          {/* Header */}
          <header className="app-header">
            <div className="header-inner">
              <Link href="/" className="header-logo">
                <Image
                  src="/logo.png"
                  alt="RiskGuard Insurance Brokers"
                  width={338}
                  height={90}
                  priority
                />
              </Link>
              <nav className="header-nav">
                <Link href="/quote" className="nav-link">
                  Get Quotes
                </Link>
              </nav>
            </div>
          </header>

          {/* Disclaimer Banner */}
          <div className="disclaimer-banner" role="alert">
            <p>
              ⚠️ <strong>Indicative quotes only</strong> — not financial
              advice. Contact insurers directly for binding quotations.
            </p>
          </div>

          {/* Main Content */}
          <main className="main-content">{children}</main>

          {/* Footer */}
          <footer className="app-footer">
            <div className="footer-inner">
              <Image
                src="/logo.png"
                alt="RiskGuard"
                width={120}
                height={32}
                style={{ height: "auto", opacity: 0.6 }}
              />
              <p>
                © {new Date().getFullYear()} RiskGuard Insurance Brokers Pte
                Ltd.
              </p>
              <div className="footer-links">
                <Link href="/disclaimer">Legal Disclaimer</Link>
                <span className="footer-dot">·</span>
                <Link href="/disclaimer">Privacy Notice</Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
