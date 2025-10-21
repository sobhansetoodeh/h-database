import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sqliteDb } from '@/lib/sqlite-db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2, Key, Shield, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toPersianNumber } from '@/lib/persian-utils';

const UserManagement: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const users = sqliteDb.getHerasatUsers();

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
      });
      return;
    }

    try {
      sqliteDb.addHerasatUser(username, password, fullName, role, currentUser!.id);
      toast({
        title: 'موفق',
        description: 'کاربر با موفقیت ایجاد شد',
      });
      setIsCreateOpen(false);
      setUsername('');
      setPassword('');
      setFullName('');
      setRole('user');
      window.location.reload();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'خطا در ایجاد کاربر',
      });
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'رمز عبور و تکرار آن مطابقت ندارند',
      });
      return;
    }

    try {
      sqliteDb.updateUserPassword(selectedUserId, newPassword, currentUser!.id);
      toast({
        title: 'موفق',
        description: 'رمز عبور با موفقیت تغییر یافت',
      });
      setIsPasswordOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      setSelectedUserId('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'خطا در تغییر رمز عبور',
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'نمی‌توانید کاربر خود را حذف کنید',
      });
      return;
    }

    try {
      sqliteDb.deleteHerasatUser(userId, currentUser!.id);
      toast({
        title: 'موفق',
        description: 'کاربر با موفقیت حذف شد',
      });
      window.location.reload();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'خطا در حذف کاربر',
      });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">مدیریت کاربران</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="ml-2 h-4 w-4" />
              کاربر جدید
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ایجاد کاربر جدید</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">نام کاربری</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">نام کامل</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">نقش</Label>
                <Select value={role} onValueChange={(val) => setRole(val as 'admin' | 'user')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">کاربر</SelectItem>
                    <SelectItem value="admin">مدیر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">ایجاد کاربر</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map((user) => {
          const userRoles = sqliteDb.getUserRoles(user.id);
          return (
            <Card key={user.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{user.fullName}</h3>
                    {userRoles.map((r) => (
                      <Badge key={r} variant={r === 'admin' ? 'default' : 'secondary'}>
                        {r === 'admin' ? (
                          <>
                            <Shield className="ml-1 h-3 w-3" />
                            مدیر
                          </>
                        ) : (
                          <>
                            <User className="ml-1 h-3 w-3" />
                            کاربر
                          </>
                        )}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    نام کاربری: <span className="font-mono">{user.username}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    تاریخ ایجاد: {toPersianNumber(new Date(user.createdAt).toLocaleDateString('fa-IR'))}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isPasswordOpen && selectedUserId === user.id} onOpenChange={(open) => {
                    setIsPasswordOpen(open);
                    if (!open) setSelectedUserId('');
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>تغییر رمز عبور</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">رمز عبور جدید</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">تغییر رمز عبور</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={user.id === currentUser?.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف کاربر</AlertDialogTitle>
                        <AlertDialogDescription>
                          آیا از حذف کاربر "{user.fullName}" اطمینان دارید؟ این عمل قابل بازگشت نیست.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UserManagement;
