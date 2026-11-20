import React, { useRef, useState } from 'react';
import { CheckCircle2, Mail, MessageCircle, Send, AlertTriangle } from 'lucide-react';
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
  // Champ honeypot anti-spam (invisible pour les humains)
  const [websiteTrap, setWebsiteTrap] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'fallback'>('idle');
  const [whatsappFallbackUrl, setWhatsappFallbackUrl] = useState('');

  const mountedAtRef = useRef<number>(Date.now());

  const buildWhatsappUrl = () => {
    const lines = [
      locale === 'fr' ? 'Bonjour Joseph Kouamé (KAIROS STUDIO),' : 'Hello Joseph Kouamé (KAIROS STUDIO),',
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

    // Anti-spam 1 : honeypot rempli => succès silencieux factice
    if (websiteTrap.trim().length > 0) {
      setStatus('success');
      return;
    }

    // Anti-spam 2 : soumission trop rapide (< 1.5s)
    if (Date.now() - mountedAtRef.current < 1500) {
      setFormError(f.rateLimitError);
      return;
    }

    // Anti-spam 3 : délai de 25s entre deux envois
    try {
      const lastTs = Number(localStorage.getItem(LAST_SUBMIT_KEY) || '0');
      if (lastTs && Date.now() - lastTs < 25000) {
        setFormError(f.rateLimitError);
        return;
      }
    } catch {
      // ignore
    }

    // Validation rigoureuse
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
    <section id="contact" className="section-sand relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-12">
          {/* Colonne gauche : éditorial + accès directs */}
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[var(--gold-accessible-on-light)]">
              {t.contact.label}
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-[1.03]">
              {t.contact.title}
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[var(--text-on-light-muted)] sm:text-base">
              {t.contact.subtitle}
            </p>

            <div className="mt-10 space-y-5 border-t border-[var(--border-on-light)] pt-8">
              <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--gold-accessible-on-light)]">
                {t.contact.directHeading}
              </p>

              <a
                href={`mailto:${STUDIO_EMAIL}`}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border-on-light)] bg-[var(--surface-light-card)] p-5 transition-colors hover:border-[var(--gold-accessible-on-light)]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0B0B0C] text-[#E8C877]">
                  <Mail className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--text-on-light-muted)]">
                    {t.contact.emailLabel}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium">{STUDIO_EMAIL}</p>
                </div>
              </a>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 rounded-2xl border border-[#0B0B0C]/15 bg-[#0B0B0C] p-5 text-[#F4EEE3] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-[#0B0B0C]">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#E8C877]">
                      {t.contact.whatsappLabel}
                    </p>
                    <p className="mt-0.5 text-sm font-medium">+225 07 89 50 17 05</p>
                  </div>
                </div>
                <span className="hidden rounded-full border border-[#E8C877]/45 px-3.5 py-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-[#E8C877] sm:inline-block">
                  {t.contact.whatsappCta}
                </span>
              </a>

              <p className="text-xs text-[var(--text-on-light-muted)]">{t.contact.responseNote}</p>
            </div>
          </div>

          {/* Colonne droite : Formulaire sécurisé + repli WhatsApp */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-[var(--border-on-light)] bg-[var(--surface-light-card)] p-6 sm:p-10">
              {status === 'success' ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--gold-accessible-on-light)]" />
                  <h3 className="mt-5 font-display text-3xl font-normal">{f.successTitle}</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--text-on-light-muted)]">
                    {f.successBody}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-8 cursor-pointer rounded-full border border-[var(--border-on-light)] px-6 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase transition-colors hover:border-[var(--gold-accessible-on-light)]"
                  >
                    {locale === 'fr' ? 'Envoyer un autre message' : 'Send another message'}
                  </button>
                </div>
              ) : status === 'fallback' ? (
                <div className="py-10 text-center">
                  <AlertTriangle className="mx-auto h-11 w-11 text-[var(--gold-accessible-on-light)]" />
                  <h3 className="mt-4 font-display text-3xl font-normal">{f.fallbackTitle}</h3>
                  <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[var(--text-on-light-muted)]">
                    {f.fallbackBody}
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <a
                      href={whatsappFallbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 rounded-full bg-gold-gradient px-7 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase text-[#0B0B0C]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {f.fallbackButton}
                    </a>
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="cursor-pointer rounded-full border border-[var(--border-on-light)] px-6 py-3.5 text-xs font-semibold tracking-[0.18em] uppercase"
                    >
                      {locale === 'fr' ? 'Modifier le message' : 'Edit message'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* Champ honeypot invisible pour les robots */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="kairos-website">Website</label>
                    <input
                      id="kairos-website"
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
                        className="block text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--text-on-light-muted)]"
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
                        className="mt-2.5 w-full border-b border-[var(--border-on-light)] bg-transparent py-3 text-sm outline-none transition-colors focus:border-[var(--gold-accessible-on-light)]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--text-on-light-muted)]"
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
                        className="mt-2.5 w-full border-b border-[var(--border-on-light)] bg-transparent py-3 text-sm outline-none transition-colors focus:border-[var(--gold-accessible-on-light)]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="block text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--text-on-light-muted)]"
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
                        className="mt-2.5 w-full border-b border-[var(--border-on-light)] bg-transparent py-3 text-sm outline-none transition-colors focus:border-[var(--gold-accessible-on-light)]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-service"
                        className="block text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--text-on-light-muted)]"
                      >
                        {f.service}
                      </label>
                      <select
                        id="contact-service"
                        name="service"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="mt-2.5 w-full cursor-pointer border-b border-[var(--border-on-light)] bg-[var(--surface-light-card)] py-3 text-sm outline-none transition-colors focus:border-[var(--gold-accessible-on-light)]"
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
                      className="block text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--text-on-light-muted)]"
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
                      className="mt-2.5 w-full resize-y border-b border-[var(--border-on-light)] bg-transparent py-3 text-sm leading-relaxed outline-none transition-colors focus:border-[var(--gold-accessible-on-light)]"
                    />
                  </div>

                  {formError && (
                    <p
                      role="alert"
                      className="rounded-xl border border-[#E06C6C]/45 bg-[#2A1111] px-4 py-3 text-xs font-medium text-[#FFD9D9]"
                    >
                      {formError}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <Magnetic>
                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-[#0B0B0C] px-8 py-4 text-xs font-semibold tracking-[0.22em] uppercase text-[#F4EEE3] transition-colors hover:bg-[#B8913F] hover:text-[#0B0B0C] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span>{status === 'submitting' ? f.submitting : f.submit}</span>
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </Magnetic>

                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-[var(--gold-accessible-on-light)] underline-offset-4 hover:underline"
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
