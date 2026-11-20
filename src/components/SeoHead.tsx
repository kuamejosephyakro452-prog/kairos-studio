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
  ogImage = `${SITE_URL}/media/images/pub-nexora-poster-1600w.webp`,
  noindex = false,
  jsonLd,
}) => {
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
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:locale', locale === 'fr' ? 'fr_FR' : 'en_US');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', ogImage);

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
  }, [title, description, locale, canonicalPath, alternateFrPath, alternateEnPath, ogImage, noindex, jsonLd]);

  return null;
};
