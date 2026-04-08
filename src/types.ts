export interface Category {
  id: string;
  name: string;
}

export type ItemType = 'Website' | 'App' | 'Course' | 'YouTube';
export type PricingType = 'Free' | 'Freemium' | 'Paid';
export type Platform = 'Web' | 'Android' | 'iOS';

export interface Review {
  id: string;
  itemId: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: any; // Firestore Timestamp
}

export type AudienceLevel = 'Beginner' | 'Pro' | 'All';
export type AudienceRole = 'Student' | 'Developer' | 'All';
export type AudiencePC = 'Weak' | 'Powerful' | 'All';

export interface TargetAudience {
  level: AudienceLevel;
  role: AudienceRole;
  pc: AudiencePC;
}

export interface DirectoryItem {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  type: ItemType;
  imageUrl: string;
  purpose: string;
  pricing: PricingType;
  subscriptionPrice?: string;
  platforms: Platform[];
  pros: string[];
  cons: string[];
  alternatives: string[];
  link: string;
  averageRating: number;
  totalRatings: number;
  viewsCount: number;
  favoritesCount: number;
  popularityTrend: number; // growth percentage
  currentViewers: number;
  targetAudience: TargetAudience;
  tags?: string[];
  createdAt: any; // Firestore Timestamp
  isNew?: boolean;
  isTopRated?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  favorites: string[];
  ratingHistory: Record<string, number>; // itemId -> rating
}
