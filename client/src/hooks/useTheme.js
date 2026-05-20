import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setThemeState] = useState(() => {
        try {
            // Allow seamless migration from old 'theme' key in Navbar
            const legacyTheme = localStorage.getItem('theme');
            if (legacyTheme && !localStorage.getItem('rs-theme')) {
                localStorage.setItem('rs-theme', legacyTheme);
            }
            return localStorage.getItem('rs-theme') || 'light';
        } catch {
            return 'light';
        }
    });

    const setTheme = (newTheme) => {
        try {
            const val = typeof newTheme === 'function' ? newTheme(theme) : newTheme;
            localStorage.setItem('rs-theme', val);
            localStorage.setItem('theme', val); // Sync legacy key just in case
            setThemeState(val);
            window.dispatchEvent(new CustomEvent('rs-theme-change', { detail: val }));
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'rs-theme' || e.key === 'theme') {
                setThemeState(e.newValue || 'light');
            }
        };

        const handleCustom = (e) => {
            setThemeState(e.detail);
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('rs-theme-change', handleCustom);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('rs-theme-change', handleCustom);
        };
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    return [theme, setTheme];
}
