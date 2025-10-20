import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Briefcase, GraduationCap, FileText, Moon, Sun, ChevronRight, Search, AlertTriangle, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: Home, label: 'داشبورد', path: '/' },
  { icon: Search, label: 'جستجو', path: '/search' },
  { icon: AlertTriangle, label: 'اتفاقات', path: '/incidents' },
  { icon: Users, label: 'دانشجویان', path: '/students' },
  { icon: Briefcase, label: 'کارکنان', path: '/staff' },
  { icon: GraduationCap, label: 'اساتید', path: '/faculty' },
  { icon: FileText, label: 'پرونده‌ها', path: '/cases' },
  { icon: Settings, label: 'تنظیمات', path: '/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-screen bg-sidebar border-l border-sidebar-border transition-all duration-300 z-50',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-lg bg-primary/10 overflow-hidden flex items-center justify-center">
              {/* Replace /placeholder.svg with your logo path */}
              <img 
                src="/placeholder.svg" 
                alt="لوگو" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.fallback-logo');
                  if (fallback) (fallback as HTMLElement).style.display = 'flex';
                }}
              />
              <div className="fallback-logo hidden w-full h-full bg-primary items-center justify-center text-primary-foreground font-bold text-xl">
                ح
              </div>
            </div>
          </div>
          {isOpen && (
            <h1 className="text-center text-lg font-bold text-sidebar-foreground">
              سامانه حراست
            </h1>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={cn(
              'w-full justify-start gap-3',
              !isOpen && 'justify-center'
            )}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
            {isOpen && (
              <span className="text-sm">
                {theme === 'light' ? 'حالت تاریک' : 'حالت روشن'}
              </span>
            )}
          </Button>

          {/* Credits */}
          {isOpen && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t border-sidebar-border">
              طراحی توسط<br />خدمات انفورماتیک قائم
            </div>
          )}

          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full justify-center"
          >
            <ChevronRight
              className={cn(
                'w-5 h-5 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};