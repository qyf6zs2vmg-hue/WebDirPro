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
  Heart
} from 'lucide-react';
import { useItem, useReviews, submitReview, incrementViews, useFavorites, toggleFavorite, useItems } from '@/services/firebaseService';
import { RatingStars } from '@/components/RatingStars';
import { ItemCard } from '@/components/ItemCard';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast, Toast } from '@/components/Toast';

export const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { item, loading: itemLoading } = useItem(id!);
  const { reviews, loading: reviewsLoading } = useReviews(id!);
  const { items: allItems } = useItems();
  const { favorites } = useFavorites();
  const { toast, showToast, hideToast } = useToast();
  const isFavorite = id ? favorites.includes(id) : false;

  const relatedItems = React.useMemo(() => {
    if (!item || !allItems.length) return [];
    return allItems
      .filter(i => i.category === item.category && i.id !== item.id)
      .slice(0, 3);
  }, [item, allItems]);
  const [userRating, setUserRating] = React.useState(0);
  const [userName, setUserName] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (id) incrementViews(id);
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating === 0) return showToast("Пожалуйста, выберите оценку", "info");

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
      showToast("Отзыв опубликован!", "success");
    } catch (error) {
      console.error(error);
      showToast("Ошибка при публикации отзыва", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFavorite = () => {
    if (!id) return;
    try {
      toggleFavorite(id, isFavorite);
    } catch (error) {
      console.error(error);
    }
  };

  if (itemLoading) return <div className="max-w-7xl mx-auto p-8 animate-pulse">Загрузка...</div>;
  if (!item) return <div className="text-center py-20">Ресурс не найден</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-8 transition-colors">
        <ChevronLeft size={16} />
        Назад в каталог
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Info */}
        <div className="lg:col-span-2">
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="w-full md:w-1/3 aspect-video-custom md:aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <img 
                src={item.imageUrl || `https://picsum.photos/seed/${item.id}/800/800`} 
                alt={item.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-grow">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full">
                  {item.category}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full">
                  {item.type}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{item.title}</h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <RatingStars rating={item.averageRating} className="scale-125 origin-left" />
                  <span className="text-lg font-bold text-gray-900 ml-2">{item.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-sm text-gray-600 font-medium">{item.totalRatings} Отзывов</span>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Eye size={16} />
                  {item.viewsCount} Просмотров
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mb-8">
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  Посетить сайт
                  <ExternalLink size={20} />
                </a>
                <button 
                  onClick={handleFavorite}
                  className={cn(
                    "inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl transition-all border-2",
                    isFavorite 
                      ? "bg-red-50 border-red-200 text-red-600" 
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Heart size={20} className={cn(isFavorite && "fill-current")} />
                  {isFavorite ? 'В избранном' : 'В избранное'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">О ресурсе {item.title}</h2>
              <div className="prose prose-blue max-w-none text-gray-600">
                {item.fullDescription?.split('\n')?.map((p, i) => <p key={i} className="mb-4">{p}</p>)}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-green-50 p-6 rounded-2xl border border-green-100">
                <h3 className="flex items-center gap-2 text-lg font-bold text-green-800 mb-4">
                  <CheckCircle2 size={20} />
                  Плюсы
                </h3>
                <ul className="space-y-3">
                  {item.pros?.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                      <div className="mt-1 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="bg-red-50 p-6 rounded-2xl border border-red-100">
                <h3 className="flex items-center gap-2 text-lg font-bold text-red-800 mb-4">
                  <XCircle size={20} />
                  Минусы
                </h3>
                <ul className="space-y-3">
                  {item.cons?.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                      <div className="mt-1 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Отзывы</h2>
              <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded-2xl border border-gray-200 mb-8 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Оставить отзыв</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ваше имя (опционально)</label>
                    <input 
                      type="text"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Напр. Иван Иванов"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ваша оценка</label>
                    <RatingStars 
                      rating={userRating} 
                      interactive 
                      onRate={setUserRating} 
                      className="scale-150 origin-left mb-2" 
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ваш комментарий</label>
                  <textarea 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    rows={4}
                    placeholder="Поделитесь своим опытом использования этого ресурса..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>
                <button 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Отправка...' : 'Опубликовать отзыв'}
                </button>
              </form>

              <div className="space-y-6">
                {reviews.length > 0 ? reviews.map(review => (
                  <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {review.userName?.[0] || 'A'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{review.userName}</h4>
                          <p className="text-xs text-gray-500">
                            {review.createdAt?.seconds ? format(new Date(review.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Только что'}
                          </p>
                        </div>
                      </div>
                      <RatingStars rating={review.rating} />
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                )) : (
                  <p className="text-center text-gray-500 py-8">Отзывов пока нет. Будьте первым!</p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Right Column: Sidebar Stats */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Детали</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Layers size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Назначение</p>
                  <p className="text-sm font-semibold text-gray-900">{item.purpose}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Цена</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.pricing === 'Free' ? 'Бесплатно' : item.pricing === 'Paid' ? 'Платно' : item.pricing} {item.subscriptionPrice && `(${item.subscriptionPrice})`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Платформы</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {item.platforms?.includes('Web') && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                        <Globe size={14} className="text-blue-500" />
                        <span className="text-xs font-bold text-gray-600">Web</span>
                      </div>
                    )}
                    {item.platforms?.includes('Android') && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                        <Smartphone size={14} className="text-green-500" />
                        <span className="text-xs font-bold text-gray-600">Android</span>
                      </div>
                    )}
                    {item.platforms?.includes('iOS') && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                        <Smartphone size={14} className="text-gray-900" />
                        <span className="text-xs font-bold text-gray-600">iOS</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Целевая аудитория</h3>
            <p className="text-sm text-gray-600 mb-6">Идеально подходит для тех, кто хочет улучшить свои навыки в категории {item.category.toLowerCase()}.</p>
            
            <h3 className="text-lg font-bold text-gray-900 mb-4">Альтернативы</h3>
            <div className="space-y-3">
              {item.alternatives?.map((alt, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <ArrowRight size={14} className="text-blue-500" />
                  {alt}
                </div>
              ))}
            </div>
          </div>

          {relatedItems.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Похожие ресурсы</h3>
              <div className="space-y-4">
                {relatedItems.map(rel => (
                  <ItemCard key={rel.id} item={rel} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
};
