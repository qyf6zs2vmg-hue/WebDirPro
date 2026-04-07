import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate,
  useLocation
} from 'react-router-dom';
import { Search, Menu, X, LayoutGrid, Trophy, Settings, LogIn, LogOut, User, AlertCircle } from 'lucide-react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Home } from './pages/Home';
import { ItemDetail } from './pages/ItemDetail';
import { TopItems } from './pages/TopItems';
import { AdminPanel } from './pages/AdminPanel';
import { cn } from './lib/utils';

const Header = () => {
  const [isAdminMode, setIsAdminMode] = React.useState(() => localStorage.getItem('adminMode') === 'true');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [passwordInput, setPasswordInput] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

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
    { name: 'Directory', path: '/', icon: LayoutGrid },
    { name: 'Top Rated', path: '/top', icon: Trophy },
    { name: 'Admin Panel', path: '/admin', icon: Settings, adminOnly: true },
  ];

  return (
    <header className="glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutGrid className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 hidden sm:block">
              WebDir<span className="text-blue-600">Pro</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              (!item.adminOnly || isAdminMode) && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
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
              <User size={18} />
              {isAdminMode ? 'Exit Admin' : 'Admin Mode'}
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
              <h2 className="text-xl font-bold text-gray-900">Admin Login</h2>
              <button 
                onClick={() => { setShowPasswordModal(false); setPasswordError(false); setPasswordInput(''); }}
                className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Enter Admin Password</label>
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
                  <p className="mt-2 text-xs font-medium text-red-600">Incorrect password. Please try again.</p>
                )}
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
              >
                Unlock Admin Panel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-2">
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
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-200 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} WebDirPro. Professional Directory Platform.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
