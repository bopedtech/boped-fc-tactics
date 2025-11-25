import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type LocalizationDictionary = Record<string, { en: string; vi: string }>;

const FALLBACK_LOCALE = "vi"; // Default to Vietnamese

export function useLocalization() {
  const [dictionary, setDictionary] = useState<LocalizationDictionary>({});
  const [locale, setLocale] = useState<"en" | "vi">(FALLBACK_LOCALE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDictionary();
  }, []);

  const fetchDictionary = async () => {
    try {
      const { data, error } = await supabase
        .from("localization_dictionary")
        .select("key, value_en, value_vi");

      if (error) throw error;

      const dict: LocalizationDictionary = {};
      data?.forEach((item) => {
        dict[item.key] = {
          en: item.value_en,
          vi: item.value_vi || item.value_en,
        };
      });

      setDictionary(dict);
    } catch (error) {
      console.error("Error fetching localization dictionary:", error);
    } finally {
      setLoading(false);
    }
  };

  const t = (key: string, fallback?: string): string => {
    if (!dictionary[key]) {
      return fallback || key;
    }
    return dictionary[key][locale] || dictionary[key].en || fallback || key;
  };

  const changeLocale = (newLocale: "en" | "vi") => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  // Load saved locale from localStorage
  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as "en" | "vi";
    if (savedLocale) {
      setLocale(savedLocale);
    }
  }, []);

  return {
    t,
    locale,
    changeLocale,
    loading,
  };
}
