import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  Smartphone, 
  Monitor,
  ChevronLeft,
  Eye,
  Calendar,
  Layers,
  ArrowRight,
  Trophy,
  Heart,
  Users,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useItem, useReviews, submitReview, incrementViews, incrementClicks, useFavorites, toggleFavorite, useItems } from '@/services/firebaseService';
import { RatingStars } from '@/components/RatingStars';
import { ItemCard } from '@/components/ItemCard';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast, Toast } from '@/components/Toast';

import { useLanguage, TranslatedText } from '@/context/LanguageContext';
import { trackOutboundLink, trackAddToFavorite } from '@/lib/analytics';
import { isUniqueView, isUniqueClick, addToClickHistory } from '@/services/trackingService';

export const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { item, loading: itemLoading } = useItem(id!);
  const { reviews, loading: reviewsLoading } = useReviews(id!);
  const { items: allItems } = useItems();
  const { favorites } = useFavorites();
  const { toast, showToast, hideToast } = useToast();
  const { t, language } = useLanguage();
  const isFavorite = id ? favorites.includes(id) : false;

  const [relatedLimit, setRelatedLimit] = React.useState(6);

  const relatedItems = React.useMemo(() => {
    if (!item || !allItems.length) return [];
    return allItems
      .filter(i => i.category === item.category && i.id !== item.id)
      .sort((a, b) => {
        // Sort by rating, then views
        if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      });
  }, [item, allItems]);

  const visibleRelated = React.useMemo(() => relatedItems.slice(0, relatedLimit), [relatedItems, relatedLimit]);

  const [userRating, setUserRating] = React.useState(0);
  const [userName, setUserName] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (id && isUniqueView(id)) {
      incrementViews(id);
    }
  }, [id]);

  const [showReviews, setShowReviews] = React.useState(false);
  const [showReviewForm, setShowReviewForm] = React.useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating === 0) return showToast(t('review.select_rating'), "info");

    setIsSubmitting(true);
    try {
      await submitReview(id!, {
        itemId: id!,
        userName: userName || 'Аноним',
        rating: userRating,
        comment
      });
      setComment('');
      setUserName('');
      setUserRating(0);
      setShowReviewForm(false);
      setShowReviews(true);
      showToast(t('review.success'), "success");
    } catch (error) {
      console.error(error);
      showToast(t('review.error'), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFavorite = () => {
    if (!id || !item) return;
    try {
      toggleFavorite(id, isFavorite);
      if (!isFavorite) {
        trackAddToFavorite(id, item.title);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleVisitSite = () => {
    if (item) {
      trackOutboundLink(item.link);
      if (isUniqueClick(item.id)) {
        incrementClicks(item.id);
      }
      addToClickHistory(item.id, item.title);
    }
  };

  if (itemLoading) return <div className="max-w-7xl mx-auto p-8 animate-pulse">{t('loading')}</div>;
  if (!item) return <div className="text-center py-20">{t('home.no_results')}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors">
        <ChevronLeft size={14} />
        {t('submit.back')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="lg:col-span-2">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="w-full md:w-1/4 aspect-video-custom md:aspect-square rounded-xl overflow-hidden border border-border shadow-sm">
              <img 
                src={item.imageUrl || `https://picsum.photos/seed/${item.id}/800/800`} 
                alt={item.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-grow">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
                  <TranslatedText text={item.category} />
                </span>
                <span className="px-3 py-1 bg-input text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-wider rounded-full">
                  {item.type}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                <TranslatedText text={item.title} />
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <RatingStars rating={item.averageRating} className="scale-110 origin-left" />
                  <span className="text-base font-bold text-foreground ml-1">{item.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-gray-300 dark:text-gray-800">|</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{item.totalRatings} {t('item.reviews_count')}</span>
                <span className="text-gray-300 dark:text-gray-800">|</span>
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <Eye size={14} />
                  {item.viewsCount || 0}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={handleVisitSite}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  {t('item.visit')}
                  <ExternalLink size={16} />
                </a>
                <button 
                  onClick={handleFavorite}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all border-2",
                    isFavorite 
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400" 
                      : "bg-card border-border text-foreground hover:bg-input"
                  )}
                >
                  <Heart size={16} className={cn(isFavorite && "fill-current")} />
                  {isFavorite ? t('item.favorite.remove') : t('item.favorite.add')}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">
                {t('item.about')} <TranslatedText text={item.title} />
              </h2>
              <div className="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 text-sm">
                {item.fullDescription?.split('\n')?.map((p, i) => (
                  <p key={i} className="mb-3">
                    <TranslatedText text={p} />
                  </p>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/20">
                <h3 className="flex items-center gap-2 text-base font-bold text-green-800 dark:text-green-400 mb-3">
                  <CheckCircle2 size={18} />
                  {t('item.pros')}
                </h3>
                <ul className="space-y-2">
                  {item.pros?.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-green-700 dark:text-green-300/80">
                      <div className="mt-1 w-1 h-1 bg-green-500 rounded-full flex-shrink-0" />
                      <TranslatedText text={pro} />
                    </li>
                  ))}
                </ul>
              </section>
              <section className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20">
                <h3 className="flex items-center gap-2 text-base font-bold text-red-800 dark:text-red-400 mb-3">
                  <XCircle size={18} />
                  {t('item.cons')}
                </h3>
                <ul className="space-y-2">
                  {item.cons?.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300/80">
                      <div className="mt-1 w-1 h-1 bg-red-500 rounded-full flex-shrink-0" />
                      <TranslatedText text={con} />
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="border-t border-border pt-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-foreground">{t('item.reviews')} ({item.totalRatings})</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setShowReviews(!showReviews)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-input text-foreground font-bold rounded-lg border border-border hover:bg-border transition-colors text-sm"
                  >
                    {showReviews ? t('item.reviews.hide') : t('item.reviews.show')}
                  </button>
                  <button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {t('item.reviews.write')}
                  </button>
                </div>
              </div>

              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="bg-card p-6 rounded-2xl border border-border mb-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-foreground uppercase text-xs tracking-wider">{t('item.new_review')}</h3>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="text-gray-400 hover:text-foreground">
                      <XCircle size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('item.your_name')}</label>
                      <input 
                        type="text"
                        className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="..."
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('item.your_rating')}</label>
                      <RatingStars 
                        rating={userRating} 
                        interactive 
                        onRate={setUserRating} 
                        className="scale-150 origin-left mb-2" 
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('item.your_comment')}</label>
                    <textarea 
                      className="w-full p-4 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      rows={4}
                      placeholder="..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-6 py-2.5 bg-input text-foreground font-bold rounded-lg hover:bg-border transition-colors"
                    >
                      {t('item.cancel')}
                    </button>
                    <button 
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? t('submit.form.submitting') : t('item.publish')}
                    </button>
                  </div>
                </form>
              )}

              {showReviews && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  {reviews.length > 0 ? reviews.map(review => (
                    <div key={review.id} className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                            {review.userName?.[0] || 'A'}
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">{review.userName}</h4>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                              {review.createdAt?.seconds ? format(new Date(review.createdAt.seconds * 1000), 'dd.MM.yyyy') : t('item.just_now')}
                            </p>
                          </div>
                        </div>
                        <RatingStars rating={review.rating} />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        <TranslatedText text={review.comment} />
                      </p>
                    </div>
                  )) : (
                    <div className="text-center py-12 bg-input rounded-2xl border border-dashed border-border">
                      <p className="text-gray-500 dark:text-gray-400">{t('item.reviews.none')}</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Right Column: Sidebar Stats */}
        <div className="space-y-6">
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-4 border-b border-border pb-2">{t('item.details')}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Layers size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{t('item.purpose')}</p>
                  <p className="text-xs font-semibold text-foreground">
                    <TranslatedText text={item.purpose} />
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{t('item.pricing')}</p>
                  <p className="text-xs font-semibold text-foreground">
                    {item.pricing === 'Free' ? t('item.pricing.free') : item.pricing === 'Paid' ? t('item.pricing.paid') : item.pricing} {item.subscriptionPrice && `(${item.subscriptionPrice})`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Globe size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{t('item.platforms')}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.platforms?.includes('Web') && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-input rounded-md border border-border">
                        <Globe size={12} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Web</span>
                      </div>
                    )}
                    {item.platforms?.includes('Android') && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-input rounded-md border border-border">
                        <Smartphone size={12} className="text-green-500" />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Android</span>
                      </div>
                    )}
                    {item.platforms?.includes('iOS') && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-input rounded-md border border-border">
                        <Smartphone size={12} className="text-foreground" />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">iOS</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">{t('item.audience')}</h3>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('item.audience.level')}</span>
                </div>
                <span className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase">
                  {item.targetAudience?.level === 'Beginner' ? t('item.audience.level.beginner') : item.targetAudience?.level === 'Pro' ? t('item.audience.level.pro') : t('item.audience.level.all')}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                <div className="flex items-center gap-3">
                  <Zap size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('item.audience.role')}</span>
                </div>
                <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase">
                  {item.targetAudience?.role === 'Student' ? t('item.audience.role.student') : item.targetAudience?.role === 'Developer' ? t('item.audience.role.developer') : t('item.audience.role.all')}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30">
                <div className="flex items-center gap-3">
                  <Monitor size={18} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('item.audience.pc')}</span>
                </div>
                <span className="text-xs font-black text-purple-700 dark:text-purple-300 uppercase">
                  {item.targetAudience?.pc === 'Weak' ? t('item.audience.pc.weak') : item.targetAudience?.pc === 'Powerful' ? t('item.audience.pc.powerful') : t('item.audience.pc.all')}
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-foreground mb-4">{t('item.alternatives')}</h3>
            <div className="space-y-3">
              {item.alternatives?.map((alt, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ArrowRight size={14} className="text-blue-500" />
                  <TranslatedText text={alt} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Resources Section */}
      {relatedItems.length > 0 && (
        <section className="mt-20">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t('item.related')}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleRelated.map(rel => (
              <ItemCard key={rel.id} item={rel} />
            ))}
          </div>

          {relatedLimit < relatedItems.length && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setRelatedLimit(prev => prev + 6)}
                className="px-8 py-3 bg-card border border-border text-foreground font-bold rounded-xl hover:bg-input transition-all"
              >
                {t('item.load_more')}
              </button>
            </div>
          )}
        </section>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
};
