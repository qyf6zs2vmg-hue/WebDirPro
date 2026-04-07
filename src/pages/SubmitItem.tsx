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

export const SubmitItem = () => {
  const { categories } = useCategories();
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
    alternatives: ''
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
      setError("Не удалось отправить. Пожалуйста, попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-8 text-green-600">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Заявка получена!</h1>
        <p className="text-lg text-gray-600 mb-10">
          Спасибо за предложение ресурса. Наша команда рассмотрит его и добавит в каталог, если он соответствует нашим критериям.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <ChevronLeft size={20} />
          Назад в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 mb-4 hover:gap-3 transition-all">
          <ChevronLeft size={16} />
          Назад в каталог
        </Link>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
          Предложить <span className="text-blue-600">Ресурс</span>
        </h1>
        <p className="text-lg text-gray-600">
          Знаете отличный сайт, приложение или курс? Поделитесь им с сообществом.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Название ресурса</label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Напр. Duolingo"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Категория</label>
            <select 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Выберите категорию</option>
              {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Тип ресурса</label>
            <select 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ItemType })}
              required
            >
              <option value="Website">Сайт</option>
              <option value="App">Приложение</option>
              <option value="Course">Курс</option>
              <option value="YouTube">YouTube</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">URL изображения/логотипа</label>
            <input 
              type="url" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="https://example.com/logo.png"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Краткое описание</label>
          <input 
            type="text" 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            placeholder="Одно предложение, описывающее ресурс"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Полное описание</label>
          <textarea 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            rows={4}
            placeholder="Расскажите подробнее, почему этот ресурс полезен..."
            value={formData.fullDescription}
            onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Основное назначение</label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Напр. Изучение языков, Программирование, Дизайн"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Модель оплаты</label>
            <select 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={formData.pricing}
              onChange={(e) => setFormData({ ...formData, pricing: e.target.value as PricingType })}
            >
              <option value="Free">Бесплатно</option>
              <option value="Freemium">Freemium</option>
              <option value="Paid">Платно</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ссылка на официальный сайт</label>
            <input 
              type="url" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="https://www.example.com"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Стоимость подписки (если есть)</label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Напр. $9.99/мес"
              value={formData.subscriptionPrice}
              onChange={(e) => setFormData({ ...formData, subscriptionPrice: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Доступные платформы</label>
            <div className="flex flex-wrap gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
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
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{p}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Альтернативы (через запятую)</label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Альтернатива 1, Альтернатива 2..."
              value={formData.alternatives}
              onChange={(e) => setFormData({ ...formData, alternatives: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Плюсы (через запятую)</label>
            <textarea 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              rows={2}
              placeholder="Быстро, Бесплатно, Легко использовать..."
              value={formData.pros}
              onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Минусы (через запятую)</label>
            <textarea 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              rows={2}
              placeholder="Медленно, Дорого, Ограниченные функции..."
              value={formData.cons}
              onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100">
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
                Отправка...
              </>
            ) : (
              <>
                <Send size={20} />
                Отправить заявку
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-4">
            Отправляя заявку, вы соглашаетесь с тем, что эта информация будет рассмотрена нашей командой.
          </p>
        </div>
      </form>
    </div>
  );
};
