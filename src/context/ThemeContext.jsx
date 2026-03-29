// ---------------------------------------------------------------------------
// ThemeContext.jsx — Dark/light theme provider
// ---------------------------------------------------------------------------
// Provides a React context for theme state (dark/light mode). Persists the
// user's preference to localStorage and exposes an isDark flag, a toggle
// function, and a full set of color tokens consumed by components throughout
// the app via the useTheme() hook.
// ---------------------------------------------------------------------------

import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

const themes = {
  dark: {
    appBg: '#111827',
    appOuterBg: '#030712',
    headerBg: '#1f2937',
    headerBorder: '#374151',
    headerText: '#ffffff',
    bubbleUser: '#2563eb',
    bubbleAi: '#374151',
    bubbleText: '#ffffff',
    labelText: '#6b7280',
    inputBg: '#374151',
    inputBorder: '#4b5563',
    inputText: '#ffffff',
    inputPlaceholder: '#9ca3af',
    inputAreaBg: '#1f2937',
    inputAreaBorder: '#374151',
    sendBtnActive: '#22c55e',
    sendBtnDisabled: '#4b5563',
    sendBtnText: '#ffffff',
    clearBtnBorder: '#4b5563',
    clearBtnText: '#9ca3af',
    clearBtnHoverBorder: '#ef4444',
    clearBtnHoverText: '#ef4444',
    errorBannerBg: '#ef4444',
    errorBannerText: '#ffffff',
  },
  light: {
    appBg: '#f3f4f6',
    appOuterBg: '#ffffff',
    headerBg: '#ffffff',
    headerBorder: '#e5e7eb',
    headerText: '#111827',
    bubbleUser: '#2563eb',
    bubbleAi: '#e5e7eb',
    bubbleTextUser: '#ffffff',
    bubbleTextAi: '#111827',
    labelText: '#6b7280',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    inputText: '#111827',
    inputPlaceholder: '#9ca3af',
    inputAreaBg: '#ffffff',
    inputAreaBorder: '#e5e7eb',
    sendBtnActive: '#22c55e',
    sendBtnDisabled: '#d1d5db',
    sendBtnText: '#ffffff',
    clearBtnBorder: '#d1d5db',
    clearBtnText: '#6b7280',
    clearBtnHoverBorder: '#ef4444',
    clearBtnHoverText: '#ef4444',
    errorBannerBg: '#ef4444',
    errorBannerText: '#ffffff',
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const theme = isDark ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useTheme = () => useContext(ThemeContext);
