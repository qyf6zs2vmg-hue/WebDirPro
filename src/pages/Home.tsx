import React from 'react';
import { Search, Filter, SlidersHorizontal, Heart, Sparkles, Clock, Star, LayoutGrid } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useItems, useCategories, useFavorites } from '@/services/firebaseService';
import { ItemCard } from '@/components/ItemCard';
import { SkeletonItemCard } from '@/components/SkeletonItemCard';
import { cn } from '@/lib/utils';
import { getRecommendedItems, getRecentlyViewed, trackSearchQuery } from '@/services/trackingService';

import { useLanguage, TranslatedText } from '@/context/LanguageContext';
import { trackSearch } from '@/lib/analytics';

export const Home = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [placeholder, setPlaceholder] = React.useState('Поиск...');
  const { t, language } = useLanguage();

  React.useEffect(() => {
    const updatePlaceholder = () => {
      setPlaceholder(window.innerWidth < 640 ? t('home.search.placeholder').slice(0, 10) + '...' : t('home.search.placeholder'));
    };
    updatePlaceholder();
    window.addEventListener('resize', updatePlaceholder);
    return () => window.removeEventListener('resize', updatePlaceholder);
  }, [t]);

  const [filters, setFilters] = React.useState({
    category: 'All',
    type: 'All',
    pricing: 'All',
    sortBy: 'highest-rating',
    showFavorites: false
  });
  const [showFilters, setShowFilters] = React.useState(false);

  const { items, loading } = useItems(filters);
  const { categories } = useCategories();
  const { favorites } = useFavorites();
  const location = useLocation();

  const recommendedItems = React.useMemo(() => getRecommendedItems(items), [items]);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      setFilters(prev => ({ ...prev, category: catParam }));
    } else {
      setFilters(prev => ({ ...prev, category: 'All' }));
    }
  }, [location.search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      trackSearchQuery(query);
      trackSearch(query);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (item.shortDescription?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (item.purpose?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    if (filters.showFavorites) {
      return matchesSearch && favorites.includes(item.id);
    }
    
    return matchesSearch;
  });

  const filterOptions = {
    types: [t('home.category.all'), 'Website', 'App', 'Course', 'YouTube'],
    pricing: [t('home.category.all'), 'Free', 'Freemium', 'Paid'],
    sort: [
      { label: t('home.sort.highest_rating'), value: 'highest-rating' },
      { label: t('home.sort.newest'), value: 'newest' },
      { label: t('home.sort.most_reviewed'), value: 'most-reviewed' }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Hero Section - Compact */}
      <div className="relative mb-6 py-8 px-6 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 overflow-hidden shadow-2xl shadow-blue-500/20">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-[100px] dark:bg-blue-400" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-[100px] dark:bg-indigo-400" />
        </div>
        
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 leading-tight">
            {t('home.hero.title')}
          </h1>
          <p className="text-blue-100 dark:text-blue-200/80 text-xs sm:text-sm font-medium mb-6 opacity-90">
            {t('home.hero.subtitle')}
          </p>

          {/* Search Bar in Hero */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 dark:text-blue-400" size={20} />
            <input 
              type="text" 
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-3 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-xl text-white placeholder:text-blue-200 dark:placeholder:text-blue-300/50 focus:outline-none focus:ring-4 focus:ring-white/10 dark:focus:ring-blue-500/20 focus:bg-white/20 dark:focus:bg-black/30 transition-all shadow-xl text-sm"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
        </div>
      </div>

      {/* Recommendations Section */}
      {!searchQuery && !loading && recommendedItems.length > 0 && filters.category === 'All' && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Sparkles className="text-blue-600 dark:text-blue-400" size={18} />
            </div>
            <h2 className="text-lg font-bold text-foreground">{t('home.recommended')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {recommendedItems.map(item => (
              <ItemCard key={item.id} item={item} compact />
            ))}
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">{t('home.sort')}</h3>
              <div className="space-y-2">
                {filterOptions.sort.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilters({ ...filters, sortBy: opt.value })}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                      filters.sortBy === opt.value 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-card border border-transparent hover:border-border"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">{t('nav.catalog')}</h3>
              <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                <button
                  onClick={() => setFilters({ ...filters, category: 'All' })}
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    filters.category === 'All' 
                      ? "text-blue-600 dark:text-blue-400 font-bold" 
                      : "text-gray-600 dark:text-gray-400 hover:text-foreground"
                  )}
                >
                  {t('home.category.all')}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilters({ ...filters, category: cat.name })}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      filters.category === cat.name 
                        ? "text-blue-600 dark:text-blue-400 font-bold" 
                        : "text-gray-600 dark:text-gray-400 hover:text-foreground"
                    )}
                  >
                    <TranslatedText text={cat.name} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

      {/* Grid Area */}
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <LayoutGrid className="text-indigo-600 dark:text-indigo-400" size={18} />
          </div>
          <h2 className="text-lg font-bold text-foreground">{t('home.catalog')}</h2>
        </div>
          {/* Mobile Filter Controls */}
          <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border font-bold text-xs whitespace-nowrap transition-all",
                showFilters ? "bg-blue-600 border-blue-600 text-white" : "bg-card border-border text-gray-600 dark:text-gray-400"
              )}
            >
              <SlidersHorizontal size={16} />
              {t('home.filters')}
            </button>
            <button 
              onClick={() => setFilters({ ...filters, showFavorites: !filters.showFavorites })}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border font-bold text-xs whitespace-nowrap transition-all",
                filters.showFavorites ? "bg-red-500 border-red-500 text-white" : "bg-card border-border text-gray-600 dark:text-gray-400"
              )}
            >
              <Heart size={16} className={cn(filters.showFavorites && "fill-current")} />
              {t('nav.favorites')}
            </button>
          </div>

          {showFilters && (
            <div className="lg:hidden bg-card border border-border rounded-2xl p-4 mb-6 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">{t('home.sort')}</label>
                  <select 
                    className="w-full p-3 bg-input border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  >
                    {filterOptions.sort.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">{language === 'ru' ? 'Категория' : 'Kategoriya'}</label>
                  <select 
                    className="w-full p-3 bg-input border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="All">{t('home.category.all')}</option>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonItemCard key={i} />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-input rounded-full mb-4 text-gray-400">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{t('home.no_results')}</h3>
              <p className="text-gray-500 dark:text-gray-400">{t('home.no_results.subtitle')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recently Viewed Section removed from Home */}
    </div>
  );
};
