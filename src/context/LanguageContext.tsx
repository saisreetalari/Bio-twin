import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  LanguageCode,
  LanguageInfo,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
} from '../i18n/languages';

interface LanguageContextType {
  currentLang: LanguageCode;
  languageInfo: LanguageInfo;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  dir: 'ltr' | 'rtl';
  availableLanguages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'biotwin_preferred_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLangState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
      // Check browser language
      const navLang = navigator.language.split('-')[0].toLowerCase();
      const matched = SUPPORTED_LANGUAGES.find((l) => l.code === navLang);
      if (matched) return matched.code;
    } catch {
      // Ignore storage errors in restricted contexts
    }
    return 'en';
  });

  const languageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLangState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = languageInfo.dir;
  }, [currentLang, languageInfo.dir]);

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[currentLang];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    const enDict = TRANSLATIONS['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback ?? key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        languageInfo,
        setLanguage,
        t,
        dir: languageInfo.dir,
        availableLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
