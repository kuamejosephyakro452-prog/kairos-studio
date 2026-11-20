import React from 'react';
import { MessageCircle } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import type { Locale } from '@/types/portfolio';

export const FloatingWhatsApp: React.FC<{ locale: Locale }> = ({ locale }) => {
  const t = DICTIONARY[locale];
  return (
    <a
      href="https://wa.me/2250789501705"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp +225 07 89 50 17 05"
      className="group fixed right-4 bottom-4 z-40 inline-flex items-center gap-2.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)]/92 px-4 py-2.5 font-mono-tech text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--text-primary)] shadow-[var(--shadow-elevated)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 hover:border-[var(--accent-1)]"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-gradient text-[var(--accent-on-solid)]">
        <MessageCircle className="h-3.5 w-3.5" />
      </span>
      <span className="hidden sm:inline">{t.contact.floatingWhatsapp}</span>
    </a>
  );
};
