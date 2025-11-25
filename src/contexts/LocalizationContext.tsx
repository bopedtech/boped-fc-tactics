import { createContext, useContext, ReactNode } from "react";
import { useLocalization } from "@/hooks/useLocalization";

interface LocalizationContextType {
  t: (key: string, fallback?: string) => string;
  locale: "en" | "vi";
  changeLocale: (locale: "en" | "vi") => void;
  loading: boolean;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(
  undefined
);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const localization = useLocalization();

  return (
    <LocalizationContext.Provider value={localization}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useT() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useT must be used within LocalizationProvider");
  }
  return context;
}
