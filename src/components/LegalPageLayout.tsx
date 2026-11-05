"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: ReactNode;
}

export default function LegalPageLayout({
  title,
  subtitle,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: "var(--emerald-dark)",
          borderColor: "var(--emerald-light)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-110"
              style={{ backgroundColor: "var(--gold)", color: "var(--emerald-dark)" }}
            >
              M
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="font-bold text-lg tracking-tight"
                style={{ color: "var(--gold)" }}
              >
                Malashree
              </span>
              <span
                className="text-[9px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: "var(--gold-light)" }}
              >
                Pure Veg
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/terms"
              className="transition-colors hover:opacity-100 opacity-70"
              style={{ color: "var(--gold-light)" }}
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:opacity-100 opacity-70"
              style={{ color: "var(--gold-light)" }}
            >
              Privacy
            </Link>
            <Link
              href="/refund-policy"
              className="transition-colors hover:opacity-100 opacity-70"
              style={{ color: "var(--gold-light)" }}
            >
              Refunds
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:opacity-100 opacity-70"
              style={{ color: "var(--gold-light)" }}
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <div
        className="py-14"
        style={{
          background:
            "linear-gradient(135deg, var(--emerald-dark) 0%, var(--emerald) 60%, var(--emerald-light) 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-xs uppercase tracking-widest font-semibold mb-3"
            style={{ color: "var(--gold)" }}
          >
            Legal &amp; Policies
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: "#ffffff" }}
          >
            {title}
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.72)" }}>
            {subtitle}
          </p>
          <p
            className="text-xs mt-5"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="rounded-2xl shadow-sm border p-8 sm:p-12 prose prose-sm max-w-none legal-prose"
          style={{
            backgroundColor: "#fff",
            borderColor: "var(--border)",
          }}
        >
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t mt-8 py-10"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--cream-dark)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm mb-4" style={{ color: "var(--olive)" }}>
            © {new Date().getFullYear()} Malashree Pure Veg. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {[
              { label: "Home", href: "/" },
              { label: "Terms & Conditions", href: "/terms" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Refund Policy", href: "/refund-policy" },
              { label: "Shipping & Delivery", href: "/shipping-policy" },
              { label: "Contact Us", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:underline transition-colors"
                style={{ color: "var(--emerald)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .legal-prose h2 {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--emerald-dark);
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--gold);
          display: inline-block;
        }
        .legal-prose h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--ink);
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .legal-prose p {
          color: var(--olive-dark);
          line-height: 1.8;
          margin-bottom: 1rem;
        }
        .legal-prose ul,
        .legal-prose ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .legal-prose li {
          color: var(--olive-dark);
          line-height: 1.8;
          margin-bottom: 0.35rem;
        }
        .legal-prose a {
          color: var(--emerald);
          text-decoration: underline;
        }
        .legal-prose strong {
          color: var(--ink);
          font-weight: 600;
        }
        .legal-prose .highlight-box {
          background: linear-gradient(135deg, #f0fdf4, #fefce8);
          border: 1px solid var(--gold);
          border-left: 4px solid var(--gold);
          border-radius: 0.5rem;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
        }
        .legal-prose .highlight-box p {
          margin: 0;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
