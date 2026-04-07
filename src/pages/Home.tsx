import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useItems, useCategories } from '@/services/firebaseService';
import { ItemCard } from '@/components/ItemCard';
import { cn } from '@/lib/utils';

export const Home = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState({
    category: 'All',
    type: 'All',
    level: 'All',
    pricing: 'All',
    sortBy: 'highest-rating'
  });
  const [showFilters, setShowFilters] = React.useState(false);

  const { items, loading } = useItems(filters);
  const { categories } = useCategories();

  const filteredItems = items.filter(item => 
    (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (item.shortDescription?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const filterOptions = {
    types: ['All', 'Website', 'App', 'Course', 'YouTube'],
    levels: ['All', 'Beginner', 'Elementary', 'Intermediate', 'Advanced'],
    pricing: ['All', 'Free', 'Freemium', 'Paid'],
    sort: [
      { label: 'Highest Rating', value: 'highest-rating' },
      { label: 'Newest', value: 'newest' },
      { label: 'Most Reviewed', value: 'most-reviewed' }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
          Discover the Best <span className="text-blue-600">Resources</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A curated directory of top-rated websites, apps, and courses to help you learn and grow.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by title or description..."
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
              Filters
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
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
              <select 
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type</label>
              <select 
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                {filterOptions.types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Level</label>
              <select 
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              >
                {filterOptions.levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pricing</label>
              <select 
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                value={filters.pricing}
                onChange={(e) => setFilters({ ...filters, pricing: e.target.value })}
              >
                {filterOptions.pricing.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-80 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No items found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};
