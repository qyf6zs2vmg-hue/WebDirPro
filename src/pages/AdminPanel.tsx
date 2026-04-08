import React from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Database, 
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Link as LinkIcon,
  Layers,
  Settings,
  Star,
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Inbox,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  writeBatch,
  onSnapshot,
  query,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { useItems, useCategories, seedDatabase } from '@/services/firebaseService';
import { INITIAL_CATEGORIES, INITIAL_ITEMS } from '@/services/seedData';
import { DirectoryItem, Category, ItemType, PricingType, Platform, Review } from '@/types';
import { onAuthStateChanged, User } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useToast, Toast } from '@/components/Toast';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';

export const AdminPanel = () => {
  const { t } = useLanguage();
  const [isAdminMode, setIsAdminMode] = React.useState(() => localStorage.getItem('adminMode') === 'true');
  const { items, loading: itemsLoading } = useItems();
  const { categories, loading: catsLoading } = useCategories();
  const { toast, showToast, hideToast } = useToast();
  
  const [activeTab, setActiveTab] = React.useState<'items' | 'categories' | 'submissions' | 'reviews'>('items');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<(Partial<DirectoryItem> & { submissionId?: string }) | null>(null);
  const [isCatEditing, setIsCatEditing] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');
  
  const [submissions, setSubmissions] = React.useState<any[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [prosText, setProsText] = React.useState('');
  const [consText, setConsText] = React.useState('');
  const [altsText, setAltsText] = React.useState('');

  const [confirmConfig, setConfirmConfig] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'primary'
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'primary' = 'danger') => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm, variant });
  };

  React.useEffect(() => {
    const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (editingItem) {
      setProsText(editingItem.pros?.join(', ') || '');
      setConsText(editingItem.cons?.join(', ') || '');
      setAltsText(editingItem.alternatives?.join(', ') || '');
    }
  }, [editingItem?.id]);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const { submissionId, ...rest } = editingItem;
      const itemData = {
        ...rest,
        pros: prosText.split(',').map(s => s.trim()).filter(Boolean),
        cons: consText.split(',').map(s => s.trim()).filter(Boolean),
        alternatives: altsText.split(',').map(s => s.trim()).filter(Boolean),
        averageRating: editingItem.averageRating || 0,
        totalRatings: editingItem.totalRatings || 0,
        viewsCount: editingItem.viewsCount || 0,
        createdAt: editingItem.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (editingItem.id) {
        await updateDoc(doc(db, 'items', editingItem.id), itemData);
      } else {
        await addDoc(collection(db, 'items'), itemData);
        if (submissionId) {
          await deleteDoc(doc(db, 'submissions', submissionId));
        }
      }
      setIsEditing(false);
      setEditingItem(null);
      showToast(submissionId ? "Заявка одобрена и добавлена!" : "Сохранено успешно!", "success");
    } catch (error) {
      console.error(error);
      showToast("Ошибка при сохранении", "error");
    }
  };

  const handleDeleteItem = async (id: string) => {
    triggerConfirm(
      "Удалить ресурс",
      "Вы уверены, что хотите удалить этот ресурс? Это действие нельзя отменить.",
      async () => {
        try {
          await deleteDoc(doc(db, 'items', id));
          showToast("Удалено", "success");
        } catch (error) {
          console.error(error);
          showToast("Ошибка при удалении", "error");
        }
      }
    );
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    try {
      await addDoc(collection(db, 'categories'), { name: newCatName });
      setNewCatName('');
      setIsCatEditing(false);
      showToast("Категория добавлена", "success");
    } catch (error) {
      console.error(error);
      showToast("Ошибка при добавлении категории", "error");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    triggerConfirm(
      "Удалить категорию",
      "Вы уверены, что хотите удалить эту категорию? Ресурсы в этой категории останутся, но их метка категории будет устаревшей.",
      async () => {
        try {
          await deleteDoc(doc(db, 'categories', id));
          showToast("Категория удалена", "success");
        } catch (error) {
          console.error(error);
          showToast("Ошибка при удалении категории", "error");
        }
      }
    );
  };

  const handleApproveSubmission = async (sub: any) => {
    try {
      const { id, ...itemData } = sub;
      await addDoc(collection(db, 'items'), {
        ...itemData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        averageRating: 0,
        totalRatings: 0,
        viewsCount: 0
      });
      await deleteDoc(doc(db, 'submissions', id));
      showToast("Заявка одобрена и добавлена в каталог!", "success");
    } catch (error) {
      console.error(error);
      showToast("Ошибка при одобрении заявки", "error");
    }
  };

  const handleSeedDatabase = async () => {
    triggerConfirm(
      "Восстановить базу данных",
      "Вы уверены, что хотите восстановить базу данных начальными данными? Это добавит стандартные категории и ресурсы.",
      async () => {
        try {
          await seedDatabase(INITIAL_CATEGORIES, INITIAL_ITEMS as any);
          showToast("База данных успешно восстановлена!", "success");
        } catch (error) {
          console.error(error);
          showToast("Ошибка при восстановлении базы данных", "error");
        }
      },
      'primary'
    );
  };

  const handleDeleteSubmission = async (id: string) => {
    triggerConfirm(
      "Отклонить заявку",
      "Вы уверены, что хотите отклонить и удалить эту заявку?",
      async () => {
        try {
          await deleteDoc(doc(db, 'submissions', id));
          showToast("Заявка отклонена", "success");
        } catch (error) {
          console.error(error);
          showToast("Ошибка при отклонении заявки", "error");
        }
      }
    );
  };

  const handleDeleteReview = async (reviewId: string, itemId: string, rating: number) => {
    triggerConfirm(
      "Удалить отзыв",
      "Вы уверены, что хотите удалить этот отзыв? Это также повлияет на средний рейтинг ресурса.",
      async () => {
        try {
          // Delete the review
          await deleteDoc(doc(db, 'reviews', reviewId));

          // Update item rating
          const itemRef = doc(db, 'items', itemId);
          const itemDoc = await getDoc(itemRef);
          
          if (itemDoc.exists()) {
            const itemData = itemDoc.data() as DirectoryItem;
            const currentTotal = itemData.totalRatings || 0;
            const currentAvg = itemData.averageRating || 0;

            if (currentTotal > 1) {
              const newTotal = currentTotal - 1;
              const newAvg = ((currentAvg * currentTotal) - rating) / newTotal;
              await updateDoc(itemRef, {
                totalRatings: newTotal,
                averageRating: Math.max(0, newAvg)
              });
            } else {
              await updateDoc(itemRef, {
                totalRatings: 0,
                averageRating: 0
              });
            }
          }

          showToast("Отзыв удален", "success");
        } catch (error) {
          console.error(error);
          showToast("Ошибка при удалении отзыва", "error");
        }
      }
    );
  };

  const analytics = React.useMemo(() => {
    if (!items.length) return null;
    
    const totalViews = items.reduce((acc, item) => acc + (item.viewsCount || 0), 0);
    const totalClicks = items.reduce((acc, item) => acc + (item.clicksCount || 0), 0);
    const avgRating = items.reduce((acc, item) => acc + (item.averageRating || 0), 0) / items.length;
    
    const catStats = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topItems = [...items].sort((a, b) => (Number(b.viewsCount) || 0) - (Number(a.viewsCount) || 0)).slice(0, 5);
    const popularCategory = Object.entries(catStats).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || 'Нет данных';

    return { totalViews, totalClicks, avgRating, popularCategory, topItems };
  }, [items]);

  if (!isAdminMode) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-6 text-red-600 dark:text-red-400">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Доступ запрещен</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Вы должны быть администратором для доступа к этой панели.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Вернуться на главную
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Панель управления</h1>
          <p className="text-gray-500 dark:text-gray-400">Управляйте контентом каталога и категориями.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleSeedDatabase}
            className="flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-input text-foreground font-bold rounded-lg border border-border hover:bg-border transition-colors"
          >
            <Database size={18} />
            Восстановить БД
          </button>
          <button 
            onClick={() => { setIsEditing(true); setEditingItem({}); }}
            className="flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} />
            Добавить ресурс
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Eye size={20} />
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('item.views')}</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{analytics.totalViews.toLocaleString()}</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                <ExternalLink size={20} />
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('item.clicks')}</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{analytics.totalClicks.toLocaleString()}</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                <Star size={20} />
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('item.your_rating')}</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{analytics.avgRating.toFixed(1)}</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                <TrendingUp size={20} />
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Поп. катег.</p>
            </div>
            <p className="text-xl font-bold text-foreground truncate">{analytics.popularCategory}</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900/20 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400">
                <BarChart3 size={20} />
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Всего</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{items.length}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-border overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('items')}
            className={cn(
              "pb-4 px-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap",
              activeTab === 'items' ? "border-blue-600 text-blue-600 dark:text-blue-500" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-foreground"
            )}
          >
            Ресурсы
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={cn(
              "pb-4 px-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap",
              activeTab === 'categories' ? "border-blue-600 text-blue-600 dark:text-blue-500" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-foreground"
            )}
          >
            Категории
          </button>
          <button 
            onClick={() => setActiveTab('submissions')}
            className={cn(
              "pb-4 px-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap",
              activeTab === 'submissions' ? "border-blue-600 text-blue-600 dark:text-blue-500" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-foreground"
            )}
          >
            Заявки
            {submissions.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {submissions.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={cn(
              "pb-4 px-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap",
              activeTab === 'reviews' ? "border-blue-600 text-blue-600 dark:text-blue-500" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-foreground"
            )}
          >
            Отзывы
          </button>
        </div>

      {activeTab === 'items' && (
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-input border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ресурс</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Категория</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Статистика</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-input transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-border" />
                          <div>
                            <p className="font-bold text-foreground">{item.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase rounded">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-foreground">{item.averageRating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <Eye size={10} /> {item.viewsCount || 0}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <ExternalLink size={10} /> {item.clicksCount || 0}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setEditingItem(item); setIsEditing(true); }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden divide-y divide-border">
              {items.map(item => (
                <div key={item.id} className="p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-border" />
                    <div className="flex-grow">
                      <p className="font-bold text-foreground">{item.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">{item.category}</span>
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-foreground">{item.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingItem(item); setIsEditing(true); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-input text-foreground font-bold rounded-lg border border-border"
                    >
                      <Edit2 size={16} />
                      Изменить
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 font-bold rounded-lg border border-red-100 dark:border-red-900/30"
                    >
                      <Trash2 size={16} />
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="max-w-2xl">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-foreground">Управление категориями</h2>
              <button 
                onClick={() => setIsCatEditing(!isCatEditing)}
                className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            {isCatEditing && (
              <div className="flex gap-2 mb-6 animate-in slide-in-from-top-2 duration-200">
                <input 
                  type="text" 
                  placeholder="Название категории..."
                  className="flex-grow p-3 bg-input border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <button 
                  onClick={handleAddCategory}
                  className="px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  <Save size={18} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-4 bg-input rounded-xl group border border-transparent hover:border-border transition-all">
                  <span className="font-bold text-gray-700 dark:text-gray-300">{cat.name}</span>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {submissions.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
              <Inbox size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-xl font-bold text-foreground">Нет новых заявок</h3>
              <p className="text-gray-500 dark:text-gray-400">Когда пользователи предложат ресурсы, они появятся здесь.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {submissions.map(sub => (
                <div key={sub.id} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex gap-4">
                      <img src={sub.imageUrl} alt="" className="w-20 h-20 rounded-xl object-cover border border-border" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-foreground">{sub.title}</h3>
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase rounded">
                            {sub.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{sub.category}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{sub.shortDescription}</p>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col justify-end gap-2">
                      <button 
                        onClick={() => handleApproveSubmission(sub)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20"
                      >
                        <Check size={18} />
                        Одобрить
                      </button>
                      <button 
                        onClick={() => handleDeleteSubmission(sub.id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        <Trash2 size={18} />
                        Отклонить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
              <MessageSquare size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-xl font-bold text-foreground">Отзывов пока нет</h3>
              <p className="text-gray-500 dark:text-gray-400">Здесь будут отображаться все отзывы пользователей.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-foreground">{review.userName}</h4>
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold text-foreground">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{review.comment}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        <span>ID Ресурса: {review.itemId}</span>
                        <span>•</span>
                        <span>{review.createdAt?.seconds ? format(new Date(review.createdAt.seconds * 1000), 'dd.MM.yyyy HH:mm') : 'Недавно'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteReview(review.id!, review.itemId, review.rating)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-border">
            <div className="sticky top-0 bg-card border-b border-border px-8 py-6 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-foreground">
                {editingItem?.id ? 'Редактировать' : 'Добавить новый'}
              </h2>
              <button 
                onClick={() => { setIsEditing(false); setEditingItem(null); }}
                className="p-2 text-gray-400 hover:text-foreground rounded-full hover:bg-input"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Название</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={editingItem?.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Категория</label>
                  <select 
                    className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={editingItem?.category || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Тип</label>
                  <select 
                    className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={editingItem?.type || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as ItemType })}
                    required
                  >
                    <option value="Website">Website</option>
                    <option value="App">App</option>
                    <option value="Course">Course</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">URL Изображения</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={editingItem?.imageUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Краткое описание</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={editingItem?.shortDescription || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, shortDescription: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Полное описание</label>
                <textarea 
                  className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={4}
                  value={editingItem?.fullDescription || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, fullDescription: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Назначение</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={editingItem?.purpose || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, purpose: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Цена</label>
                  <select 
                    className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={editingItem?.pricing || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, pricing: e.target.value as PricingType })}
                  >
                    <option value="Free">Free</option>
                    <option value="Freemium">Freemium</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Официальная ссылка</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={editingItem?.link || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Цена подписки (опционально)</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={editingItem?.subscriptionPrice || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, subscriptionPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Плюсы (через запятую)</label>
                  <textarea 
                    className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    rows={2}
                    value={prosText}
                    onChange={(e) => setProsText(e.target.value)}
                    placeholder="Быстро, Бесплатно, Удобно..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Минусы (через запятую)</label>
                  <textarea 
                    className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    rows={2}
                    value={consText}
                    onChange={(e) => setConsText(e.target.value)}
                    placeholder="Медленно, Дорого..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Платформы</label>
                  <div className="flex flex-wrap gap-4 p-3 bg-input border border-border rounded-xl">
                    {['Web', 'Android', 'iOS'].map((p) => (
                      <label key={p} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={editingItem?.platforms?.includes(p as Platform) || false}
                          onChange={(e) => {
                            const current = editingItem?.platforms || [];
                            const next = e.target.checked 
                              ? [...current, p as Platform]
                              : current.filter(x => x !== p);
                            setEditingItem({ ...editingItem, platforms: next });
                          }}
                        />
                        <span className="text-sm text-foreground">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Для кого (Уровень / Роль / ПК)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select 
                      className="p-2 bg-input border border-border rounded-lg text-[10px] font-bold text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={editingItem?.targetAudience?.level || 'All'}
                      onChange={(e) => setEditingItem({ ...editingItem, targetAudience: { ...(editingItem?.targetAudience || { level: 'All', role: 'All', pc: 'All' }), level: e.target.value as any } })}
                    >
                      <option value="All">Уровень: Все</option>
                      <option value="Beginner">Новичок</option>
                      <option value="Pro">Профи</option>
                    </select>
                    <select 
                      className="p-2 bg-input border border-border rounded-lg text-[10px] font-bold text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={editingItem?.targetAudience?.role || 'All'}
                      onChange={(e) => setEditingItem({ ...editingItem, targetAudience: { ...(editingItem?.targetAudience || { level: 'All', role: 'All', pc: 'All' }), role: e.target.value as any } })}
                    >
                      <option value="All">Роль: Все</option>
                      <option value="Student">Школьник</option>
                      <option value="Developer">Разработчик</option>
                    </select>
                    <select 
                      className="p-2 bg-input border border-border rounded-lg text-[10px] font-bold text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={editingItem?.targetAudience?.pc || 'All'}
                      onChange={(e) => setEditingItem({ ...editingItem, targetAudience: { ...(editingItem?.targetAudience || { level: 'All', role: 'All', pc: 'All' }), pc: e.target.value as any } })}
                    >
                      <option value="All">ПК: Любой</option>
                      <option value="Weak">Слабый</option>
                      <option value="Powerful">Мощный</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Альтернативы (через запятую)</label>
                <textarea 
                  className="w-full p-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={2}
                  value={altsText}
                  onChange={(e) => setAltsText(e.target.value)}
                  placeholder="Google, Microsoft, Apple..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-border">
                <button 
                  type="button"
                  onClick={() => { setIsEditing(false); setEditingItem(null); }}
                  className="px-8 py-3 bg-input text-foreground font-bold rounded-xl hover:bg-border transition-colors"
                >
                  Отмена
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmConfig.isOpen && (
        <ConfirmModal 
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          onConfirm={confirmConfig.onConfirm}
          onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
          variant={confirmConfig.variant}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
};
