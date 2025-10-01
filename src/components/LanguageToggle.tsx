'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt-BR' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:bg-accent hover:text-accent-foreground transition-all rounded-md"
      title={language === 'en' ? t('switch_to_portuguese') : t('switch_to_english')}
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">
        {language === 'en' ? 'PT' : 'EN'}
      </span>
    </button>
  );
}