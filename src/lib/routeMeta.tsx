/* ============================================================
   routeMeta.tsx — per-page title and description.
   Sets <title>, the meta description, Open Graph tags and the
   canonical link for each route. scripts/prerender.mjs captures
   the result, so search engines and AI crawlers see the right
   title for every page without running JavaScript.
   ============================================================ */
import { useEffect } from 'react';
import { useLocation } from 'react-router';

export const SITE = 'https://mihlab.org';
const DEFAULT_TITLE = 'MIHLab | The Moral Imagination and Hope Laboratory';

export const ROUTE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: DEFAULT_TITLE,
    description:
      'A philosophical laboratory that invites the public into virtual worlds to explore questions of ethics, identity and meaning, through games, music and visual art.',
  },
  '/media': {
    title: 'Play the Experience Machine and explore our projects | MIHLab',
    description:
      'Play the Experience Machine, a free philosophy game in your browser, and explore MIHLab projects: the multiplayer Quest, RealityCraft, Philosophers in the Verse, Tolle Lege and more.',
  },
  '/projects': {
    title: 'Projects | MIHLab',
    description:
      'Why, what and how for each MIHLab project: the Experience Machine, the multiplayer Quest, the Elite Dangerous plugin, RealityCraft, Philosophers in the Verse and Tolle Lege.',
  },
  '/research': {
    title: 'Research | MIHLab',
    description:
      'How art, games and music shape moral understanding: ethical reflection in art, interactive ethics, music and moral identity, and aesthetic sentimentalism.',
  },
  '/people': {
    title: 'People | MIHLab',
    description:
      'The philosophers, artists and collaborators behind MIHLab, led by Montaque Reynolds, Visiting Assistant Professor of Philosophy at Stetson University.',
  },
  '/participate': {
    title: 'Participate | MIHLab',
    description:
      'Join MIHLab as a graduate researcher, postdoctoral researcher, research collaborator or study participant.',
  },
  '/contact': {
    title: 'Contact | MIHLab',
    description: 'Get in touch with MIHLab by email at montaque@mihlab.org or join the community on Discord.',
  },
  '/cv': {
    title: 'Montaque Reynolds, PhD: CV | MIHLab',
    description:
      'Curriculum vitae of Montaque Reynolds, PhD (Saint Louis University), Visiting Assistant Professor of Philosophy at Stetson University.',
  },
};

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

export function RouteMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
    const meta = ROUTE_META[path] ?? ROUTE_META['/'];
    const url = SITE + (path === '/' ? '/' : path + '/'); // GitHub Pages serves /x as /x/
    document.title = meta.title;
    setMeta('name', 'description', meta.description);
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.description);
    setMeta('property', 'og:url', url);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
  }, [pathname]);
  return null;
}
