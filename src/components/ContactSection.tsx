import React, { useState } from 'react';
import { CheckCircle2, Mail, MessageCircle } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import { ALL_CATEGORIES, type Locale } from '@/types/portfolio';
import { Magnetic } from './Magnetic';

interface ContactSectionProps {
  locale: Locale;
}

const WHATSAPP_NUMBER = '2250789501705';
const STUDIO_EMAIL = 'kuamejosephyakro452@gmail.com';

export const ContactSection: React.FC<ContactSectionProps> = ({ locale }) => {
  const t = DICTIONARY[locale];
  const f = t.contact.form;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [sentVia, setSentVia] = useState<'whatsapp' | 'email' | null>(null);

  const validateFields = (): boolean => {
    setFormError(null);
    if (fullName.trim().length < 2) {
      setFormError(f.validationName);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError(f.validationEmail);
      return false;
    }
    if (message.trim().length < 10) {
      setFormError(f.validationMessage);
      return false;
    }
    return true;
  };

  const buildFormattedMessage = (): string => {
    const lines = [
      locale === 'fr'
        ? 'Bonjour Joseph Kouamé (KAIROS STUDIO),'
        : 'Hello Joseph Kouamé (KAIROS STUDIO),',
      `${f.name}: ${fullName.trim()}`,
      `${f.email}: ${email.trim()}`,
      phone.trim() ? `${f.phone}: ${phone.trim()}` : '',
      service ? `${f.service}: ${service}` : '',
      '',
      message.trim(),
    ].filter((line, index, arr) => line !== '' || (index > 0 && arr[index - 1] !== ''));
    return lines.join('\n');
  };

  const buildWhatsappUrl = (): string => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildFormattedMessage())}`;
  };

  const buildMailtoUrl = (): string => {
    const subjectBase =
      locale === 'fr'
        ? `Demande de projet — ${fullName.trim()}`
        : `Project inquiry — ${fullName.trim()}`;
    const subject = service ? `${subjectBase} (${service})` : subjectBase;
    return `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      buildFormattedMessage()
    )}`;
  };

  const handleWhatsappSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;
    const url = buildWhatsappUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
    setSentVia('whatsapp');
  };

  const handleEmailClick = () => {
    if (!validateFields()) return;
    window.location.href = buildMailtoUrl();
    setSentVia('email');
  };

  return (
    <section
      id="contact"
      className="cv-auto relative overflow-hidden bg-[var(--bg-primary)] py-24 text-[var(--text-primary)] sm:py-36"
    >
      <div className="bg-mesh-ambient pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-12">
          {/* Colonne gauche */}
          <div className="lg:col-span-5">
            <p className="font-mono-tech text-[11px] font-semibold tracking-[0.26em] uppercase text-[var(--accent-text)]">
              {t.contact.label}
            </p>
            <h2 className="font-display mt-4 text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.025em]">
              {t.contact.title}
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              {t.contact.subtitle}
            </p>

            <div className="mt-10 space-y-4 border-t border-[var(--border-subtle)] pt-8">
              <p className="font-mono-tech text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--accent-text)]">
                {t.contact.directHeading}
              </p>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 rounded-2xl bg-accent-gradient p-5 text-[var(--accent-on-solid)] shadow-[0_14px_40px_var(--glow-primary)] transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/15">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-mono-tech text-[10px] font-bold tracking-[0.2em] uppercase opacity-80">
                      {t.contact.whatsappLabel}
                    </p>
                    <p className="mt-0.5 text-sm font-bold">+225 07 89 50 17 05</p>
                  </div>
                </div>
                <span className="hidden rounded-full bg-black/15 px-3.5 py-1.5 font-mono-tech text-[10px] font-bold tracking-[0.16em] uppercase sm:inline-block">
                  {t.contact.whatsappCta}
                </span>
              </a>

              <a
                href={`mailto:${STUDIO_EMAIL}`}
                className="glass-panel flex items-center gap-4 rounded-2xl p-5 transition-colors hover:border-[var(--accent-1)]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--accent-text)]">
                  <Mail className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono-tech text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--text-muted)]">
                    {t.contact.emailLabel}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold">{STUDIO_EMAIL}</p>
                </div>
              </a>

              <p className="font-mono-tech text-[11px] text-[var(--text-muted)]">
                {t.contact.availabilityNote}
              </p>
            </div>
          </div>

          {/* Colonne droite : Formulaire */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-3xl p-6 shadow-[var(--shadow-elevated)] sm:p-10">
              <form onSubmit={handleWhatsappSubmit} noValidate className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="font-mono-tech block text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--text-muted)]"
                    >
                      {f.name} *
                    </label>
                    <input
                      id="contact-name"
                      name="full_name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={120}
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setSentVia(null);
                      }}
                      placeholder={f.namePlaceholder}
                      className="mt-2.5 w-full border-b border-[var(--border-subtle)] bg-transparent py-3 text-sm outline-none transition-colors focus:border-[var(--accent-1)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="font-mono-tech block text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--text-muted)]"
                    >
                      {f.email} *
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setSentVia(null);
                      }}
                      placeholder={f.emailPlaceholder}
                      className="mt-2.5 w-full border-b border-[var(--border-subtle)] bg-transparent py-3 text-sm outline-none transition-colors focus:border-[var(--accent-1)]"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="font-mono-tech block text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--text-muted)]"
                    >
                      {f.phone}
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setSentVia(null);
                      }}
                      placeholder={f.phonePlaceholder}
                      className="mt-2.5 w-full border-b border-[var(--border-subtle)] bg-transparent py-3 text-sm outline-none transition-colors focus:border-[var(--accent-1)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-service"
                      className="font-mono-tech block text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--text-muted)]"
                    >
                      {f.service}
                    </label>
                    <select
                      id="contact-service"
                      name="service"
                      value={service}
                      onChange={(e) => {
                        setService(e.target.value);
                        setSentVia(null);
                      }}
                      className="mt-2.5 w-full cursor-pointer border-b border-[var(--border-subtle)] bg-[var(--bg-card)] py-3 text-sm outline-none transition-colors focus:border-[var(--accent-1)]"
                    >
                      <option value="">{f.servicePlaceholder}</option>
                      {ALL_CATEGORIES.map((cat) => (
                        <option key={cat} value={t.categories[cat]}>
                          {t.categories[cat]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="font-mono-tech block text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--text-muted)]"
                  >
                    {f.message} *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={4000}
                    rows={5}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setSentVia(null);
                    }}
                    placeholder={f.messagePlaceholder}
                    className="mt-2.5 w-full resize-y border-b border-[var(--border-subtle)] bg-transparent py-3 text-sm leading-relaxed outline-none transition-colors focus:border-[var(--accent-1)]"
                  />
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-400/50 bg-[#2C1013] px-4 py-3 text-xs font-medium text-[#FFD9DD]"
                  >
                    {formError}
                  </p>
                )}

                {sentVia && (
                  <p
                    role="status"
                    className="flex items-center gap-2.5 rounded-xl border border-[var(--accent-2)]/35 bg-[var(--accent-2)]/10 px-4 py-3 text-xs font-medium text-[var(--accent-2)]"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{sentVia === 'whatsapp' ? f.sentWhatsappNote : f.sentEmailNote}</span>
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <Magnetic>
                    <button
                      type="submit"
                      className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-accent-gradient px-8 py-4 font-mono-tech text-xs font-bold tracking-[0.2em] uppercase text-[var(--accent-on-solid)] shadow-[0_14px_40px_var(--glow-primary)] transition-transform hover:scale-[1.02]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{f.submitWhatsapp}</span>
                    </button>
                  </Magnetic>

                  <button
                    type="button"
                    onClick={handleEmailClick}
                    className="font-mono-tech inline-flex cursor-pointer items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase text-[var(--accent-text)] underline-offset-4 hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{f.submitEmail}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
