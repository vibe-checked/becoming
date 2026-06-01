import { ThemeId } from './types';

const SEARCH_TERMS: Record<ThemeId, string> = {
  rich: 'luxury gold wealth',
  love: 'romance sunset couple',
  health: 'nature wellness green',
  confidence: 'mountain peak power',
  adventure: 'adventure travel landscape',
  family: 'family home warmth',
  purpose: 'cosmos stars universe',
  career: 'city skyline architecture',
};

export type UnsplashImage = {
  id: string;
  url: string;
  photographer: string;
  photographerUrl: string;
};

let apiKey: string | null = null;

export function setUnsplashKey(key: string) {
  apiKey = key;
}

export async function fetchThemeImages(
  themeId: ThemeId,
  count: number = 10,
): Promise<UnsplashImage[]> {
  if (!apiKey) return [];

  try {
    const query = encodeURIComponent(SEARCH_TERMS[themeId]);
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=${count}&orientation=portrait`,
      {
        headers: { Authorization: `Client-ID ${apiKey}` },
      },
    );

    if (!res.ok) return [];

    const data = await res.json();
    const results: UnsplashImage[] = [];
    for (const r of data.results || []) {
      const url = r?.urls?.regular;
      const photographer = r?.user?.name;
      const photographerUrl = r?.user?.links?.html;
      if (r?.id && url) {
        results.push({
          id: String(r.id),
          url: String(url),
          photographer: String(photographer || 'Unknown'),
          photographerUrl: String(photographerUrl || ''),
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}
