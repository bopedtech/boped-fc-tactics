import { Button } from "@/components/ui/button";
import { useT } from "@/contexts/LocalizationContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { locale, changeLocale } = useT();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => changeLocale(locale === "vi" ? "en" : "vi")}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="font-semibold">{locale === "vi" ? "VI" : "EN"}</span>
    </Button>
  );
}
