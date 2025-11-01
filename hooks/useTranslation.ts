
import { useSettings } from './useSettings';
import translations from '../locales/translations';

export const useTranslation = () => {
    const { language } = useSettings();

    const t = (key: string, params?: { [key: string]: string | number }): string => {
        const keys = key.split('.');
        let result: any = translations[language];

        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) {
                // Fallback to English if translation not found
                let fallbackResult: any = translations['en'];
                for (const fk of keys) {
                     fallbackResult = fallbackResult?.[fk];
                }
                result = fallbackResult || key;
                break;
            }
        }
        
        let Cstring = String(result);

        if (params) {
            for (const [paramKey, paramValue] of Object.entries(params)) {
                Cstring = Cstring.replace(`{{${paramKey}}}`, String(paramValue));
            }
        }

        return Cstring;
    };

    return { t, lang: language };
};
