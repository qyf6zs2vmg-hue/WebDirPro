import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { DirectoryItem } from '@/types';
import { RatingStars } from './RatingStars';
import { cn } from '@/lib/utils';
import { toggleFavorite, useFavorites } from '@/services/firebaseService';
import { useToast, Toast } from './Toast';

interface ItemCardProps {
  item: DirectoryItem;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const { favorites } = useFavorites();
  const { toast, showToast, hideToast } = useToast();
  const isFavorite = favorites.includes(item.id);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      toggleFavorite(item.id, isFavorite);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Link 
      to={`/item/${item.id}`}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden card-shadow flex flex-col h-full cursor-pointer no-underline"
    >
      <div className="relative aspect-video-custom overflow-hidden bg-gray-100">
        <img 
          src={item.imageUrl || `https://picsum.photos/seed/${item.id}/800/450`} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {item.isNew && (
            <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded">Новое</span>
          )}
          {item.isTopRated && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-[10px] font-bold uppercase tracking-wider rounded">Топ рейтинг</span>
          )}
        </div>
        <button 
          onClick={handleFavorite}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all",
            isFavorite ? "bg-red-500 text-white" : "bg-white/50 text-gray-700 hover:bg-white"
          )}
        >
          <Heart size={18} className={cn(isFavorite && "fill-current")} />
        </button>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
            {item.category}
          </span>
          <div className="flex items-center gap-1">
            <RatingStars rating={item.averageRating} />
            <span className="text-xs text-gray-500 font-medium">
              ({item.averageRating.toFixed(1)})
            </span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
          {item.shortDescription}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {item.platforms?.map(p => (
            <span key={p} className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-wider">
              {p}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <span className="text-xs font-medium text-gray-500">
            {item.type}
          </span>
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded",
            item.pricing === 'Free' ? "bg-green-100 text-green-700" : 
            item.pricing === 'Freemium' ? "bg-orange-100 text-orange-700" : 
            "bg-blue-100 text-blue-700"
          )}>
            {item.pricing === 'Free' ? 'Бесплатно' : item.pricing === 'Paid' ? 'Платно' : item.pricing}
          </span>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </Link>
  );
};
