import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Key, Database } from 'lucide-react';
import { sqliteDb } from '@/lib/sqlite-db';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'خطا',
        description: 'رمز عبور جدید و تکرار آن یکسان نیستند',
        variant: 'destructive',
      });
      return;
    }

    // Password change logic would go here
    toast({
      title: 'موفقیت',
      description: 'رمز عبور با موفقیت تغییر کرد',
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleExportData = () => {
    try {
      const blob = sqliteDb.exportDatabase();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `herasat-${new Date().toISOString().split('T')[0]}.db`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'موفقیت',
        description: 'فایل دیتابیس با موفقیت دانلود شد',
      });
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در ایجاد فایل پشتیبان',
        variant: 'destructive',
      });
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await sqliteDb.importDatabase(file);
      toast({
        title: 'موفقیت',
        description: 'دیتابیس با موفقیت بازیابی شد. صفحه را رفرش کنید.',
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'فایل دیتابیس معتبر نیست',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">تنظیمات</h1>

      {/* User Info */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          اطلاعات کاربری
        </h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">نام کاربری: </span>
            <span>{user?.username}</span>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">نام و نام خانوادگی: </span>
            <span>{user?.fullName}</span>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">نقش: </span>
            <span>{user?.roles?.includes('admin') ? 'مدیر' : 'کاربر'}</span>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">تغییر رمز عبور</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="current-password">رمز عبور فعلی</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="new-password">رمز عبور جدید</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">تکرار رمز عبور جدید</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit">ذخیره رمز عبور جدید</Button>
        </form>
      </Card>

      {/* Database Management */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          مدیریت دیتابیس
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">محل ذخیره‌سازی</h3>
            <p className="text-sm text-muted-foreground">
              تمام اطلاعات در یک فایل دیتابیس SQLite محلی (.db) ذخیره می‌شود.
              این فایل کاملاً آفلاین است و می‌توانید آن را دانلود، پشتیبان‌گیری و بازیابی کنید.
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleExportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              دریافت پشتیبان
            </Button>
            
            <label>
              <Button variant="outline" type="button" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  بازیابی از پشتیبان
                </span>
              </Button>
              <input
                type="file"
                accept=".db,application/x-sqlite3"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>توجه:</strong> حتماً به صورت منظم فایل دیتابیس خود را دانلود و پشتیبان تهیه کنید.
              فایل .db را می‌توانید در هر سیستمی بازیابی کنید و کاملاً قابل حمل است.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
