import React, { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Mail, MessageCircle, Send } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import { submitContactMessage } from '@/lib/projectsRepository';
import { ALL_CATEGORIES, type Locale } from '@/types/portfolio';
import { Magnetic } from './Magnetic';

interface ContactSectionProps {
  locale: Locale;
}

const WHATSAPP_NUMBER = '2250789501705';
const STUDIO_EMAIL = 'kuamejosephyakro452@gmail.com';
const LAST_SUBMIT_KEY = 'kairos-contact-last-ts';

export const ContactSection: React.FC<ContactSectionProps> = ({ locale }) => {
  const t = DICTIONARY[locale];
  const f = t.contact.form;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');
  const [websiteTrap, setWebsiteTrap] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'fallback'>('idle');
  const [whatsappFallbackUrl, setWhatsappFallbackUrl] = useState('');
  const mountedAtRef = useRef<number>(Date.now());

  const buildWhatsappUrl = () => {
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
    ].filter(Boolean);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (websiteTrap.trim().length > 0) {
      setStatus('success');
      return;
    }

    if (Date.now() - mountedAtRef.current < 1500) {
      setFormError(f.rateLimitError);
      return;
    }

    try {
      const lastTs = Number(localStorage.getItem(LAST_SUBMIT_KEY) || '0');
      if (lastTs && Date.now() - lastTs < 25000) {
        setFormError(f.rateLimitError);
        return;
      }
    } catch {
      // ignore
    }

    if (fullName.trim().length < 2) {
      setFormError(f.validationName);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError(f.validationEmail);
      return;
    }
    if (message.trim().length < 10) {
      setFormError(f.validationMessage);
      return;
    }

    setStatus('submitting');
    const res = await submitContactMessage({
      full_name: fullName,
      email,
      phone,
      service,
      message,
      locale,
    });

    if (res.ok) {
      try {
        localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
      } catch {
        // ignore
      }
      setStatus('success');
      setFullName('');
      setEmail('');
      setPhone('');
      setService('');
      setMessage('');
    } else {
      setWhatsappFallbackUrl(buildWhatsappUrl());
      setStatus('fallback');
    }
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[var(--bg-primary)] py-24 text-[var(--text-primary)] sm:py-36"
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
              {status === 'success' ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--accent-1)]" />
                  <h3 className="font-display mt-5 text-3xl font-bold">{f.successTitle}</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm text-[var(--text-muted)]">
                    {f.successBody}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-8 cursor-pointer rounded-full border border-[var(--border-strong)] px-6 py-3 font-mono-tech text-xs font-semibold tracking-[0.18em] uppercase hover:border-[var(--accent-1)]"
                  >
                    {locale === 'fr' ? 'Nouveau message' : 'Send another message'}
                  </button>
                </div>
              ) : status === 'fallback' ? (
                <div className="py-10 text-center">
                  <AlertTriangle className="mx-auto h-11 w-11 text-[var(--accent-1)]" />
                  <h3 className="font-display mt-4 text-3xl font-bold">{f.fallbackTitle}</h3>
                  <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--text-muted)]">
                    {f.fallbackBody}
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <a
                      href={whatsappFallbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 rounded-full bg-accent-gradient px-7 py-3.5 font-mono-tech text-xs font-bold tracking-[0.18em] uppercase text-[var(--accent-on-solid)]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {f.fallbackButton}
                    </a>
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="cursor-pointer rounded-full border border-[var(--border-subtle)] px-6 py-3.5 font-mono-tech text-xs font-semibold tracking-[0.16em] uppercase"
                    >
                      {locale === 'fr' ? 'Modifier le message' : 'Edit message'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="kairos-hp">Website</label>
                    <input
                      id="kairos-hp"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={websiteTrap}
                      onChange={(e) => setWebsiteTrap(e.target.value)}
                    />
                  </div>

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
                        onChange={(e) => setFullName(e.target.value)}
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
                        onChange={(e) => setEmail(e.target.value)}
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
                        onChange={(e) => setPhone(e.target.value)}
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
                        onChange={(e) => setService(e.target.value)}
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
                      onChange={(e) => setMessage(e.target.value)}
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

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <Magnetic>
                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-accent-gradient px-8 py-4 font-mono-tech text-xs font-bold tracking-[0.2em] uppercase text-[var(--accent-on-solid)] shadow-[0_14px_40px_var(--glow-primary)] transition-transform hover:scale-[1.02] disabled:opacity-60"
                      >
                        <span>{status === 'submitting' ? f.submitting : f.submit}</span>
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </Magnetic>

                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono-tech inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase text-[var(--accent-text)] underline-offset-4 hover:underline"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{t.contact.whatsappCta}</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
