import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes: { id: 'light' | 'dark' | 'system'; icon: any; label: string }[] = [
    { id: 'light', icon: Sun, label: 'Светлая' },
    { id: 'dark', icon: Moon, label: 'Темная' },
    { id: 'system', icon: Monitor, label: 'Системная' },
  ];

  const CurrentIcon = themes.find(t => t.id === theme)?.icon || Monitor;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title="Сменить тему"
      >
        <CurrentIcon size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-card rounded-xl shadow-2xl border border-border p-1 z-[60] animate-in fade-in zoom-in-95 duration-200">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                theme === t.id 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
