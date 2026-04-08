import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getUnreviewedClicks, markAsReviewed } from '@/services/trackingService';
import { submitReview } from '@/services/firebaseService';
import { RatingStars } from '@/components/RatingStars';
import { cn } from '@/lib/utils';

export const FeedbackModal = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentItem, setCurrentItem] = React.useState<any>(null);
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const checkFeedback = () => {
      const unreviewed = getUnreviewedClicks();
      if (unreviewed.length > 0 && !isOpen) {
        setCurrentItem(unreviewed[0]);
        setIsOpen(true);
      }
    };

    // Initial check with short delay
    const timer = setTimeout(checkFeedback, 3000);

    // Check when user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkFeedback();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      await submitReview(currentItem.resourceId, {
        itemId: currentItem.resourceId,
        userName: language === 'ru' ? 'Аноним' : 'Anonim',
        rating,
        comment
      });
      markAsReviewed(currentItem.resourceId);
      setIsOpen(false);
      // Check for next unreviewed item
      const remaining = getUnreviewedClicks();
      if (remaining.length > 0) {
        setCurrentItem(remaining[0]);
        setRating(0);
        setComment('');
        setTimeout(() => setIsOpen(true), 2000);
      }
    } catch (error) {
      console.error('Feedback error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (currentItem) {
      markAsReviewed(currentItem.resourceId); // Mark as reviewed even if closed to avoid annoying user
    }
    setIsOpen(false);
  };

  if (!currentItem) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border"
          >
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Star className="fill-current" size={20} />
                <h2 className="font-bold">{t('feedback.title').replace('{name}', currentItem.resourceName)}</h2>
              </div>
              <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground mb-4">{t('feedback.question')}</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        size={36}
                        className={cn(
                          "transition-colors",
                          star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-700"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <MessageSquare size={14} />
                  {t('feedback.comment')}
                </label>
                <textarea
                  className="w-full p-4 bg-input border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  rows={3}
                  placeholder={language === 'ru' ? 'Ваши впечатления...' : 'Sizning taassurotlaringiz...'}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-4 text-gray-500 font-bold hover:bg-input rounded-2xl transition-colors"
                >
                  {t('feedback.close')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={rating === 0 || isSubmitting}
                  className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      {t('feedback.submit')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
