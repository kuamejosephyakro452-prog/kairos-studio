import React from 'react';
import type { Locale, PaletteId } from '@/types/portfolio';

interface PaletteSwitcherProps {
  locale: Locale;
  palette: PaletteId;
  onChange: (next: PaletteId) => void;
}

const OPTIONS: { id: PaletteId; label: string; dot: string }[] = [
  { id: 'braise', label: 'Braise', dot: 'linear-gradient(135deg,#FF6B00,#E6007E,#5B2EFF)' },
  { id: 'indigo', label: 'Indigo', dot: 'linear-gradient(135deg,#FF5A3C,#FFB347,#3347FF)' },
  { id: 'encre', label: 'Encre', dot: 'linear-gradient(135deg,#E8392B,#0F4C4A)' },
];

/**
 * Sélecteur temporaire discret permettant au client de comparer les 3 palettes en direct
 * (également pilotable via ?palette=braise|indigo|encre).
 * Pour le retirer plus tard : supprimer l'appel <PaletteSwitcher /> dans src/App.tsx.
 */
export const PaletteSwitcher: React.FC<PaletteSwitcherProps> = ({ locale, palette, onChange }) => {
  return (
    <div
      role="group"
      aria-label={locale === 'fr' ? 'Comparateur temporaire de palette' : 'Temporary palette switcher'}
      className="fixed bottom-3 left-3 z-40 flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] p-1 shadow-[var(--shadow-elevated)] sm:bottom-4 sm:left-4"
    >
      {OPTIONS.map((opt) => {
        const active = palette === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            title={
              locale === 'fr'
                ? `Tester la palette ${opt.label} (?palette=${opt.id})`
                : `Preview ${opt.label} palette (?palette=${opt.id})`
            }
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 font-mono-tech text-[10px] font-semibold tracking-[0.1em] uppercase ${
              active
                ? 'bg-accent-gradient text-[var(--accent-on-solid)] shadow-sm'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full border ${
                active ? 'border-white/70' : 'border-[var(--border-subtle)]'
              }`}
              style={{ background: opt.dot }}
            />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
