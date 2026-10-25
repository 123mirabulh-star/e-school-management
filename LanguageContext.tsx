import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  getStoredLanguage,
  setStoredLanguage,
  t as translateKey,
  getLocalizedField as resolveLocalizedField,
  formatNumber as formatNum
} from '../services/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, lang?: Language) => string;
  getLocalizedField: (obj: any, fieldName: string, lang?: Language) => string;
  formatNumber: (val: number | string | undefined | null, lang?: Language) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<Language>(() => getStoredLanguage());

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    setStoredLanguage(lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  // Keep HTML lang attribute in sync
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: string, lang?: Language) => translateKey(key, lang || language);
  const getLocalizedField = (obj: any, fieldName: string, lang?: Language) =>
    resolveLocalizedField(obj, fieldName, lang || language);
  const formatNumber = (val: number | string | undefined | null, lang?: Language) => formatNum(val, lang || language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        getLocalizedField,
        formatNumber
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    const fallbackLang = getStoredLanguage();
    return {
      language: fallbackLang,
      setLanguage: setStoredLanguage,
      toggleLanguage: () => {},
      t: (key: string, lang?: Language) => translateKey(key, lang || fallbackLang),
      getLocalizedField: (obj: any, fieldName: string, lang?: Language) =>
        resolveLocalizedField(obj, fieldName, lang || fallbackLang),
      formatNumber: (val: number | string | undefined | null, lang?: Language) => formatNum(val, lang || fallbackLang)
    };
  }
  return context;
}
