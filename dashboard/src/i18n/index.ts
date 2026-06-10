import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ptBR from './locales/pt-BR.json';
import en from './locales/en.json';

export const supportedLanguages = ['pt-BR', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      en: { translation: en },
    },
    fallbackLng: 'en',
    supportedLngs: supportedLanguages as unknown as string[],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'openwa_language',
      caches: ['localStorage'],
    },
    react: { useSuspense: false },
  });

function applyDirection(lang: string) {
  const base = (lang || 'en').split('-')[0];
  if (typeof document !== 'undefined') {
    document.documentElement.lang = base;
    document.documentElement.dir = 'ltr';
  }
}

applyDirection(i18n.language);
i18n.on('languageChanged', applyDirection);

export default i18n;
