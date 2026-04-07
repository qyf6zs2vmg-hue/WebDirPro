import { DirectoryItem } from '@/types';

const STORAGE_KEYS = {
  INTERESTS: 'user_interests',
  RECENTLY_VIEWED: 'recently_viewed',
  FAVORITES: 'favorites_list'
};

interface Interests {
  [category: string]: number;
}

export const trackCategoryClick = (category: string) => {
  const interests: Interests = JSON.parse(localStorage.getItem(STORAGE_KEYS.INTERESTS) || '{}');
  interests[category] = (interests[category] || 0) + 1;
  localStorage.setItem(STORAGE_KEYS.INTERESTS, JSON.stringify(interests));
};

export const trackSearchQuery = (query: string, categories: string[]) => {
  if (!query) return;
  const interests: Interests = JSON.parse(localStorage.getItem(STORAGE_KEYS.INTERESTS) || '{}');
  
  // If search matches a category, boost it
  categories.forEach(cat => {
    if (cat.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(cat.toLowerCase())) {
      interests[cat] = (interests[cat] || 0) + 2;
    }
  });
  
  localStorage.setItem(STORAGE_KEYS.INTERESTS, JSON.stringify(interests));
};

export const trackItemView = (item: DirectoryItem) => {
  // Track interest
  trackCategoryClick(item.category);
  
  // Track recently viewed
  const recent: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED) || '[]');
  const filtered = recent.filter(id => id !== item.id);
  const updated = [item.id, ...filtered].slice(0, 10); // Keep last 10
  localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(updated));
};

export const getRecommendedItems = (allItems: DirectoryItem[]): DirectoryItem[] => {
  const interests: Interests = JSON.parse(localStorage.getItem(STORAGE_KEYS.INTERESTS) || '{}');
  const topCategories = Object.entries(interests)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);

  if (topCategories.length === 0) {
    // Return some random/popular items if no interests
    return [...allItems].sort(() => Math.random() - 0.5).slice(0, 4);
  }

  const recommended = allItems.filter(item => topCategories.includes(item.category));
  
  // Mix with some random items to keep it fresh
  const otherItems = allItems.filter(item => !topCategories.includes(item.category));
  const randomMix = [...otherItems].sort(() => Math.random() - 0.5).slice(0, 2);
  
  return [...recommended, ...randomMix].sort(() => Math.random() - 0.5).slice(0, 6);
};

export const getRecentlyViewed = (allItems: DirectoryItem[]): DirectoryItem[] => {
  const recentIds: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED) || '[]');
  return recentIds
    .map(id => allItems.find(item => item.id === id))
    .filter((item): item is DirectoryItem => !!item);
};

export const clearRecentlyViewed = () => {
  localStorage.removeItem(STORAGE_KEYS.RECENTLY_VIEWED);
};

export const getFavorites = (allItems: DirectoryItem[]): DirectoryItem[] => {
  const favIds: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
  return favIds
    .map(id => allItems.find(item => item.id === id))
    .filter((item): item is DirectoryItem => !!item);
};
