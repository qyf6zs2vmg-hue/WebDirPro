import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  max?: number;
  className?: string;
  onRate?: (rating: number) => void;
  interactive?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ 
  rating, 
  max = 5, 
  className,
  onRate,
  interactive = false
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = (hoverRating !== null ? hoverRating : rating) >= starValue;
        
        return (
          <Star
            key={i}
            size={16}
            className={cn(
              "transition-colors",
              isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-700",
              interactive && "cursor-pointer hover:scale-110 active:scale-95"
            )}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            onClick={() => interactive && onRate?.(starValue)}
          />
        );
      })}
    </div>
  );
};
