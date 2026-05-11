"use client";

import { I18nProvider } from "@/lib/i18n";
import { ReactNode, createContext, useContext, useState, useCallback } from "react";

// Footer visibility context for mobile
const FooterContext = createContext<{
  mobileVisible: boolean;
  setMobileVisible: (v: boolean) => void;
}>({ mobileVisible: false, setMobileVisible: () => {} });

export function useFooterVisibility() {
  return useContext(FooterContext);
}

export default function ClientProviders({ children }: { children: ReactNode }) {
  const [mobileVisible, setMobileVisible] = useState(false);
  const set = useCallback((v: boolean) => setMobileVisible(v), []);

  return (
    <I18nProvider>
      <FooterContext.Provider value={{ mobileVisible, setMobileVisible: set }}>
        {children}
      </FooterContext.Provider>
    </I18nProvider>
  );
}
