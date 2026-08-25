import type { Metadata } from "next";
import { Providers } from "./providers";
import { LocationModal } from "@/components/LocationModal";
import { FloatingDock } from "@/components/FloatingDock";
import "./globals.css";

export const metadata: Metadata = {
  title: "Malashree — Pure Veg Indian Kitchen",
  description:
    "Malashree's direct food ordering platform. Fresh, fast, premium pure veg Indian food from your nearest cloud kitchen branch in Pune.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        {/* Google Fonts: Inter */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
        />
        {/* Fontshare: Satoshi Premium Display & Body Typography */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700,800,900&display=swap"
        />
      </head>
      <body>
        <Providers>
          <LocationModal />
          {children}
          <FloatingDock />
        </Providers>
      </body>
    </html>
  );
}
