import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Moon, Sun, Monitor, Globe, Check, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(false);
  const [showAdminLogin, setShowAdminLogin] = React.useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1235813213455') {
      localStorage.setItem('adminMode', 'true');
      navigate('/admin');
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  const themes = [
    { id: 'system', label: t('settings.theme.system'), icon: Monitor },
    { id: 'light', label: t('settings.theme.light'), icon: Sun },
    { id: 'dark', label: t('settings.theme.dark'), icon: Moon },
  ];

  const languages = [
    { id: 'ru', label: t('settings.language.ru') },
    { id: 'uz', label: t('settings.language.uz') },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-foreground mb-12 tracking-tight">
        {t('settings.title')}
      </h1>

      <div className="space-y-16">
        {/* Theme Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Sun className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <h2 className="text-xl font-bold text-foreground">{t('settings.theme')}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themes.map((item) => (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as any)}
                className={cn(
                  "flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all",
                  theme === item.id 
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-600 text-blue-600 dark:text-blue-400" 
                    : "bg-card border-border text-gray-500 hover:border-gray-300 dark:hover:border-gray-700"
                )}
              >
                <item.icon size={24} />
                <span className="font-bold text-sm">{item.label}</span>
                {theme === item.id && <Check size={16} className="mt-auto" />}
              </button>
            ))}
          </div>
        </section>

        {/* Language Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <Globe className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <h2 className="text-xl font-bold text-foreground">{t('settings.language')}</h2>
          </div>

          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id as any)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                  language === lang.id 
                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-600 text-purple-600 dark:text-purple-400" 
                    : "bg-card border-border text-gray-500 hover:border-gray-300 dark:hover:border-gray-700"
                )}
              >
                <span className="font-bold">{lang.label}</span>
                {language === lang.id && <Check size={20} />}
              </button>
            ))}
          </div>
        </section>

        {/* Admin Section */}
        <section className="pt-8 border-t border-border">
          {!showAdminLogin ? (
            <button
              onClick={() => setShowAdminLogin(true)}
              className="flex items-center gap-3 text-gray-400 hover:text-blue-600 transition-colors group"
            >
              <Lock size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-bold uppercase tracking-widest">{t('nav.admin')}</span>
            </button>
          ) : (
            <div className="bg-card border border-border rounded-3xl p-8 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-foreground">{t('admin.title')}</h2>
              </div>
              
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
                    {t('admin.password')}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      autoFocus
                      className={cn(
                        "w-full p-4 bg-input border rounded-2xl text-foreground focus:outline-none focus:ring-2 transition-all",
                        error ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-blue-500/20"
                      )}
                      placeholder="•••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertCircle size={20} />
                      </div>
                    )}
                  </div>
                  {error && (
                    <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1">
                      {t('admin.error')}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(false)}
                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-input rounded-2xl transition-colors"
                  >
                    {t('feedback.close')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                  >
                    {t('admin.unlock')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
