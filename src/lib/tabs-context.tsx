"use client";

import {
  createContext, useContext, useState, useEffect, useCallback, useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export type Tab = {
  href: string;   // unique key — one tab per URL
  title: string;
  icon: string;
};

type TabsCtx = {
  tabs: Tab[];
  activeHref: string;
  openTab: (href: string, title?: string, icon?: string) => void;
  closeTab: (href: string) => void;
  focusTab: (href: string) => void;
};

const Ctx = createContext<TabsCtx | null>(null);

export function useTabs() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTabs must be inside TabsProvider");
  return ctx;
}

// ── Derive title + icon from pathname ────────────────────────────────────────

function tabMeta(href: string): { title: string; icon: string } {
  const p = href.split("?")[0];
  if (p === ROUTES.dashboard)           return { title: "Dashboard",    icon: "◈" };
  if (p === ROUTES.leads)               return { title: "Leads",        icon: "◎" };
  if (p === ROUTES.accounts)            return { title: "Accounts",     icon: "▣" };
  if (p.startsWith("/accounts/new"))    return { title: "New Account",  icon: "▣" };
  if (p.startsWith("/accounts/"))       return { title: "Account",      icon: "▣" };
  if (p === ROUTES.contacts)            return { title: "Contacts",     icon: "◉" };
  if (p.startsWith("/contacts/new"))    return { title: "New Contact",  icon: "◉" };
  if (p === ROUTES.assets)              return { title: "Assets",       icon: "⚙" };
  if (p.startsWith("/assets/new"))      return { title: "New Asset",    icon: "⚙" };
  if (p === ROUTES.quotations)          return { title: "Quotations",   icon: "₹" };
  if (p.startsWith("/quotations/new"))  return { title: "New Quote",    icon: "₹" };
  if (p.startsWith("/quotations/"))     return { title: "Quotation",    icon: "₹" };
  if (p === ROUTES.cases)               return { title: "Cases",        icon: "☎" };
  if (p.startsWith("/cases/"))          return { title: "Case",         icon: "☎" };
  if (p === ROUTES.amc)                 return { title: "AMC",          icon: "▥" };
  if (p === ROUTES.workOrders)          return { title: "Work Orders",  icon: "▤" };
  if (p.startsWith("/work-orders/"))    return { title: "Work Order",   icon: "▤" };
  if (p === ROUTES.dispatch)            return { title: "Dispatch",     icon: "◐" };
  if (p === ROUTES.invoices)            return { title: "Invoices",     icon: "⊟" };
  if (p === ROUTES.technicians)         return { title: "Technicians",  icon: "◑" };
  if (p.startsWith("/technicians/"))    return { title: "Technician",   icon: "◑" };
  if (p.startsWith(ROUTES.settings))   return { title: "Settings",     icon: "⚙" };
  if (p === ROUTES.reports)             return { title: "Reports",      icon: "◧" };
  if (p.startsWith(ROUTES.admin))       return { title: "Admin",        icon: "◈" };
  return { title: p.split("/").filter(Boolean).pop() ?? "Page", icon: "◫" };
}

const MAX_TABS = 10;
const STORAGE_KEY = "vvcrm_tabs";

function load(): Tab[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function save(tabs: Tab[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs)); } catch { /* noop */ }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function TabsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const initRef = useRef(false);

  // Load from localStorage on first mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const stored = load();
    setTabs(stored.length ? stored : []);
  }, []);

  // Auto-register every page visit as a tab
  useEffect(() => {
    if (!pathname) return;
    setTabs((prev) => {
      const exists = prev.find((t) => t.href === pathname);
      if (exists) return prev; // already open
      const meta = tabMeta(pathname);
      const next = prev.length >= MAX_TABS
        // drop oldest non-active tab when at limit
        ? [...prev.filter((t) => t.href !== prev[0].href), { href: pathname, ...meta }]
        : [...prev, { href: pathname, ...meta }];
      save(next);
      return next;
    });
  }, [pathname]);

  const openTab = useCallback((href: string, title?: string, icon?: string) => {
    const meta = tabMeta(href);
    setTabs((prev) => {
      const exists = prev.find((t) => t.href === href);
      if (exists) { router.push(href); return prev; }
      const tab: Tab = { href, title: title ?? meta.title, icon: icon ?? meta.icon };
      const next = prev.length >= MAX_TABS
        ? [...prev.filter((_, i) => i !== 0), tab]
        : [...prev, tab];
      save(next);
      router.push(href);
      return next;
    });
  }, [router]);

  const closeTab = useCallback((href: string) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.href === href);
      if (idx === -1) return prev;
      const next = prev.filter((t) => t.href !== href);
      save(next);
      // If closing active tab, go to adjacent tab
      if (href === pathname) {
        const target = next[idx] ?? next[idx - 1];
        if (target) router.push(target.href);
        else router.push(ROUTES.dashboard);
      }
      return next;
    });
  }, [pathname, router]);

  const focusTab = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  return (
    <Ctx.Provider value={{ tabs, activeHref: pathname, openTab, closeTab, focusTab }}>
      {children}
    </Ctx.Provider>
  );
}
