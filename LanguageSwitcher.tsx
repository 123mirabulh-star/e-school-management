import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'light' | 'dark' | 'compact';
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'light',
  compact = false
}) => {
  const { language, setLanguage } = useLanguage();
  const isCompact = compact || variant === 'compact';
  const isDark = variant === 'dark';

  if (isCompact) {
    return (
      <div className={`inline-flex items-center rounded-lg p-0.5 border text-xs font-bold ${
        isDark
          ? 'bg-slate-800 border-slate-700 text-slate-300'
          : 'bg-slate-100 border-slate-200 text-slate-700'
      } ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage('bn')}
          className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
            language === 'bn'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'hover:text-blue-600'
          }`}
          title="বাংলায় পরিবর্তন করুন"
        >
          বাং
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'hover:text-blue-600'
          }`}
          title="Switch to English"
        >
          EN
        </button>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1 rounded-xl border text-xs font-bold transition-all shadow-xs ${
        isDark
          ? 'bg-slate-800/90 border-slate-700 text-slate-300'
          : 'bg-white/95 border-slate-200 text-slate-700'
      } ${className}`}
      aria-label="Language Selector"
    >
      <Globe className={`w-3.5 h-3.5 ml-1 ${isDark ? 'text-amber-400' : 'text-blue-600'}`} />
      
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => setLanguage('bn')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            language === 'bn'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs font-extrabold'
              : isDark
              ? 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="বাংলা ভাষা নির্বাচন করুন"
        >
          বাংলা
        </button>

        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-blue-600 text-white shadow-xs font-extrabold'
              : isDark
              ? 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Select English Language"
        >
          English
        </button>
      </div>
    </div>
  );
};
