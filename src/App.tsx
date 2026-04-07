import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate,
  useLocation
} from 'react-router-dom';
import { Search, Menu, X, LayoutGrid, Trophy, Settings, User, AlertCircle, Send, ChevronDown, Heart } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Home } from './pages/Home';
import { ItemDetail } from './pages/ItemDetail';
import { TopItems } from './pages/TopItems';
import { AdminPanel } from './pages/AdminPanel';
import { SubmitItem } from './pages/SubmitItem';
import { useCategories } from './services/firebaseService';
import { cn } from './lib/utils';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';

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

  // Keyboard shortcut for admin: Ctrl + Shift + A
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (isAdminMode) {
          setIsAdminMode(false);
          localStorage.setItem('adminMode', 'false');
          if (location.pathname === '/admin') navigate('/');
        } else {
          setShowPasswordModal(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminMode, location.pathname, navigate]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(event.target as Node)) {
        setIsCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1235813213455') {
      setIsAdminMode(true);
      localStorage.setItem('adminMode', 'true');
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError(false);
      navigate('/admin');
    } else {
      setPasswordError(true);
    }
  };

  const navItems = [
    { name: 'Каталог', path: '/', icon: LayoutGrid },
    { name: 'Топ рейтинга', path: '/top', icon: Trophy },
    { name: 'Предложить', path: '/submit', icon: Send },
    { name: 'Админ', path: '/admin', icon: Settings, adminOnly: true },
  ];

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <LayoutGrid className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
                WebDir<span className="text-blue-600">Pro</span>
              </span>
            </Link>

            {/* Categories Dropdown */}
            <div className="relative hidden md:block" ref={catRef}>
              <button 
                onClick={() => setIsCatOpen(!isCatOpen)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all",
                  isCatOpen ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <LayoutGrid size={18} />
                Категории
                <ChevronDown size={14} className={cn("transition-transform", isCatOpen && "rotate-180")} />
              </button>

              {isCatOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-card rounded-2xl shadow-2xl border border-border p-2 grid grid-cols-1 gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link 
                    to="/" 
                    onClick={() => setIsCatOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all"
                  >
                    Все ресурсы
                  </Link>
                  {categories.map(cat => (
                    <Link 
                      key={cat.id}
                      to={`/?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setIsCatOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all"
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
                      : "text-gray-600 dark:text-gray-400 hover:text-foreground"
                  )}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            
            <button 
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl p-8 border border-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Вход для админа</h2>
              <button 
                onClick={() => { setShowPasswordModal(false); setPasswordError(false); setPasswordInput(''); }}
                className="p-1 text-gray-400 hover:text-foreground rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
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
                    "w-full p-3 bg-input border rounded-xl focus:outline-none focus:ring-2 transition-all text-foreground",
                    passwordError ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-blue-500/20"
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
        <div className="md:hidden bg-card border-t border-border py-4 px-4 space-y-2 animate-in slide-in-from-top-4 duration-300">
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
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            )
          ))}
          
          <div className="px-4 pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-t border-border">Категории</div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/?category=${encodeURIComponent(cat.name)}`}
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
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
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
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
          <footer className="bg-card border-t border-border py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} WebDirPro. Профессиональная платформа каталогов.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}
