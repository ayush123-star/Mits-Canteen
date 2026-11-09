import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEME_PRESETS = [
  {
    id: 'royal-gold',
    name: 'Imperial Gold',
    emoji: '👑',
    tagline: '24K Saffron Amber & Royal Obsidian Gold',
    primary: '#D97706',
    secondary: '#F59E0B',
    accent: '#FCD34D',
    bg: '#0A0804',
    previewGradient: 'from-[#D97706] via-[#F59E0B] to-[#FCD34D]',
  },
  {
    id: 'sunset-ember',
    name: 'Sunset Ember',
    emoji: '🔥',
    tagline: 'Obsidian Velvet & Radiant Sunset Flame',
    primary: '#FF4565',
    secondary: '#FF7844',
    accent: '#FFA834',
    bg: '#08090D',
    previewGradient: 'from-[#FF4565] via-[#FF7844] to-[#FFA834]',
  },
  {
    id: 'cyber-aurora',
    name: 'Cyber Aurora',
    emoji: '🌌',
    tagline: 'Electric Violet & Neon Magenta',
    primary: '#8B5CF6',
    secondary: '#D946EF',
    accent: '#06B6D4',
    bg: '#090812',
    previewGradient: 'from-[#8B5CF6] via-[#D946EF] to-[#06B6D4]',
  },
  {
    id: 'emerald-matcha',
    name: 'Matcha Luxe',
    emoji: '🍃',
    tagline: 'Smoked Jade & Cyber Mint',
    primary: '#059669',
    secondary: '#10B981',
    accent: '#34D399',
    bg: '#060B08',
    previewGradient: 'from-[#059669] via-[#10B981] to-[#34D399]',
  },
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Mode: 'dark' (default) or 'light'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('mits_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  // Aesthetic Preset: 'royal-gold' | 'sunset-ember' | 'cyber-aurora' | 'emerald-matcha'
  const [preset, setPreset] = useState(() => {
    const saved = localStorage.getItem('mits_theme_preset');
    if (saved === 'royal-gold') return 'royal-gold';
    if (!saved || saved === 'sunset-ember') return 'royal-gold';
    if (THEME_PRESETS.some((p) => p.id === saved)) return saved;
    return 'royal-gold'; // Default aesthetic theme
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('mits_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme-preset', preset);
    localStorage.setItem('mits_theme_preset', preset);
  }, [preset]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const changePreset = (newPreset) => {
    setPreset(newPreset);
  };

  const activePresetConfig = THEME_PRESETS.find((p) => p.id === preset) || THEME_PRESETS[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
        preset,
        setPreset: changePreset,
        activePresetConfig,
        themePresets: THEME_PRESETS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
