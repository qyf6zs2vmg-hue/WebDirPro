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
  Trophy
} from 'lucide-react';
import { useItem, useReviews, submitReview, incrementViews } from '@/services/firebaseService';
import { RatingStars } from '@/components/RatingStars';
import { format } from 'date-fns';
import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { cn } from '@/lib/utils';

export const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { item, loading: itemLoading } = useItem(id!);
  const { reviews, loading: reviewsLoading } = useReviews(id!);
  const [user, setUser] = React.useState<User | null>(null);
  const [userRating, setUserRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    if (id) incrementViews(id);
    return () => unsubscribe();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please sign in to leave a review");
    if (userRating === 0) return alert("Please select a rating");

    setIsSubmitting(true);
    try {
      await submitReview(id!, {
        itemId: id!,
        userName: user.displayName || 'Anonymous',
        rating: userRating,
        comment
      });
      setComment('');
      setUserRating(0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (itemLoading) return <div className="max-w-7xl mx-auto p-8 animate-pulse">Loading...</div>;
  if (!item) return <div className="text-center py-20">Item not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-8 transition-colors">
        <ChevronLeft size={16} />
        Back to Directory
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
                <span className="text-sm text-gray-600 font-medium">{item.totalRatings} Reviews</span>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Eye size={16} />
                  {item.viewsCount} Views
                </div>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {item.shortDescription}
              </p>
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                Visit Official Site
                <ExternalLink size={20} />
              </a>
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {item.title}</h2>
              <div className="prose prose-blue max-w-none text-gray-600">
                {item.fullDescription?.split('\n')?.map((p, i) => <p key={i} className="mb-4">{p}</p>)}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-green-50 p-6 rounded-2xl border border-green-100">
                <h3 className="flex items-center gap-2 text-lg font-bold text-green-800 mb-4">
                  <CheckCircle2 size={20} />
                  Pros
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
                  Cons
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
              <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded-2xl border border-gray-200 mb-8 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Name (Optional)</label>
                    <input 
                      type="text"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g. John Doe"
                      value={user?.displayName || ''}
                      onChange={(e) => setUser({ ...user, displayName: e.target.value } as any)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Rating</label>
                    <RatingStars 
                      rating={userRating} 
                      interactive 
                      onRate={setUserRating} 
                      className="scale-150 origin-left mb-2" 
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Comment</label>
                  <textarea 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    rows={4}
                    placeholder="Share your experience with this resource..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>
                <button 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Post Review'}
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
                            {review.createdAt?.seconds ? format(new Date(review.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <RatingStars rating={review.rating} />
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                )) : (
                  <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Right Column: Sidebar Stats */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Details</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Layers size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Purpose</p>
                  <p className="text-sm font-semibold text-gray-900">{item.purpose}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Level</p>
                  <p className="text-sm font-semibold text-gray-900">{item.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Pricing</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.pricing} {item.subscriptionPrice && `(${item.subscriptionPrice})`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Platforms</p>
                  <div className="flex gap-2 mt-1">
                    {item.platforms?.includes('Web') && <Globe size={16} className="text-gray-400" title="Web" />}
                    {item.platforms?.includes('Android') && <Smartphone size={16} className="text-gray-400" title="Android" />}
                    {item.platforms?.includes('iOS') && <Smartphone size={16} className="text-gray-400" title="iOS" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Target Audience</h3>
            <p className="text-sm text-gray-600 mb-6">Perfect for those looking to improve their skills in {item.category.toLowerCase()}.</p>
            
            <h3 className="text-lg font-bold text-gray-900 mb-4">Alternatives</h3>
            <div className="space-y-3">
              {item.alternatives?.map((alt, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <ArrowRight size={14} className="text-blue-500" />
                  {alt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
