import React, { useEffect } from 'react';
import type { Locale } from '@/types/portfolio';

interface SeoHeadProps {
  title: string;
  description: string;
  locale: Locale;
  canonicalPath: string;
  alternateFrPath?: string;
  alternateEnPath?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://kuamejosephyakro452-prog.github.io/kairos-studio'
).replace(/\/+$/, '');

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  locale,
  canonicalPath,
  alternateFrPath,
  alternateEnPath,
  ogImage,
  noindex = false,
  jsonLd,
}) => {
  const defaultOgImage = `${SITE_URL}/media/images/${locale === 'en' ? 'affiche-apercu-en-v1.jpg' : 'affiche-apercu-fr-v1.jpg'}`;
  const resolvedOgImage = ogImage || defaultOgImage;
  const resolvedOgAlt =
    locale === 'en'
      ? 'KAIROS STUDIO — Turning Ideas Into Experiences. Creative & digital studio: Graphic Design, Audiovisual Production, Digital Communication, Digital Solutions / ICT, Web Creation.'
      : 'KAIROS STUDIO — Turning Ideas Into Experiences. Studio créatif et numérique : Design graphique, Production audiovisuelle, Communication digitale, Solutions numériques / TIC, Création de sites web.';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = title;

    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    upsertLink('canonical', canonicalUrl);

    if (alternateFrPath) {
      upsertLink('alternate', `${SITE_URL}${alternateFrPath}`, 'fr');
      upsertLink('alternate', `${SITE_URL}${alternateFrPath}`, 'x-default');
    }
    if (alternateEnPath) {
      upsertLink('alternate', `${SITE_URL}${alternateEnPath}`, 'en');
    }

    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', 'KAIROS STUDIO');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', resolvedOgImage);
    upsertMeta('property', 'og:image:secure_url', resolvedOgImage);
    if (!ogImage) {
      upsertMeta('property', 'og:image:type', 'image/jpeg');
      upsertMeta('property', 'og:image:width', '1200');
      upsertMeta('property', 'og:image:height', '630');
    }
    upsertMeta('property', 'og:image:alt', resolvedOgAlt);
    upsertMeta('property', 'og:locale', locale === 'fr' ? 'fr_FR' : 'en_US');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', resolvedOgImage);
    upsertMeta('name', 'twitter:image:alt', resolvedOgAlt);

    // JSON-LD structuré
    const scriptId = 'kairos-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (jsonLd && !noindex) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = scriptId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [title, description, locale, canonicalPath, alternateFrPath, alternateEnPath, ogImage, resolvedOgImage, resolvedOgAlt, noindex, jsonLd]);

  return null;
};
