import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { toPersianNumber } from '@/lib/persian-utils';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">{user?.fullName}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
        <LogOut className="w-4 h-4" />
        <span>خروج</span>
      </Button>
    </header>
  );
};