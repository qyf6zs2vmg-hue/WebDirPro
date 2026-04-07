import React from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  setDoc,
  serverTimestamp,
  increment,
  limit,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '@/firebase';
import { DirectoryItem, Review, Category } from '@/types';

export const useItems = (filters?: { category?: string; type?: string; pricing?: string; sortBy?: string }) => {
  const [items, setItems] = React.useState<DirectoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'items'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectoryItem));
      
      // Client-side filtering
      if (filters) {
        if (filters.category && filters.category !== 'All') {
          itemsData = itemsData.filter(item => item.category === filters.category);
        }
        if (filters.type && filters.type !== 'All') {
          itemsData = itemsData.filter(item => item.type === filters.type);
        }
        if (filters.pricing && filters.pricing !== 'All') {
          itemsData = itemsData.filter(item => item.pricing === filters.pricing);
        }

        // Client-side sorting
        if (filters.sortBy === 'newest') {
          itemsData.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
          });
        } else if (filters.sortBy === 'most-reviewed') {
          itemsData.sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0));
        } else {
          // Default: highest rating
          itemsData.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        }
      }

      setItems(itemsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [JSON.stringify(filters)]); // Use stringified filters as dependency

  return { items, loading };
};

export const useItem = (id: string) => {
  const [item, setItem] = React.useState<DirectoryItem | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'items', id), (doc) => {
      if (doc.exists()) {
        setItem({ id: doc.id, ...doc.data() } as DirectoryItem);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  return { item, loading };
};

export const useReviews = (itemId: string) => {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!itemId) return;
    const q = query(
      collection(db, 'reviews'), 
      where('itemId', '==', itemId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      // Client-side sort to avoid index requirement
      reviewsData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      setReviews(reviewsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [itemId]);

  return { reviews, loading };
};

export const useCategories = () => {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(categoriesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { categories, loading };
};

export const submitReview = async (itemId: string, review: Omit<Review, 'id' | 'createdAt'>) => {
  const itemRef = doc(db, 'items', itemId);
  const itemDoc = await getDoc(itemRef);
  
  if (!itemDoc.exists()) throw new Error("Item not found");
  
  const itemData = itemDoc.data() as DirectoryItem;
  const newTotalRatings = (itemData.totalRatings || 0) + 1;
  const newAverageRating = ((itemData.averageRating * itemData.totalRatings) + review.rating) / newTotalRatings;

  await addDoc(collection(db, 'reviews'), {
    ...review,
    itemId,
    createdAt: serverTimestamp()
  });

  await updateDoc(itemRef, {
    totalRatings: newTotalRatings,
    averageRating: newAverageRating
  });
};

export const incrementViews = async (itemId: string) => {
  const itemRef = doc(db, 'items', itemId);
  await updateDoc(itemRef, {
    viewsCount: increment(1)
  });
};

export const useFavorites = () => {
  const [favorites, setFavorites] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('favorites');
      setFavorites(saved ? JSON.parse(saved) : []);
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-window updates
    window.addEventListener('favoritesUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesUpdated', handleStorageChange);
    };
  }, []);

  return { favorites, loading: false };
};

export const toggleFavorite = (itemId: string, isFavorite: boolean) => {
  const saved = localStorage.getItem('favorites');
  let favorites: string[] = saved ? JSON.parse(saved) : [];
  
  if (isFavorite) {
    favorites = favorites.filter(id => id !== itemId);
  } else {
    if (!favorites.includes(itemId)) {
      favorites.push(itemId);
    }
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  window.dispatchEvent(new Event('favoritesUpdated'));
};

export const seedDatabase = async (categories: Category[], items: Partial<DirectoryItem>[]) => {
  // Add categories
  for (const cat of categories) {
    await addDoc(collection(db, 'categories'), { name: cat.name });
  }

  // Add items
  for (const item of items) {
    await addDoc(collection(db, 'items'), {
      ...item,
      createdAt: serverTimestamp(),
      viewsCount: item.viewsCount || 0,
      totalRatings: item.totalRatings || 0,
      averageRating: item.averageRating || 0,
      isNew: item.isNew || false,
      isTopRated: item.isTopRated || false
    });
  }
};
