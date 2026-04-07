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
  ChevronUp
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
  orderBy
} from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { useItems, useCategories } from '@/services/firebaseService';
import { DirectoryItem, Category, ItemType, PricingType, Platform } from '@/types';
import { onAuthStateChanged, User } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useToast, Toast } from '@/components/Toast';

export const AdminPanel = () => {
  const [isAdminMode, setIsAdminMode] = React.useState(() => localStorage.getItem('adminMode') === 'true');
  const { items, loading: itemsLoading } = useItems();
  const { categories, loading: catsLoading } = useCategories();
  const { toast, showToast, hideToast } = useToast();
  
  const [activeTab, setActiveTab] = React.useState<'items' | 'categories' | 'submissions'>('items');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<(Partial<DirectoryItem> & { submissionId?: string }) | null>(null);
  const [isCatEditing, setIsCatEditing] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');
  
  const [submissions, setSubmissions] = React.useState<any[]>([]);
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

  const analytics = React.useMemo(() => {
    if (!items.length) return null;
    
    const totalViews = items.reduce((acc, item) => acc + (item.viewsCount || 0), 0);
    const avgRating = items.reduce((acc, item) => acc + (item.averageRating || 0), 0) / items.length;
    
    const catStats = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topItems = [...items].sort((a, b) => (Number(b.viewsCount) || 0) - (Number(a.viewsCount) || 0)).slice(0, 5);
    const popularCategory = Object.entries(catStats).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || 'N/A';

    return { totalViews, avgRating, popularCategory, topItems };
  }, [items]);

  if (!isAdminMode) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6 text-red-600">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-8">You must be an administrator to access this panel.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your directory content and categories.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setIsEditing(true); setEditingItem({}); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add New Item
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Eye size={20} />
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase">Total Views</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <Star size={20} />
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase">Avg Rating</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.avgRating.toFixed(1)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                <TrendingUp size={20} />
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase">Popular Cat</p>
            </div>
            <p className="text-xl font-bold text-gray-900 truncate">{analytics.popularCategory}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                <BarChart3 size={20} />
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase">Total Items</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{items.length}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('items')}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all border-b-2",
            activeTab === 'items' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Items
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all border-b-2",
            activeTab === 'categories' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Categories
        </button>
        <button 
          onClick={() => setActiveTab('submissions')}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2",
            activeTab === 'submissions' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Submissions
          {submissions.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {submissions.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'items' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Items Management */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold">{item.averageRating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setEditingItem(item); setIsEditing(true); }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="max-w-2xl">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Manage Categories</h2>
              <button 
                onClick={() => setIsCatEditing(!isCatEditing)}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            {isCatEditing && (
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Category name..."
                  className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <button 
                  onClick={handleAddCategory}
                  className="px-4 bg-blue-600 text-white rounded-xl font-bold"
                >
                  <Save size={18} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl group">
                  <span className="font-bold text-gray-700">{cat.name}</span>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900">No new submissions</h3>
              <p className="text-gray-500">When users suggest resources, they will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {submissions.map(sub => (
                <div key={sub.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex gap-4">
                      <img src={sub.imageUrl} alt="" className="w-20 h-20 rounded-xl object-cover border border-gray-100" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{sub.title}</h3>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded">
                            {sub.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{sub.category}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{sub.shortDescription}</p>
                      </div>
                    </div>
                    <div className="flex md:flex-col justify-end gap-2">
                      <button 
                        onClick={() => handleApproveSubmission(sub)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check size={18} />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleDeleteSubmission(sub.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={18} />
                        Reject
                      </button>
                    </div>
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
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingItem?.id ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button 
                onClick={() => { setIsEditing(false); setEditingItem(null); }}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Title</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    value={editingItem?.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    value={editingItem?.category || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
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
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Image URL</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    value={editingItem?.imageUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Short Description</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                  value={editingItem?.shortDescription || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, shortDescription: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Description</label>
                <textarea 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                  rows={4}
                  value={editingItem?.fullDescription || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, fullDescription: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Purpose</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    value={editingItem?.purpose || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, purpose: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pricing</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
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
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Official Link</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    value={editingItem?.link || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subscription Price (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    value={editingItem?.subscriptionPrice || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, subscriptionPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pros (Comma separated)</label>
                  <textarea 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    rows={2}
                    value={prosText}
                    onChange={(e) => setProsText(e.target.value)}
                    placeholder="Fast, Free, Easy..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cons (Comma separated)</label>
                  <textarea 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    rows={2}
                    value={consText}
                    onChange={(e) => setConsText(e.target.value)}
                    placeholder="Slow, Expensive..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Platforms</label>
                  <div className="flex flex-wrap gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
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
                        <span className="text-sm">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Alternatives (Comma separated)</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    value={altsText}
                    onChange={(e) => setAltsText(e.target.value)}
                    placeholder="Alternative 1, Alternative 2..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => { setIsEditing(false); setEditingItem(null); }}
                  className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}
    </div>
  );
};
