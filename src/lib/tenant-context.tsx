"use client";

import { createContext, useContext } from "react";
import type { Tenant } from "./tenant";

const TenantContext = createContext<Tenant | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: Tenant | null;
  children: React.ReactNode;
}) {
  return (
    <TenantContext.Provider value={tenant}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): Tenant | null {
  return useContext(TenantContext);
}

export function useTenantFeature(key: keyof Tenant["features"]): boolean {
  const tenant = useContext(TenantContext);
  return tenant?.features?.[key] ?? false;
}
