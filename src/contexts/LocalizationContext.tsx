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
      {localization.loading ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải ngôn ngữ...</p>
          </div>
        </div>
      ) : (
        children
      )}
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
