import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { LanguageCode } from '../i18n/languages';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full' | 'subtle';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { currentLang, languageInfo, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`Change Language (Current: ${languageInfo.nativeName})`}
        className={`flex items-center gap-1.5 rounded-lg border transition-all cursor-pointer font-medium text-xs ${
          isOpen
            ? 'bg-slate-800 border-teal-500 text-white shadow-xs'
            : variant === 'subtle'
            ? 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
            : 'bg-slate-950 hover:bg-slate-850 text-slate-200 hover:text-white border-slate-700/80 hover:border-slate-600'
        } ${variant === 'compact' ? 'px-2.5 py-1.5' : 'px-3 py-1.5'}`}
      >
        <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <span className="text-sm leading-none shrink-0" role="img" aria-label={languageInfo.label}>
          {languageInfo.flag}
        </span>
        <span className="truncate hidden sm:inline font-semibold">
          {variant === 'full' ? languageInfo.nativeName : languageInfo.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-teal-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 py-1.5 backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Select Language</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
              8 Languages
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {availableLanguages.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  role="menuitem"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-teal-950/70 text-teal-200 font-semibold border-l-2 border-teal-400'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0 leading-none" role="img">
                      {lang.flag}
                    </span>
                    <div className="truncate">
                      <div className="font-medium text-white truncate">{lang.nativeName}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {lang.label} ({lang.code.toUpperCase()})
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1.5 border-t border-slate-800/80 bg-slate-950/40 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Instant translation</span>
            <span className="text-slate-500">Auto-saved</span>
          </div>
        </div>
      )}
    </div>
  );
};
