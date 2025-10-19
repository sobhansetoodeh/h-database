import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Edit, Plus, User, Clock } from 'lucide-react';
import { formatPersianDateTime } from '@/lib/persian-date';
import { toPersianNumber } from '@/lib/persian-utils';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

const IncidentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [updateText, setUpdateText] = useState('');
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const incident = id ? db.getIncidentById(id) : null;

  if (!incident) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">اتفاق یافت نشد</p>
          <Button onClick={() => navigate('/incidents')} className="mt-4">
            بازگشت به لیست
          </Button>
        </Card>
      </div>
    );
  }

  const handleAddUpdate = () => {
    if (!updateText.trim() || !user) return;

    db.addIncidentUpdate(incident.id, updateText, user.id);
    
    toast({
      title: 'بروزرسانی ثبت شد',
      description: 'بروزرسانی با موفقیت به اتفاق اضافه شد',
    });

    setUpdateText('');
    setShowUpdateDialog(false);
    window.location.reload();
  };

  const getImportanceBadge = (importance: string) => {
    const colors = {
      'بحرانی': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      'زیاد': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      'متوسط': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      'کم': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    };
    return colors[importance as keyof typeof colors] || colors['کم'];
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'فعال': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'در حال بررسی': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      'بسته': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[status as keyof typeof colors] || colors['فعال'];
  };

  const involvedPeople = incident.involvedPersons
    .map(id => db.getPersonById(id))
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/incidents')}>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{incident.title}</h1>
            <p className="text-muted-foreground">
              ثبت شده در {formatPersianDateTime(incident.createdAt)}
            </p>
          </div>
        </div>
        <Link to={`/incidents/${incident.id}/edit`}>
          <Button variant="outline" className="gap-2">
            <Edit className="w-4 h-4" />
            <span>ویرایش</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getImportanceBadge(incident.importance)}>
                اهمیت: {incident.importance}
              </Badge>
              <Badge className={getStatusBadge(incident.status)}>
                {incident.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg">تاریخ</h3>
              <p className="text-muted-foreground">
                {formatPersianDateTime(incident.date)}
              </p>
            </div>

            {incident.followUp && (
              <div className="space-y-2">
                <h3 className="font-bold text-lg">پیرو</h3>
                <p className="text-muted-foreground">{incident.followUp}</p>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <h3 className="font-bold text-lg">شرح اتفاق</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {incident.description}
              </p>
            </div>

            {incident.recordsAndNotes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">سوابق و ملاحظات</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {incident.recordsAndNotes}
                  </p>
                </div>
              </>
            )}

            {incident.securityOpinion && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">نظریه حراستی</h3>
                  <div className="p-4 rounded-lg bg-primary/5 border-r-4 border-primary">
                    <p className="whitespace-pre-wrap">
                      {incident.securityOpinion}
                    </p>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Updates Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                بروزرسانی‌ها ({toPersianNumber(incident.updates.length)})
              </h3>
              <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    <span>افزودن بروزرسانی</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>افزودن بروزرسانی جدید</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Textarea
                      value={updateText}
                      onChange={(e) => setUpdateText(e.target.value)}
                      placeholder="متن بروزرسانی را وارد کنید..."
                      rows={6}
                    />
                    <div className="flex gap-3">
                      <Button onClick={handleAddUpdate} className="flex-1">
                        ثبت بروزرسانی
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowUpdateDialog(false);
                          setUpdateText('');
                        }}
                      >
                        انصراف
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {incident.updates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  هیچ بروزرسانی ثبت نشده است
                </p>
              ) : (
                incident.updates.map((update) => {
                  const updateUser = db.getHerasatUsers().find(u => u.id === update.createdBy);
                  return (
                    <div key={update.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">
                              {updateUser?.fullName || 'کاربر ناشناس'}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatPersianDateTime(update.createdAt)}</span>
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{update.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">افراد درگیر</h3>
            <div className="space-y-3">
              {involvedPeople.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  هیچ شخصی مرتبط نیست
                </p>
              ) : (
                involvedPeople.map((person) => (
                  <Link key={person!.id} to={`/${person!.type === 'student' ? 'students' : person!.type === 'staff' ? 'staff' : 'faculty'}/${person!.id}`}>
                    <div className="p-3 rounded-lg border hover:bg-accent transition-colors">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{person!.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {person!.type === 'student' ? 'دانشجو' : person!.type === 'staff' ? 'کارمند' : 'استاد'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">اطلاعات سیستمی</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">ثبت شده در</p>
                <p className="font-medium">{formatPersianDateTime(incident.createdAt)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">آخرین بروزرسانی</p>
                <p className="font-medium">{formatPersianDateTime(incident.updatedAt)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;