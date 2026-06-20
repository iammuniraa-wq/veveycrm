"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { c } from "@/lib/theme";
import { ROUTES } from "@/lib/constants";

const TABS = [
  { label: "General",   href: ROUTES.settings },
  { label: "Pricing",   href: ROUTES.configPricing },
  { label: "Templates", href: ROUTES.configTemplates },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${c.line}`, paddingBottom: 0 }}>
        {TABS.map((tab) => {
          const active = tab.href === ROUTES.settings
            ? pathname === ROUTES.settings
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? c.accent : c.muted,
                textDecoration: "none",
                borderBottom: active ? `2px solid ${c.accent}` : "2px solid transparent",
                marginBottom: -1,
                transition: "color 0.15s",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      {children}
    </>
  );
}
