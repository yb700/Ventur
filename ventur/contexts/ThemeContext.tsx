'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'corporate';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    isDarkMode: boolean;
    cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('corporate');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load theme from localStorage on mount
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && ['light', 'dark', 'corporate'].includes(savedTheme)) {
            setThemeState(savedTheme);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Update data-theme attribute and save to localStorage
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            if (theme === 'dark') {
                metaThemeColor.setAttribute('content', '#0a0a0a');
            } else if (theme === 'corporate') {
                metaThemeColor.setAttribute('content', '#1e40af');
            } else {
                metaThemeColor.setAttribute('content', '#2563eb');
            }
        }
    }, [theme, mounted]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState(current => {
            // Toggle between light and dark modes
            if (current === 'light') {
                return 'dark';
            } else if (current === 'dark') {
                return 'corporate';
            } else {
                return 'light';
            }
        });
    };

    const cycleTheme = () => {
        setThemeState(current => {
            const themes: Theme[] = ['light', 'dark', 'corporate'];
            const currentIndex = themes.indexOf(current);
            const nextIndex = (currentIndex + 1) % themes.length;
            return themes[nextIndex];
        });
    };

    // Determine if current theme is dark mode
    const isDarkMode = theme === 'dark';

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <ThemeContext.Provider value={{
                theme: 'corporate',
                toggleTheme: () => { },
                setTheme: () => { },
                isDarkMode: false,
                cycleTheme: () => { }
            }}>
                {children}
            </ThemeContext.Provider>
        );
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDarkMode, cycleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
} 