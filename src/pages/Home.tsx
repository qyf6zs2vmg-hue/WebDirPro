import React from 'react';
import { Search, Filter, SlidersHorizontal, Heart } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useItems, useCategories, useFavorites } from '@/services/firebaseService';
import { ItemCard } from '@/components/ItemCard';
import { SkeletonItemCard } from '@/components/SkeletonItemCard';
import { cn } from '@/lib/utils';

export const Home = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
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

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      setFilters(prev => ({ ...prev, category: catParam }));
    } else {
      setFilters(prev => ({ ...prev, category: 'All' }));
    }
  }, [location.search]);

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
    types: ['Все', 'Website', 'App', 'Course', 'YouTube'],
    pricing: ['Все', 'Free', 'Freemium', 'Paid'],
    sort: [
      { label: 'Высший рейтинг', value: 'highest-rating' },
      { label: 'Новинки', value: 'newest' },
      { label: 'Больше отзывов', value: 'most-reviewed' }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
          Откройте для себя лучшие <span className="text-blue-600">ресурсы</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Курируемый каталог сайтов, приложений и курсов с высоким рейтингом, которые помогут вам учиться и расти.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Поиск по названию или описанию..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-all",
                showFilters ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              )}
            >
              <SlidersHorizontal size={18} />
              Фильтры
            </button>
            <select 
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              {filterOptions.sort.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button 
              onClick={() => setFilters({ ...filters, showFavorites: !filters.showFavorites })}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-all",
                filters.showFavorites ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              )}
            >
              <Heart size={18} className={cn(filters.showFavorites && "fill-current")} />
              <span className="hidden sm:inline">Избранное</span>
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Категория</label>
              <select 
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="All">Все категории</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Тип</label>
              <select 
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                {filterOptions.types.map(t => <option key={t} value={t}>{t === 'All' ? 'Все' : t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Цена</label>
              <select 
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                value={filters.pricing}
                onChange={(e) => setFilters({ ...filters, pricing: e.target.value })}
              >
                {filterOptions.pricing.map(p => <option key={p} value={p}>{p === 'All' ? 'Все' : p === 'Free' ? 'Бесплатно' : p === 'Paid' ? 'Платно' : p}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonItemCard key={i} />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4 text-gray-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Результатов не найдено</h3>
          <p className="text-gray-500">Попробуйте изменить фильтры или поисковый запрос.</p>
        </div>
      )}
    </div>
  );
};
