import { useEffect } from 'react';

const SITE_NAME = 'InkedUp';
const DEFAULT_IMAGE = '/og-image.jpg';
const ORIGIN =
  typeof window !== 'undefined' ? window.location.origin : 'https://inkedup.id';

interface SEOOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  /** Optional JSON-LD object(s) injected as <script type="application/ld+json">. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Lightweight per-page SEO. Sets document.title + meta/og/twitter/canonical and
 * optionally injects JSON-LD. Cleans up any JSON-LD it injected on unmount.
 */
export function useSEO({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  jsonLd,
}: SEOOptions) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
    const url = `${ORIGIN}${path}`;
    const imageUrl = image.startsWith('http') ? image : `${ORIGIN}${image}`;

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', imageUrl);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', imageUrl);
    setCanonical(url);

    const injected: HTMLScriptElement[] = [];
    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      for (const block of blocks) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo', 'useSEO');
        script.text = JSON.stringify(block);
        document.head.appendChild(script);
        injected.push(script);
      }
    }

    return () => {
      for (const s of injected) s.remove();
    };
  }, [title, description, path, image, type, jsonLd]);
}

export default useSEO;
