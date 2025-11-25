import { Button } from "@/components/ui/button";
import { useT } from "@/contexts/LocalizationContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { locale, changeLocale } = useT();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => changeLocale(locale === "vi" ? "en" : "vi")}
      className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all"
    >
      <Globe className="h-4 w-4 text-primary" />
      <span className="font-bold text-primary">{locale.toUpperCase()}</span>
    </Button>
  );
}
