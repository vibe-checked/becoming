import { ThemeId } from './types';

export type UnsplashImage = {
  id: string;
  url: string;
  photographer: string;
  photographerUrl: string;
};

const SEARCH_TERMS: Record<ThemeId, string> = {
  rich: 'luxury lifestyle mansion yacht',
  love: 'romance sunset couple',
  health: 'nature wellness green',
  confidence: 'mountain peak power',
  adventure: 'adventure travel landscape',
  family: 'family home warmth',
  purpose: 'cosmos stars universe',
  career: 'city skyline architecture',
};

const CURATED_IMAGES: Record<ThemeId, UnsplashImage[]> = {
  rich: [
    { id: 'r1', url: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&h=1200&fit=crop&q=80', photographer: 'Daniel Barnes', photographerUrl: 'https://unsplash.com/@dannybarness' },
    { id: 'r2', url: 'https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?w=800&h=1200&fit=crop&q=80', photographer: 'nikldn', photographerUrl: 'https://unsplash.com/@nikldn' },
    { id: 'r3', url: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&h=1200&fit=crop&q=80', photographer: 'Chris Leipelt', photographerUrl: 'https://unsplash.com/@cleipelt' },
    { id: 'r4', url: 'https://images.unsplash.com/photo-1769149255670-aa0ad6428dd6?w=800&h=1200&fit=crop&q=80', photographer: 'Long Chung', photographerUrl: 'https://unsplash.com/@chungj07' },
  ],
  love: [
    { id: 'l1', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'l2', url: 'https://images.unsplash.com/photo-1615966650071-855b15f29ad1?w=800&h=1200&fit=crop&q=80', photographer: 'Vows on the Move', photographerUrl: 'https://unsplash.com/@vowsonthemove' },
    { id: 'l3', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'l4', url: 'https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
  ],
  health: [
    { id: 'h1', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'h2', url: 'https://images.unsplash.com/photo-1518173946687-a9dbba0cfa25?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'h3', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'h4', url: 'https://images.unsplash.com/photo-1476362555312-ab9e108a0b7e?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
  ],
  confidence: [
    { id: 'c1', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'c2', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'c3', url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'c4', url: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
  ],
  adventure: [
    { id: 'a1', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'a2', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'a3', url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'a4', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
  ],
  family: [
    { id: 'f1', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'f2', url: 'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'f3', url: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'f4', url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
  ],
  purpose: [
    { id: 'p1', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'p2', url: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'p3', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'p4', url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
  ],
  career: [
    { id: 'k1', url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'k2', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'k3', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
    { id: 'k4', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=1200&fit=crop&q=80', photographer: 'Unsplash', photographerUrl: '' },
  ],
};

let apiKey: string | null = null;

export function setUnsplashKey(key: string) {
  apiKey = key;
}

export async function fetchThemeImages(
  themeId: ThemeId,
  count: number = 10,
): Promise<UnsplashImage[]> {
  if (apiKey) {
    try {
      const query = encodeURIComponent(SEARCH_TERMS[themeId]);
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=${count}&orientation=portrait`,
        { headers: { Authorization: `Client-ID ${apiKey}` } },
      );
      if (res.ok) {
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
        if (results.length > 0) return results;
      }
    } catch {}
  }

  return CURATED_IMAGES[themeId] || [];
}
