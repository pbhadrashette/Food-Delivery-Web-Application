const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

/** Canonical cover URLs for seeded / known restaurants (used when DB field is empty). */
export const RESTAURANT_COVER_BY_NAME = {
  'Spice House': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=85&fit=crop',
  'Urban Biryani': 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=900&q=85&fit=crop',
  'Pizza Point': 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=900&q=85&fit=crop',
  'Burger Hub': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=85&fit=crop',
  'South Indian Kitchen': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=900&q=85&fit=crop',
};

const CUISINE_COVER = {
  biryani: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=900&q=85&fit=crop',
  mughlai: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=85&fit=crop',
  'south indian': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=900&q=85&fit=crop',
  kerala: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900&q=85&fit=crop',
  tamil: 'https://images.unsplash.com/photo-1630384060420-cce1241a6f1e?w=900&q=85&fit=crop',
  pizza: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=900&q=85&fit=crop',
  italian: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&q=85&fit=crop',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=85&fit=crop',
  american: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0df?w=900&q=85&fit=crop',
  'fast food': 'https://images.unsplash.com/photo-1572802419224-296b0aeee0df?w=900&q=85&fit=crop',
  chinese: 'https://images.unsplash.com/photo-1525755662778-989d058090ca?w=900&q=85&fit=crop',
  'north indian': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900&q=85&fit=crop',
  desserts: 'https://images.unsplash.com/photo-1551024503-8b3832142a27?w=900&q=85&fit=crop',
  beverages: 'https://images.unsplash.com/photo-1546173159-315724a31648?w=900&q=85&fit=crop',
  starters: 'https://images.unsplash.com/photo-1606491956689-2ea866858177?w=900&q=85&fit=crop',
};

const GENERIC_FOOD_COVERS = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=85&fit=crop',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=85&fit=crop',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=900&q=85&fit=crop',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=85&fit=crop',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=85&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=900&q=85&fit=crop',
];

/** Legacy/generic URLs that were reused across many cards — treat as missing. */
const IGNORED_COVER_URLS = new Set([
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=85&fit=crop',
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=900&q=85&fit=crop',
]);

function normalizeCoverPath(cover) {
  if (!cover?.trim()) return '';
  const trimmed = cover.trim();
  if (trimmed.startsWith('http')) {
    return IGNORED_COVER_URLS.has(trimmed) ? '' : trimmed;
  }
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${API_ORIGIN}${path}`;
}

function coverByRestaurantName(name) {
  if (!name?.trim()) return null;
  const trimmed = name.trim();
  if (RESTAURANT_COVER_BY_NAME[trimmed]) return RESTAURANT_COVER_BY_NAME[trimmed];
  const match = Object.entries(RESTAURANT_COVER_BY_NAME).find(
    ([key]) => key.toLowerCase() === trimmed.toLowerCase()
  );
  return match ? match[1] : null;
}

function coverFromCuisineList(cuisines = []) {
  for (const raw of cuisines) {
    const key = String(raw).trim().toLowerCase();
    if (CUISINE_COVER[key]) return CUISINE_COVER[key];
  }
  return null;
}

function coverFromIdentityHash(restaurant) {
  const seed = String(restaurant?._id || restaurant?.name || 'foodierush');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % GENERIC_FOOD_COVERS.length;
  }
  return GENERIC_FOOD_COVERS[hash];
}

/**
 * Resolve the best cover URL for a restaurant: DB coverImage first, then name map, then primary cuisines, then unique generic.
 */
export function resolveRestaurantCoverUrl(restaurant) {
  if (!restaurant) return GENERIC_FOOD_COVERS[0];

  const fromDb = normalizeCoverPath(restaurant.coverImage);
  if (fromDb) return fromDb;

  const byName = coverByRestaurantName(restaurant.name);
  if (byName) return byName;

  const fromCuisine = coverFromCuisineList(restaurant.cuisine);
  if (fromCuisine) return fromCuisine;

  return coverFromIdentityHash(restaurant);
}

export const SAFE_RESTAURANT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'%3E%3Crect width='640' height='400' fill='%23fff7ed'/%3E%3Ccircle cx='320' cy='180' r='80' fill='%23fed7aa'/%3E%3Ctext x='320' y='195' font-size='56' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%8D%BD%EF%B8%8F%3C/text%3E%3Ctext x='320' y='270' font-family='sans-serif' font-weight='bold' font-size='18' fill='%23c2410c' text-anchor='middle'%3EFoodieRush Partner%3C/text%3E%3C/svg%3E";

/** Secondary fallback when the primary URL fails to load (never reuse one global image for all). */
export function getRestaurantCoverFallback(restaurant, failedUrl) {
  const byName = coverByRestaurantName(restaurant?.name);
  if (byName && byName !== failedUrl) return byName;

  const fromCuisine = coverFromCuisineList(restaurant?.cuisine);
  if (fromCuisine && fromCuisine !== failedUrl) return fromCuisine;

  const hashed = coverFromIdentityHash(restaurant);
  if (hashed !== failedUrl) return hashed;

  const altIndex = (coverFromIdentityHash(restaurant) === GENERIC_FOOD_COVERS[0] ? 1 : 0);
  const candidate = GENERIC_FOOD_COVERS[altIndex];
  if (candidate !== failedUrl) return candidate;
  return SAFE_RESTAURANT_PLACEHOLDER;
}

/**
 * Resolve the best logo URL for a restaurant
 */
export function resolveRestaurantLogoUrl(restaurant) {
  if (!restaurant) return GENERIC_FOOD_COVERS[0];
  const fromDb = normalizeCoverPath(restaurant.logo);
  if (fromDb) return fromDb;
  return resolveRestaurantCoverUrl(restaurant);
}

export function getRestaurantLogoFallback(restaurant, failedUrl) {
  return getRestaurantCoverFallback(restaurant, failedUrl);
}

export { API_ORIGIN };
