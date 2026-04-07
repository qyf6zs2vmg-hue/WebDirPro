import React from 'react';
import { Trophy, Star, TrendingUp, Award } from 'lucide-react';
import { useItems, useCategories } from '@/services/firebaseService';
import { ItemCard } from '@/components/ItemCard';
import { cn } from '@/lib/utils';

export const TopItems = () => {
  const { items, loading } = useItems({ sortBy: 'highest-rating' });
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const top3 = items.slice(0, 3);
  const categoryTops = selectedCategory === 'All' 
    ? items.slice(3, 15) 
    : items.filter(item => item.category === selectedCategory).slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl mb-6 text-yellow-600 dark:text-yellow-400">
          <Trophy size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl mb-4">
          Зал <span className="text-yellow-500">Славы</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Самые высокооцененные ресурсы в нашем каталоге по мнению сообщества.
        </p>
      </div>

      {/* Podium Section */}
      {!loading && top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="md:mt-12 order-2 md:order-1">
              <div className="text-center mb-4">
                <span className="inline-block px-4 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-full">#2 Серебро</span>
              </div>
              <ItemCard item={top3[1]} />
            </div>
          )}
          {/* 1st Place */}
          {top3[0] && (
            <div className="order-1 md:order-2 scale-105 z-10">
              <div className="text-center mb-4">
                <span className="inline-block px-4 py-1 bg-yellow-400 text-white text-sm font-bold rounded-full shadow-lg shadow-yellow-400/20">#1 Золото</span>
              </div>
              <ItemCard item={top3[0]} />
            </div>
          )}
          {/* 3rd Place */}
          {top3[2] && (
            <div className="md:mt-20 order-3">
              <div className="text-center mb-4">
                <span className="inline-block px-4 py-1 bg-orange-200 dark:bg-orange-900/40 text-orange-800 dark:text-orange-400 text-sm font-bold rounded-full">#3 Бронза</span>
              </div>
              <ItemCard item={top3[2]} />
            </div>
          )}
        </div>
      )}

      {/* Category Tops */}
      <div className="border-t border-border pt-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <TrendingUp className="text-blue-600" />
            Топ по категориям
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === 'All' 
                  ? "bg-foreground text-background" 
                  : "bg-card border border-border text-gray-600 dark:text-gray-400 hover:border-gray-400"
              )}
            >
              Все
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === cat.name 
                    ? "bg-foreground text-background" 
                    : "bg-card border border-border text-gray-600 dark:text-gray-400 hover:border-gray-400"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border h-80 animate-pulse" />
            ))}
          </div>
        ) : categoryTops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryTops.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-input rounded-3xl border border-dashed border-border">
            <Award className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400 font-medium">В этой категории пока нет ресурсов.</p>
          </div>
        )}
      </div>
    </div>
  );
};
