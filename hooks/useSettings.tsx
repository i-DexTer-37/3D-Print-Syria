import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Theme = 'light' | 'dark';
export type Language = 'ar' | 'en';
export type ViewMode = 'desktop' | 'mobile';

interface SettingsContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    language: Language;
    setLanguage: (language: Language) => void;
    viewMode: ViewMode;
    setViewMode: (viewMode: ViewMode) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function getInitialSetting<T extends string>(key: string, fallback: T, allowedValues: T[]): T {
    const stored = localStorage.getItem(key);
    if (stored && (allowedValues as string[]).includes(stored)) {
        return stored as T;
    }
    return fallback;
}

function getInitialTheme(): Theme {
    const storedTheme = localStorage.getItem('pos-theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme as Theme;
    }
    // If no theme is stored, check for system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme);
    const [language, setLanguageState] = useState<Language>(() => getInitialSetting('pos-language', 'ar', ['ar', 'en']));
    const [viewMode, setViewModeState] = useState<ViewMode>(() => getInitialSetting('pos-viewMode', 'desktop', ['desktop', 'mobile']));

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('pos-theme', theme);
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.lang = language;
        root.dir = language === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('pos-language', language);
    }, [language]);
    
    useEffect(() => {
        localStorage.setItem('pos-viewMode', viewMode);
    }, [viewMode]);

    const setTheme = useCallback((newTheme: Theme) => setThemeState(newTheme), []);
    const setLanguage = useCallback((newLanguage: Language) => setLanguageState(newLanguage), []);
    const setViewMode = useCallback((newViewMode: ViewMode) => setViewModeState(newViewMode), []);

    const value = { theme, setTheme, language, setLanguage, viewMode, setViewMode };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};