const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

/** Curated unique high-resolution photographs for every individual dish */
export const FOOD_IMAGE_BY_NAME = {
  // North Indian & Mughlai
  'Butter Chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80&fit=crop',
  'Paneer Tikka Masala': 'https://images.unsplash.com/photo-1567184109411-b28f5e069e85?w=800&q=80&fit=crop',
  'Mutton Rogan Josh': 'https://images.unsplash.com/photo-1545247181-516773cae7be?w=800&q=80&fit=crop',
  'Dal Makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80&fit=crop',
  'Chicken Seekh Kebab': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&q=80&fit=crop',
  'Gulab Jamun': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=80&fit=crop',

  // Biryani Specialities
  'Chicken Dum Biryani': 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80&fit=crop',
  'Mutton Biryani': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80&fit=crop',
  'Veg Biryani': 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=800&q=80&fit=crop',
  'Prawn Biryani': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80&fit=crop',
  'Raita': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80&fit=crop',

  // Pizza & Italian
  'Margherita Pizza': 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&q=80&fit=crop',
  'Chicken BBQ Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&fit=crop',
  'Farmhouse Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80&fit=crop',
  'Garlic Bread': 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=800&q=80&fit=crop',
  'Chocolate Lava Cake': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80&fit=crop',

  // Burgers & Fast Food
  'Classic Beef Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&fit=crop',
  'Crispy Chicken Burger': 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=800&q=80&fit=crop',
  'Veggie Delight Burger': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80&fit=crop',
  'Loaded Fries': 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&q=80&fit=crop',
  'Milkshake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80&fit=crop',

  // South Indian
  'Masala Dosa': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80&fit=crop',
  'Idli Sambar (3 pcs)': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80&fit=crop',
  'Rava Dosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80&fit=crop',
  'Curd Rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80&fit=crop',
  'Filter Coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80&fit=crop',
};

/** High-impact large category showcase photographs */
export const CATEGORY_PHOTOGRAPHS = {
  Pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&fit=crop',
  Burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&fit=crop',
  Biryani: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80&fit=crop',
  Chinese: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80&fit=crop',
  'South Indian': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80&fit=crop',
  'North Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&fit=crop',
  Desserts: 'https://images.unsplash.com/photo-1551024503-8b3832142a27?w=800&q=80&fit=crop',
  Beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80&fit=crop',
  'Fast Food': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80&fit=crop',
  Starters: 'https://images.unsplash.com/photo-1606491956689-2ea866858177?w=800&q=80&fit=crop',
};

