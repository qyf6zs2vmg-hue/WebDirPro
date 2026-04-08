import { DirectoryItem } from '@/types';

const STORAGE_KEYS = {
  USER_BEHAVIOR: 'user_behavior_v2',
  RECENTLY_VIEWED: 'recently_viewed',
  FAVORITES: 'favorites_list',
  VIEWED_RESOURCES: 'viewed_resources',
  CLICKED_RESOURCES: 'clicked_resources',
  CLICK_HISTORY: 'clicked_history'
};

interface UserBehavior {
  viewedCategories: { [category: string]: number };
  searchedTerms: { [term: string]: number };
  clickedResources: { [id: string]: number };
}

export interface ClickHistoryItem {
  resourceId: string;
  resourceName: string;
  timestamp: number;
  reviewed: boolean;
}

const getBehavior = (): UserBehavior => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_BEHAVIOR);
  return data ? JSON.parse(data) : { viewedCategories: {}, searchedTerms: {}, clickedResources: {} };
};

const saveBehavior = (behavior: UserBehavior) => {
  localStorage.setItem(STORAGE_KEYS.USER_BEHAVIOR, JSON.stringify(behavior));
};

export const trackCategoryClick = (category: string) => {
  const behavior = getBehavior();
  behavior.viewedCategories[category] = (behavior.viewedCategories[category] || 0) + 1;
  saveBehavior(behavior);
};

export const trackSearchQuery = (query: string) => {
  if (!query || query.length < 3) return;
  const behavior = getBehavior();
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  terms.forEach(term => {
    behavior.searchedTerms[term] = (behavior.searchedTerms[term] || 0) + 1;
  });
  saveBehavior(behavior);
};

export const trackItemClick = (itemId: string) => {
  const behavior = getBehavior();
  behavior.clickedResources[itemId] = (behavior.clickedResources[itemId] || 0) + 1;
  saveBehavior(behavior);
};

export const isUniqueView = (itemId: string): boolean => {
  const viewed: Record<string, boolean> = JSON.parse(localStorage.getItem(STORAGE_KEYS.VIEWED_RESOURCES) || '{}');
  if (viewed[itemId]) return false;
  viewed[itemId] = true;
  localStorage.setItem(STORAGE_KEYS.VIEWED_RESOURCES, JSON.stringify(viewed));
  return true;
};

export const isUniqueClick = (itemId: string): boolean => {
  const clicked: Record<string, boolean> = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLICKED_RESOURCES) || '{}');
  if (clicked[itemId]) return false;
  clicked[itemId] = true;
  localStorage.setItem(STORAGE_KEYS.CLICKED_RESOURCES, JSON.stringify(clicked));
  return true;
};

export const addToClickHistory = (itemId: string, itemName: string) => {
  const history: ClickHistoryItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLICK_HISTORY) || '[]');
  // Avoid duplicates in history for the same item if not reviewed
  if (history.some(h => h.resourceId === itemId && !h.reviewed)) return;
  
  history.push({
    resourceId: itemId,
    resourceName: itemName,
    timestamp: Date.now(),
    reviewed: false
  });
  localStorage.setItem(STORAGE_KEYS.CLICK_HISTORY, JSON.stringify(history));
};

export const getUnreviewedClicks = (): ClickHistoryItem[] => {
  const history: ClickHistoryItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLICK_HISTORY) || '[]');
  return history.filter(h => !h.reviewed);
};

export const markAsReviewed = (itemId: string) => {
  const history: ClickHistoryItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLICK_HISTORY) || '[]');
  const updated = history.map(h => h.resourceId === itemId ? { ...h, reviewed: true } : h);
  localStorage.setItem(STORAGE_KEYS.CLICK_HISTORY, JSON.stringify(updated));
};

export const trackItemView = (item: DirectoryItem) => {
  // Track interest
  trackCategoryClick(item.category);
  trackItemClick(item.id);
  
  // Track recently viewed
  const recent: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED) || '[]');
  const filtered = recent.filter(id => id !== item.id);
  const updated = [item.id, ...filtered].slice(0, 10);
  localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(updated));
};

export const getRecommendedItems = (allItems: DirectoryItem[]): DirectoryItem[] => {
  const behavior = getBehavior();
  
  const scoredItems = allItems.map(item => {
    let score = 0;
    
    // categoryMatch * 3
    const catViews = behavior.viewedCategories[item.category] || 0;
    score += catViews * 3;
    
    // searchMatch * 2
    const itemText = `${item.title} ${item.shortDescription} ${item.category} ${item.tags?.join(' ') || ''}`.toLowerCase();
    Object.entries(behavior.searchedTerms).forEach(([term, count]) => {
      if (itemText.includes(term)) {
        score += count * 2;
      }
    });
    
    // ratingWeight
    score += (item.averageRating || 0) * 1.5;
    
    // viewCountWeight
    score += Math.log10((item.viewsCount || 0) + 1) * 2;
    
    // clickedResources boost
    if (behavior.clickedResources[item.id]) {
      score += behavior.clickedResources[item.id] * 5;
    }

    return { item, score };
  });

  // Sort by score descending
  const sorted = scoredItems.sort((a, b) => b.score - a.score);
  
  // If no data, fallback to popular
  if (Object.keys(behavior.viewedCategories).length === 0 && Object.keys(behavior.searchedTerms).length === 0) {
    return [...allItems].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 6);
  }

  return sorted.slice(0, 6).map(s => s.item);
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
