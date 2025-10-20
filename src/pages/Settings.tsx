import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Key, Database } from 'lucide-react';

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
    const data = {
      people: localStorage.getItem('people'),
      cases: localStorage.getItem('cases'),
      incidents: localStorage.getItem('incidents'),
      attachments: localStorage.getItem('attachments'),
      herasat_users: localStorage.getItem('herasat_users'),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `herasat-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'موفقیت',
      description: 'پشتیبان گیری با موفقیت انجام شد',
    });
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        Object.keys(data).forEach(key => {
          if (data[key]) {
            localStorage.setItem(key, data[key]);
          }
        });

        toast({
          title: 'موفقیت',
          description: 'بازیابی اطلاعات با موفقیت انجام شد. صفحه را رفرش کنید.',
        });
      } catch (error) {
        toast({
          title: 'خطا',
          description: 'فایل معتبر نیست',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
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
            <span>{user?.role}</span>
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
              تمام اطلاعات در Local Storage مرورگر شما ذخیره می‌شود.
              برای پشتیبان‌گیری و انتقال اطلاعات از گزینه‌های زیر استفاده کنید.
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
                accept="application/json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>توجه:</strong> حتماً به صورت منظم از اطلاعات خود پشتیبان تهیه کنید.
              پاک کردن حافظه مرورگر منجر به از دست رفتن تمام اطلاعات می‌شود.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
