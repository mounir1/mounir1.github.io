/**
 * Common component utility functions
 * Used to eliminate duplication across components
 */

import { SyntheticEvent } from 'react';

/**
 * Handle image loading errors by hiding the image or showing a fallback
 */
export const handleImageError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
    // If there's a sibling fallback element (like an icon or initial), show it
    const fallback = target.nextElementSibling as HTMLElement;
    if (fallback) {
        fallback.style.display = 'flex';
    }
};

/**
 * Scroll the window to the top smoothly
 */
export const scrollToTop = () => {
    if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

/**
 * Toggle theme between light and dark
 * Note: This is a utility helper, usually used within a ThemeProvider context
 */
export const toggleThemeHelper = (currentTheme: string, setTheme: (theme: string) => void) => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    return newTheme;
};

/**
 * Generate a random color based on a string (e.g. for avatars)
 */
export const stringToColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};
