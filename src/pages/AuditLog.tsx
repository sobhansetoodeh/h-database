import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sqliteDb } from '@/lib/sqlite-db';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Search, User, FileText, UserCircle, Briefcase, AlertCircle } from 'lucide-react';
import { toPersianNumber } from '@/lib/persian-utils';

const AuditLog: React.FC = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">دسترسی محدود</h1>
          <p className="text-muted-foreground">شما اجازه دسترسی به این صفحه را ندارید</p>
        </Card>
      </div>
    );
  }

  const logs = sqliteDb.getAuditLogs();
  const users = sqliteDb.getHerasatUsers();

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.fullName || 'ناشناس';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'CREATE': 'ایجاد',
      'UPDATE': 'ویرایش',
      'DELETE': 'حذف',
      'CREATE_USER': 'ایجاد کاربر',
      'UPDATE_PASSWORD': 'تغییر رمز عبور',
      'DELETE_USER': 'حذف کاربر',
      'LOGIN': 'ورود به سیستم',
      'ADD_UPDATE': 'افزودن به‌روزرسانی',
    };
    return labels[action] || action;
  };

  const getEntityLabel = (entityType: string) => {
    const labels: Record<string, string> = {
      'student': 'دانشجو',
      'staff': 'کارمند',
      'faculty': 'عضو هیئت علمی',
      'case': 'پرونده',
      'incident': 'رویداد',
      'user': 'کاربر',
      'auth': 'احراز هویت',
    };
    return labels[entityType] || entityType;
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-500';
    if (action.includes('UPDATE')) return 'bg-blue-500';
    if (action.includes('DELETE')) return 'bg-red-500';
    if (action === 'LOGIN') return 'bg-purple-500';
    return 'bg-gray-500';
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'student':
      case 'staff':
      case 'faculty':
        return <UserCircle className="h-4 w-4" />;
      case 'case':
        return <Briefcase className="h-4 w-4" />;
      case 'incident':
        return <AlertCircle className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'auth':
        return <Shield className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    const userName = getUserName(log.userId);
    const action = getActionLabel(log.action);
    const entityType = getEntityLabel(log.entityType);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      userName.toLowerCase().includes(searchLower) ||
      action.includes(searchTerm) ||
      entityType.includes(searchTerm) ||
      log.details?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">گزارش فعالیت‌ها</h1>
        <div className="relative w-96">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="جستجو در فعالیت‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>هیچ فعالیتی یافت نشد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getEntityIcon(log.entityType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActionColor(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                      <Badge variant="outline">
                        {getEntityLabel(log.entityType)}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">
                      کاربر: {getUserName(log.userId)}
                    </p>
                    {log.details && (
                      <p className="text-sm text-muted-foreground">
                        {log.details}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-left">
                    <p className="text-xs text-muted-foreground">
                      {toPersianNumber(new Date(log.timestamp).toLocaleDateString('fa-IR'))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {toPersianNumber(new Date(log.timestamp).toLocaleTimeString('fa-IR'))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AuditLog;
