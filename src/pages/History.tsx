import React from 'react';
import { Clock, Trash2, Search } from 'lucide-react';
import { useItems } from '@/services/firebaseService';
import { ItemCard } from '@/components/ItemCard';
import { getRecentlyViewed, clearRecentlyViewed } from '@/services/trackingService';
import { cn } from '@/lib/utils';

export const History = () => {
  const { items, loading } = useItems({ category: 'All', type: 'All', pricing: 'All', sortBy: 'newest' });
  const [recentlyViewedIds, setRecentlyViewedIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    const history = getRecentlyViewed(items);
    setRecentlyViewedIds(history.map(i => i.id));
  }, [items]);

  const historyItems = React.useMemo(() => {
    return items.filter(item => recentlyViewedIds.includes(item.id))
      .sort((a, b) => {
        const indexA = recentlyViewedIds.indexOf(a.id);
        const indexB = recentlyViewedIds.indexOf(b.id);
        return indexA - indexB;
      });
  }, [items, recentlyViewedIds]);

  const handleClearHistory = () => {
    clearRecentlyViewed();
    setRecentlyViewedIds([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Clock className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">История просмотров</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Ресурсы, которые вы недавно посещали.
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/20"
          >
            <Trash2 size={18} />
            Очистить историю
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-card animate-pulse rounded-3xl border border-border" />
          ))}
        </div>
      ) : historyItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {historyItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-card rounded-[2.5rem] border border-dashed border-border">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-input rounded-full mb-6 text-gray-400">
            <Clock size={40} />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">История пуста</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
            Вы еще не просматривали ни одного ресурса. Начните изучение каталога, чтобы увидеть историю здесь.
          </p>
          <a 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
          >
            <Search size={20} />
            Перейти в каталог
          </a>
        </div>
      )}
    </div>
  );
};
