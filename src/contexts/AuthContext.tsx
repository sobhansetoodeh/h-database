import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { sqliteDb, HerasatUser } from '@/lib/sqlite-db';

interface AuthUser extends HerasatUser {
  roles: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const initDb = async () => {
      await sqliteDb.initialize();
      const savedUser = localStorage.getItem('herasat_current_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    };
    initDb();
  }, []);

  const login = (username: string, password: string): boolean => {
    const authenticatedUser = sqliteDb.authenticateHerasatUser(username, password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      localStorage.setItem('herasat_current_user', JSON.stringify(authenticatedUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('herasat_current_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      isAdmin: user?.roles?.includes('admin') || false
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};