import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate,
  useLocation
} from 'react-router-dom';
import { Search, Menu, X, LayoutGrid, Trophy, Settings, User, AlertCircle, Send, ChevronDown } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Home } from './pages/Home';
import { ItemDetail } from './pages/ItemDetail';
import { TopItems } from './pages/TopItems';
import { AdminPanel } from './pages/AdminPanel';
import { SubmitItem } from './pages/SubmitItem';
import { useCategories } from './services/firebaseService';
import { cn } from './lib/utils';

const Header = () => {
  const [isAdminMode, setIsAdminMode] = React.useState(() => localStorage.getItem('adminMode') === 'true');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isCatOpen, setIsCatOpen] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [passwordInput, setPasswordInput] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  
  const { categories } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const catRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(event.target as Node)) {
        setIsCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdminToggle = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      localStorage.setItem('adminMode', 'false');
      if (location.pathname === '/admin') {
        navigate('/');
      }
    } else {
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1235813213455') {
      setIsAdminMode(true);
      localStorage.setItem('adminMode', 'true');
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const navItems = [
    { name: 'Каталог', path: '/', icon: LayoutGrid },
    { name: 'Топ рейтинга', path: '/top', icon: Trophy },
    { name: 'Предложить ресурс', path: '/submit', icon: Send },
    { name: 'Админ-панель', path: '/admin', icon: Settings, adminOnly: true },
  ];

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <LayoutGrid className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 hidden sm:block">
                WebDir<span className="text-blue-600">Pro</span>
              </span>
            </Link>

            {/* Categories Dropdown */}
            <div className="relative hidden md:block" ref={catRef}>
              <button 
                onClick={() => setIsCatOpen(!isCatOpen)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all",
                  isCatOpen ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <LayoutGrid size={18} />
                Категории
                <ChevronDown size={14} className={cn("transition-transform", isCatOpen && "rotate-180")} />
              </button>

              {isCatOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 grid grid-cols-1 gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link 
                    to="/" 
                    onClick={() => setIsCatOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  >
                    Все ресурсы
                  </Link>
                  {categories.map(cat => (
                    <Link 
                      key={cat.id}
                      to={`/?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setIsCatOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              (!item.adminOnly || isAdminMode) && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 text-sm font-bold transition-colors",
                    location.pathname === item.path 
                      ? "text-blue-600" 
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={handleAdminToggle}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all border",
                isAdminMode 
                  ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
                  : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
              )}
            >
              <Settings size={18} />
              {isAdminMode ? 'Выйти из админа' : 'Админ'}
            </button>
            
            <button 
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Вход для админа</h2>
              <button 
                onClick={() => { setShowPasswordModal(false); setPasswordError(false); setPasswordInput(''); }}
                className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Введите пароль администратора</label>
                <input 
                  type="password" 
                  autoFocus
                  className={cn(
                    "w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                    passwordError ? "border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:ring-blue-500/20"
                  )}
                  placeholder="•••••••••••••"
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                  required
                />
                {passwordError && (
                  <p className="mt-2 text-xs font-medium text-red-600">Неверный пароль. Попробуйте еще раз.</p>
                )}
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
              >
                Разблокировать панель
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-2">
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Навигация</div>
          {navItems.map((item) => (
            (!item.adminOnly || isAdminMode) && (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium",
                  location.pathname === item.path 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            )
          ))}
          
          <div className="px-4 pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-t border-gray-50">Категории</div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/?category=${encodeURIComponent(cat.name)}`}
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/top" element={<TopItems />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/submit" element={<SubmitItem />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-200 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} WebDirPro. Профессиональная платформа каталогов.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
