import React from 'react';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  Image as ImageIcon,
  Link as LinkIcon,
  Layers,
  Globe,
  Smartphone
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useCategories } from '@/services/firebaseService';
import { ItemType, PricingType, Platform } from '@/types';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export const SubmitItem = () => {
  const { categories } = useCategories();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    title: '',
    category: '',
    type: 'Website' as ItemType,
    imageUrl: '',
    shortDescription: '',
    fullDescription: '',
    purpose: '',
    pricing: 'Free' as PricingType,
    link: '',
    subscriptionPrice: '',
    platforms: [] as Platform[],
    pros: '',
    cons: '',
    alternatives: '',
    targetAudience: {
      level: 'All' as const,
      role: 'All' as const,
      pc: 'All' as const
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
      setError(null);

    try {
      await addDoc(collection(db, 'submissions'), {
        ...formData,
        pros: formData.pros.split(',').map(s => s.trim()).filter(Boolean),
        cons: formData.cons.split(',').map(s => s.trim()).filter(Boolean),
        alternatives: formData.alternatives.split(',').map(s => s.trim()).filter(Boolean),
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError(t('review.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-8 text-green-600 dark:text-green-400">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">{t('submit.success_title')}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
          {t('submit.success_subtitle')}
        </p>
        <Link 
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <ChevronLeft size={20} />
          {t('submit.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 mb-4 hover:gap-3 transition-all">
          <ChevronLeft size={16} />
          {t('submit.back')}
        </Link>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-4">
          {t('submit.title').split(' ')[0]} <span className="text-blue-600 dark:text-blue-500">{t('submit.title').split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {t('submit.subtitle')}
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card p-8 md:p-10 rounded-3xl border border-border shadow-xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.name')}</label>
            <input 
              type="text" 
              className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Напр. Duolingo"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.category')}</label>
            <select 
              className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">{t('submit.form.category_placeholder')}</option>
              {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.type')}</label>
            <select 
              className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ItemType })}
              required
            >
              <option value="Website">Website</option>
              <option value="App">App</option>
              <option value="Course">Course</option>
              <option value="YouTube">YouTube</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.image')}</label>
            <input 
              type="url" 
              className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="https://example.com/logo.png"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.short_desc')}</label>
          <input 
            type="text" 
            className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            placeholder="..."
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.full_desc')}</label>
          <textarea 
            className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            rows={4}
            placeholder="..."
            value={formData.fullDescription}
            onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.purpose')}</label>
            <input 
              type="text" 
              className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="..."
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.pricing')}</label>
            <select 
              className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={formData.pricing}
              onChange={(e) => setFormData({ ...formData, pricing: e.target.value as PricingType })}
            >
              <option value="Free">{t('item.pricing.free')}</option>
              <option value="Freemium">Freemium</option>
              <option value="Paid">{t('item.pricing.paid')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.link')}</label>
            <input 
              type="url" 
              className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="https://www.example.com"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.subscription')}</label>
            <input 
              type="text" 
              className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="..."
              value={formData.subscriptionPrice}
              onChange={(e) => setFormData({ ...formData, subscriptionPrice: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.platforms')}</label>
            <div className="flex flex-wrap gap-4 p-3 bg-input border border-border rounded-xl">
              {['Web', 'Android', 'iOS'].map((p) => (
                <label key={p} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={formData.platforms.includes(p as Platform)}
                    onChange={(e) => {
                      const current = formData.platforms;
                      const next = e.target.checked 
                        ? [...current, p as Platform]
                        : current.filter(x => x !== p);
                      setFormData({ ...formData, platforms: next });
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.alternatives')}</label>
            <input 
              type="text" 
              className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="..."
              value={formData.alternatives}
              onChange={(e) => setFormData({ ...formData, alternatives: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.audience')}</label>
            <div className="grid grid-cols-3 gap-2">
              <select 
                className="p-2 bg-input border border-border rounded-lg text-[10px] font-bold text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={formData.targetAudience.level}
                onChange={(e) => setFormData({ ...formData, targetAudience: { ...formData.targetAudience, level: e.target.value as any } })}
              >
                <option value="All">{t('item.audience.level')}: {t('item.audience.level.all')}</option>
                <option value="Beginner">{t('item.audience.level.beginner')}</option>
                <option value="Pro">{t('item.audience.level.pro')}</option>
              </select>
              <select 
                className="p-2 bg-input border border-border rounded-lg text-[10px] font-bold text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={formData.targetAudience.role}
                onChange={(e) => setFormData({ ...formData, targetAudience: { ...formData.targetAudience, role: e.target.value as any } })}
              >
                <option value="All">{t('item.audience.role')}: {t('item.audience.role.all')}</option>
                <option value="Student">{t('item.audience.role.student')}</option>
                <option value="Developer">{t('item.audience.role.developer')}</option>
              </select>
              <select 
                className="p-2 bg-input border border-border rounded-lg text-[10px] font-bold text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={formData.targetAudience.pc}
                onChange={(e) => setFormData({ ...formData, targetAudience: { ...formData.targetAudience, pc: e.target.value as any } })}
              >
                <option value="All">{t('item.audience.pc')}: {t('item.audience.pc.all')}</option>
                <option value="Weak">{t('item.audience.pc.weak')}</option>
                <option value="Powerful">{t('item.audience.pc.powerful')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.pros')}</label>
            <textarea 
              className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              rows={2}
              placeholder="..."
              value={formData.pros}
              onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t('submit.form.cons')}</label>
            <textarea 
              className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              rows={2}
              placeholder="..."
              value={formData.cons}
              onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <button 
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full py-4 bg-blue-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0",
              isSubmitting && "opacity-70 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('submit.form.submitting')}
              </>
            ) : (
              <>
                <Send size={20} />
                {t('submit.form.submit')}
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
            {t('submit.form.disclaimer')}
          </p>
        </div>
      </form>
    </div>
  );
};
