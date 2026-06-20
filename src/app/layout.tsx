import type { Metadata } from "next";
import "./globals.css";
import ThemeApplier from "@/components/ThemeApplier";

export const metadata: Metadata = {
  title: "VeveyCRM — Vikas Pioneers workspace",
  description: "CRM + Field Service for electromechanical repair & service businesses.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "VeveyCRM" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @media (max-width: 780px) {
            .mob-hide     { display: none !important; }
            .mob-truncate { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 100%; }
            .kpi-grid     { grid-template-columns: 1fr 1fr !important; }
            .hub-grid     { grid-template-columns: 1fr !important; }
            .contact-actions { display: none !important; }
          }
        `}</style>
      </head>
      <body>
        <ThemeApplier />
        {children}
      </body>
    </html>
  );
}
