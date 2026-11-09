import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check, Sparkles, Sun, Moon } from 'lucide-react';

export const AestheticThemePicker = ({ compact = false }) => {
  const { theme, toggleTheme, isDark, preset, setPreset, themePresets } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeTheme = themePresets.find((p) => p.id === preset) || themePresets[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
          compact
            ? 'p-2 bg-[#151C30] hover:bg-[#1C263A] border-purple-500/25 text-[#AAB3C5] hover:text-white'
            : 'px-2.5 py-1.5 bg-[#151C30]/90 hover:bg-[#1C263A] border-purple-500/30 text-white text-xs font-bold'
        }`}
        title="Change Aesthetic Theme"
        aria-label="Change Theme Preset"
      >
        <span className="text-sm">{activeTheme.emoji}</span>
        {!compact && (
          <span className="hidden sm:inline text-[11px] font-black tracking-wide truncate max-w-[85px]">
            {activeTheme.name}
          </span>
        )}
        <Palette className="w-3.5 h-3.5 text-purple-400 shrink-0" />
      </button>

      {/* Floating Aesthetic Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#161924]/95 border border-purple-500/30 shadow-2xl backdrop-blur-2xl p-3 z-50 animate-scaleUp text-white space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#AAB3C5]">
                Aesthetic Themes
              </span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1 rounded-lg bg-[#11131B] hover:bg-[#1D2130] text-[#AAB3C5] hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold"
              title="Toggle Light/Dark Mode"
            >
              {isDark ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-purple-400" />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          {/* Theme Presets List */}
          <div className="space-y-1.5">
            {themePresets.map((p) => {
              const isSelected = p.id === preset;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPreset(p.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2 rounded-xl transition-all flex items-center justify-between text-left cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/20 border border-purple-500/40 shadow-xs'
                      : 'hover:bg-[#1F2436]/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{p.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white truncate">{p.name}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#AAB3C5] truncate">{p.tagline}</p>
                    </div>
                  </div>

                  {/* Gradient Swatch Dot */}
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <div
                      className={`w-4 h-4 rounded-full bg-gradient-to-tr ${p.previewGradient} shadow-xs border border-white/20`}
                    />
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
