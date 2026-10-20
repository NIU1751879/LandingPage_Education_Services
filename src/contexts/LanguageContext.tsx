"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "es" | "ca" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("es");

  // Cargar idioma desde localStorage al iniciar
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "es" || savedLanguage === "ca" || savedLanguage === "en")) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Importar traducciones
  const translations = require("@/i18n/translations").translations;

  const t = (key: string): string => {
    const lookup = (locale: Language): unknown =>
      key.split(".").reduce<unknown>((value, part) => {
        if (!value || typeof value !== "object") return undefined;
        return (value as Record<string, unknown>)[part];
      }, translations[locale]);

    const translated = lookup(language);
    if (typeof translated === "string") return translated;
    const fallback = lookup("en");
    if (typeof fallback === "string") return fallback;
    console.warn(`Translation key "${key}" not found for language "${language}" or "en"`);
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

