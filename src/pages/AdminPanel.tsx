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
  Star
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { useItems, useCategories } from '@/services/firebaseService';
import { DirectoryItem, Category, ItemType, Level, PricingType, Platform } from '@/types';
import { onAuthStateChanged, User } from 'firebase/auth';
import { cn } from '@/lib/utils';

export const AdminPanel = () => {
  const [isAdminMode, setIsAdminMode] = React.useState(() => localStorage.getItem('adminMode') === 'true');
  const { items, loading: itemsLoading } = useItems();
  const { categories, loading: catsLoading } = useCategories();
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Partial<DirectoryItem> | null>(null);
  const [isCatEditing, setIsCatEditing] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');

  React.useEffect(() => {
    const checkAdmin = () => {
      setIsAdminMode(localStorage.getItem('adminMode') === 'true');
    };
    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, []);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const itemData = {
        ...editingItem,
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
      }
      setIsEditing(false);
      setEditingItem(null);
    } catch (error) {
      console.error(error);
      alert("Error saving item");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, 'items', id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    try {
      await addDoc(collection(db, 'categories'), { name: newCatName });
      setNewCatName('');
      setIsCatEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Delete category?")) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      console.error(error);
    }
  };

  const seedData = async () => {
    if (!window.confirm("This will add sample data. Continue?")) return;
    const batch = writeBatch(db);
    
    // Sample Categories
    const catNames = ['Education', 'Entertainment', 'Programming', 'Tools'];
    for (const name of catNames) {
      const catRef = doc(collection(db, 'categories'));
      batch.set(catRef, { name });
    }

    // Sample Items
    const samples = [
      {
        title: 'Duolingo',
        shortDescription: 'The world\'s most popular way to learn a language.',
        fullDescription: 'Duolingo is the most popular language-learning platform and the most downloaded education app in the world, with more than 500 million users. The company\'s mission is to make education free, fun, and available to all.',
        category: 'Education',
        type: 'App',
        imageUrl: 'https://picsum.photos/seed/duo/800/800',
        purpose: 'Language Learning',
        level: 'Beginner',
        pricing: 'Freemium',
        subscriptionPrice: '$6.99/mo',
        platforms: ['Web', 'Android', 'iOS'],
        pros: ['Fun gamified learning', 'Bite-sized lessons', 'Large variety of languages'],
        cons: ['Limited grammar depth', 'Hearts system can be annoying'],
        alternatives: ['Babbel', 'Rosetta Stone', 'Memrise'],
        link: 'https://www.duolingo.com',
        averageRating: 4.7,
        totalRatings: 1250,
        viewsCount: 5000,
        isTopRated: true,
        isNew: false
      },
      {
        title: 'VS Code',
        shortDescription: 'Code editing. Redefined.',
        fullDescription: 'Visual Studio Code is a code editor redefined and optimized for building and debugging modern web and cloud applications.',
        category: 'Programming',
        type: 'Website',
        imageUrl: 'https://picsum.photos/seed/vscode/800/800',
        purpose: 'Coding',
        level: 'Intermediate',
        pricing: 'Free',
        platforms: ['Web'],
        pros: ['Extremely customizable', 'Huge extension library', 'Great Git integration'],
        cons: ['Can be resource heavy', 'Complex configuration'],
        alternatives: ['Sublime Text', 'Atom', 'WebStorm'],
        link: 'https://code.visualstudio.com',
        averageRating: 4.9,
        totalRatings: 3400,
        viewsCount: 12000,
        isTopRated: true,
        isNew: false
      }
    ];

    for (const sample of samples) {
      const itemRef = doc(collection(db, 'items'));
      batch.set(itemRef, { ...sample, createdAt: serverTimestamp() });
    }

    await batch.commit();
    alert("Seed data added!");
  };

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
            onClick={seedData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Database size={18} />
            Seed Data
          </button>
          <button 
            onClick={() => { setIsEditing(true); setEditingItem({}); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add New Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Management */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Categories</h2>
              <button 
                onClick={() => setIsCatEditing(!isCatEditing)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Plus size={20} />
              </button>
            </div>

            {isCatEditing && (
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Cat name..."
                  className="flex-grow p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <button 
                  onClick={handleAddCategory}
                  className="p-2 bg-blue-600 text-white rounded-lg"
                >
                  <Save size={16} />
                </button>
              </div>
            )}

            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl group">
                  <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Items Management */}
        <div className="lg:col-span-3">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Level</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    value={editingItem?.level || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, level: e.target.value as Level })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Elementary">Elementary</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
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
    </div>
  );
};