const KEYWORD_FOOD_IMAGES = [
  { match: /pizza/i, url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&fit=crop' },
  { match: /burger/i, url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&fit=crop' },
  { match: /biryani/i, url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80&fit=crop' },
  { match: /dosa|idli|vada|sambar/i, url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80&fit=crop' },
  { match: /paneer|tikka/i, url: 'https://images.unsplash.com/photo-1567184109411-b28f5e069e85?w=800&q=80&fit=crop' },
  { match: /chicken|mutton|rogan|kebab/i, url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80&fit=crop' },
  { match: /dal|curry|rice/i, url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80&fit=crop' },
  { match: /noodle|chinese|manchurian|fried rice/i, url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80&fit=crop' },
  { match: /fries|snack|taco|roll|wrap/i, url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&q=80&fit=crop' },
  { match: /cake|ice cream|jamun|halwa|dessert|sweet/i, url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80&fit=crop' },
  { match: /shake|coffee|tea|beverage|juice|smoothie/i, url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80&fit=crop' },
];

const GENERIC_FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80&fit=crop',
];

export const SAFE_FOOD_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23fff7ed'/%3E%3Ccircle cx='200' cy='150' r='70' fill='%23fed7aa'/%3E%3Ctext x='200' y='160' font-size='42' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%8D%B4%3C/text%3E%3C/svg%3E";

/**
 * Resolve the best unique image URL for a food item.
 */
export function resolveFoodImageUrl(food) {
  if (!food) return GENERIC_FOOD_IMAGES[0];

  const name = food.name?.trim();

  // 1. Direct lookup by exact dish name if available (guaranteed high-quality unique dish photograph)
  if (name && FOOD_IMAGE_BY_NAME[name]) {
    return FOOD_IMAGE_BY_NAME[name];
  }

  // 2. If explicit valid image is provided in MongoDB and is an external HTTP URL
  if (food.image && typeof food.image === 'string' && food.image.trim()) {
    const trimmed = food.image.trim();
    if (trimmed.startsWith('http')) return trimmed;
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${API_ORIGIN}${path}`;
  }

  // 3. Category matching if available
  const categoryName = typeof food.category === 'object' ? food.category?.name : food.category;
  if (categoryName && CATEGORY_PHOTOGRAPHS[categoryName]) {
    return CATEGORY_PHOTOGRAPHS[categoryName];
  }

  // 4. Keyword matching against dish name and description
  const text = `${name || ''} ${food.description || ''}`.toLowerCase();
  for (const { match, url } of KEYWORD_FOOD_IMAGES) {
    if (match.test(text)) return url;
  }

  // 5. Deterministic identity hash fallback (so each dish has a consistent distinct photo)
  const seed = String(food._id || food.name || 'food');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * 17) % GENERIC_FOOD_IMAGES.length;
  }
  return GENERIC_FOOD_IMAGES[hash];
}

export function getFoodImageFallback(food, failedUrl) {
  const name = food?.name?.trim();
  if (name && FOOD_IMAGE_BY_NAME[name] && FOOD_IMAGE_BY_NAME[name] !== failedUrl) {
    return FOOD_IMAGE_BY_NAME[name];
  }
  const categoryName = typeof food?.category === 'object' ? food?.category?.name : food?.category;
  if (categoryName && CATEGORY_PHOTOGRAPHS[categoryName] && CATEGORY_PHOTOGRAPHS[categoryName] !== failedUrl) {
    return CATEGORY_PHOTOGRAPHS[categoryName];
  }

  const seed = String(food?._id || food?.name || 'dish');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * 31) % GENERIC_FOOD_IMAGES.length;
  }
  const candidate = GENERIC_FOOD_IMAGES[hash];
  if (candidate !== failedUrl) return candidate;
  return GENERIC_FOOD_IMAGES[(hash + 1) % GENERIC_FOOD_IMAGES.length] || SAFE_FOOD_PLACEHOLDER;
}

/**
 * Resolve the best large food photography for category showcase cards
 */
export function resolveCategoryImageUrl(category) {
  if (!category) return CATEGORY_PHOTOGRAPHS.Pizza;

  const name = typeof category === 'string' ? category.trim() : category.name?.trim();
  const rawImage = typeof category === 'object' ? category.image : null;

  // 1. Exact category name match
  if (name && CATEGORY_PHOTOGRAPHS[name]) {
    return CATEGORY_PHOTOGRAPHS[name];
  }

  // 2. Case-insensitive category match
  if (name) {
    const match = Object.entries(CATEGORY_PHOTOGRAPHS).find(
      ([key]) => key.toLowerCase() === name.toLowerCase()
    );
    if (match) return match[1];
  }

  // 3. Explicit valid external URL in MongoDB
  if (rawImage && typeof rawImage === 'string' && rawImage.trim().startsWith('http')) {
    return rawImage.trim();
  }

  // 4. Keyword search in category name
  const text = (name || '').toLowerCase();
  for (const { match, url } of KEYWORD_FOOD_IMAGES) {
    if (match.test(text)) return url;
  }

  // 5. If local uploaded path
  if (rawImage && typeof rawImage === 'string' && rawImage.trim()) {
    const trimmed = rawImage.trim();
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${API_ORIGIN}${path}`;
  }

  // 6. Deterministic distinct category photo
  const categoryKeys = Object.keys(CATEGORY_PHOTOGRAPHS);
  const seed = String(name || 'category');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * 19) % categoryKeys.length;
  }
  return CATEGORY_PHOTOGRAPHS[categoryKeys[hash]];
}

export function getCategoryImageFallback(category, failedUrl) {
  const name = typeof category === 'string' ? category.trim() : category?.name?.trim();
  if (name && CATEGORY_PHOTOGRAPHS[name] && CATEGORY_PHOTOGRAPHS[name] !== failedUrl) {
    return CATEGORY_PHOTOGRAPHS[name];
  }
  const categoryValues = Object.values(CATEGORY_PHOTOGRAPHS);
  for (const url of categoryValues) {
    if (url !== failedUrl) return url;
  }
  return GENERIC_FOOD_IMAGES[0] || SAFE_FOOD_PLACEHOLDER;
}
