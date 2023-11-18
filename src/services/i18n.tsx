import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslations from '../locales/en/translation.json';
import plTranslations from '../locales/pl/translation.json';

const resources = {
    en: {
        translation: enTranslations
    },
    pl: {
        translation: plTranslations
    }
};


i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources,
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: true
        }
    });



export default i18n;
