import type { Metadata } from "next";
import { Providers } from "./providers";
import { LocationModal } from "@/components/LocationModal";
import "./globals.css";

export const metadata: Metadata = {
  title: "Malashree — Order Direct",
  description:
    "Malashree's direct food ordering platform. Fresh, fast, premium Indian food from your nearest branch.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Fira+Sans:wght@300;400;500;600;700;800&family=Fira+Mono:wght@400;500;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <Providers>
          <LocationModal />
          {children}
        </Providers>
      </body>
    </html>
  );
}
