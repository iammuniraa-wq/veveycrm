import type { Metadata } from "next";
import "./globals.css";
import ThemeApplier from "@/components/ThemeApplier";

export const metadata: Metadata = {
  title: "VeveyCRM — Vikas Pioneers workspace",
  description:
    "CRM + Field Service for electromechanical repair & service businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ThemeApplier />
        {children}
      </body>
    </html>
  );
}
