import { useState, useEffect, useMemo } from "react";
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

      console.log("📚 Localization dictionary loaded:", Object.keys(dict).length, "keys");
      setDictionary(dict);
    } catch (error) {
      console.error("❌ Error fetching localization dictionary:", error);
    } finally {
      setLoading(false);
    }
  };

  // Memoize t function với dependency là locale để force re-render
  const t = useMemo(() => {
    return (key: string, fallback?: string): string => {
      if (!dictionary[key]) {
        // Return fallback hoặc key, không log warning nữa để tránh spam
        return fallback || key;
      }
      return dictionary[key][locale] || dictionary[key].en || fallback || key;
    };
  }, [dictionary, locale]);

  const changeLocale = (newLocale: "en" | "vi") => {
    console.log(`🌐 Changing locale from ${locale} to ${newLocale}`);
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
    
    // Force page reload để apply ngôn ngữ mới cho toàn bộ app
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Load saved locale from localStorage
  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as "en" | "vi";
    if (savedLocale) {
      console.log(`💾 Loaded saved locale: ${savedLocale}`);
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
