import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ExternalLink, Users, Zap, Monitor } from 'lucide-react';
import { DirectoryItem } from '@/types';
import { RatingStars } from './RatingStars';
import { cn } from '@/lib/utils';
import { toggleFavorite, useFavorites } from '@/services/firebaseService';
import { trackItemView } from '@/services/trackingService';
import { useToast, Toast } from './Toast';

interface ItemCardProps {
  item: DirectoryItem;
  compact?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, compact = false }) => {
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

  const handleTrackView = () => {
    trackItemView(item);
  };

  return (
    <Link 
      to={`/item/${item.id}`}
      onClick={handleTrackView}
      className={cn(
        "group block bg-card rounded-2xl border border-border overflow-hidden card-shadow flex flex-col h-full cursor-pointer no-underline transition-all duration-300",
        "dark:hover:border-blue-500/50 dark:hover:shadow-blue-500/10",
        compact ? "p-2" : "p-0"
      )}
    >
      <div className={cn(
        "relative overflow-hidden bg-input",
        compact ? "aspect-square rounded-xl" : "aspect-video-custom"
      )}>
        <img 
          src={item.imageUrl || `https://picsum.photos/seed/${item.id}/800/450`} 
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-white text-xs font-bold flex items-center gap-1">
            Подробнее <ExternalLink size={12} />
          </span>
        </div>
        
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.isNew && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-blue-500/20">Новое</span>
          )}
          {item.isTopRated && (
            <span className="px-2 py-0.5 bg-yellow-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-yellow-500/20">Топ</span>
          )}
        </div>
        
        <button 
          onClick={handleFavorite}
          className={cn(
            "absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all duration-300",
            isFavorite 
              ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
              : "bg-white/10 text-white hover:bg-white/40 border border-white/30"
          )}
        >
          <Heart size={14} className={cn(isFavorite && "fill-current")} />
        </button>
      </div>
      
      <div className={cn("flex flex-col flex-grow", compact ? "p-2" : "p-4")}>
        <div className="flex justify-between items-start mb-1.5">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            {item.category}
          </span>
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] text-gray-500 dark:text-gray-300 font-bold">
              {item.averageRating.toFixed(1)}
            </span>
          </div>
        </div>
        
        <h3 className={cn(
          "font-bold text-foreground mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1",
          compact ? "text-sm" : "text-base"
        )}>
          {item.title}
        </h3>
        
        {!compact && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-grow leading-relaxed">
            {item.shortDescription}
          </p>
        )}

        {/* Target Audience Badges */}
        {!compact && item.targetAudience && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800/30">
              <Users size={10} className="text-blue-600 dark:text-blue-400" />
              <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                {item.targetAudience.level === 'Beginner' ? 'Новичок' : item.targetAudience.level === 'Pro' ? 'Профи' : 'Всем'}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-md border border-indigo-100 dark:border-indigo-800/30">
              <Zap size={10} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-[9px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                {item.targetAudience.role === 'Student' ? 'Школьник' : item.targetAudience.role === 'Developer' ? 'Разработчик' : 'Всем'}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-100 dark:border-purple-800/30">
              <Monitor size={10} className="text-purple-600 dark:text-purple-400" />
              <span className="text-[9px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                {item.targetAudience.pc === 'Weak' ? 'Слабый ПК' : item.targetAudience.pc === 'Powerful' ? 'Мощный ПК' : 'Любой ПК'}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {item.type}
          </span>
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            item.pricing === 'Free' ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" : 
            item.pricing === 'Freemium' ? "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400" : 
            "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
          )}>
            {item.pricing === 'Free' ? 'Бесплатно' : item.pricing === 'Paid' ? 'Платно' : item.pricing}
          </span>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </Link>
  );
};
