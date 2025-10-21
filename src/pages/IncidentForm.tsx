import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sqliteDb, Person } from '@/lib/sqlite-db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, X, UserPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PersianDatePicker } from '@/components/PersianDatePicker';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';

const IncidentForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    date: null as any,
    importance: '' as 'کم' | 'متوسط' | 'زیاد' | 'بحرانی' | '',
    followUp: '',
    description: '',
    recordsAndNotes: '',
    securityOpinion: '',
    involvedPersons: [] as string[],
    status: 'فعال' as 'فعال' | 'در حال بررسی' | 'بسته',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showPersonSelector, setShowPersonSelector] = useState(false);
  const people = sqliteDb.getPeople();

  useEffect(() => {
    if (isEdit && id) {
      const incident = sqliteDb.getIncidentById(id);
      if (incident) {
        setFormData({
          title: incident.title,
          date: incident.date ? parseDateToCalendar(incident.date) : null,
          importance: incident.importance,
          followUp: incident.followUp || '',
          description: incident.description,
          recordsAndNotes: incident.recordsAndNotes || '',
          securityOpinion: incident.securityOpinion || '',
          involvedPersons: incident.involvedPersons,
          status: incident.status,
        });
      }
    }
  }, [id, isEdit]);

  const parseDateToCalendar = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const persianDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).format(date);
      const parts = persianDate.split('/');
      return { year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2]) };
    } catch {
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const dateStr = formData.date 
      ? new Date(formData.date.year, formData.date.month - 1, formData.date.day).toISOString()
      : new Date().toISOString();

    const incidentData = {
      title: formData.title,
      date: dateStr,
      importance: formData.importance as 'کم' | 'متوسط' | 'زیاد' | 'بحرانی',
      followUp: formData.followUp || undefined,
      description: formData.description,
      recordsAndNotes: formData.recordsAndNotes || undefined,
      securityOpinion: formData.securityOpinion || undefined,
      involvedPersons: formData.involvedPersons,
      status: formData.status,
      createdBy: user.id,
    };

    if (isEdit && id) {
      sqliteDb.updateIncident(id, incidentData);
      toast({
        title: 'ویرایش موفق',
        description: 'اطلاعات اتفاق با موفقیت ویرایش شد',
      });
    } else {
      sqliteDb.addIncident(incidentData);
      toast({
        title: 'ثبت موفق',
        description: 'اتفاق با موفقیت ثبت شد',
      });
    }
    
    navigate('/incidents');
  };

  const addPerson = (personId: string) => {
    if (!formData.involvedPersons.includes(personId)) {
      setFormData({
        ...formData,
        involvedPersons: [...formData.involvedPersons, personId],
      });
    }
    setShowPersonSelector(false);
    setSearchTerm('');
  };

  const removePerson = (personId: string) => {
    setFormData({
      ...formData,
      involvedPersons: formData.involvedPersons.filter(id => id !== personId),
    });
  };

  const getPersonById = (id: string) => {
    return people.find(p => p.id === id);
  };

  const filteredPeople = people.filter(person =>
    person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !formData.involvedPersons.includes(person.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/incidents')}>
          <ArrowRight className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'ویرایش اتفاق' : 'ثبت اتفاق جدید'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Involved Persons */}
          <Card className="p-4 lg:col-span-1 h-fit">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">افراد درگیر</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPersonSelector(!showPersonSelector)}
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>

              {showPersonSelector && (
                <div className="space-y-2">
                  <Input
                    placeholder="جستجوی شخص..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredPeople.slice(0, 10).map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => addPerson(person.id)}
                        className="w-full text-right p-2 rounded hover:bg-accent text-sm"
                      >
                        {person.fullName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                {formData.involvedPersons.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    هیچ شخصی اضافه نشده
                  </p>
                ) : (
                  formData.involvedPersons.map((personId) => {
                    const person = getPersonById(personId);
                    if (!person) return null;
                    return (
                      <div
                        key={personId}
                        className="flex items-center justify-between p-2 rounded bg-accent/50"
                      >
                        <span className="text-sm">{person.fullName}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removePerson(personId)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>

          {/* Main Form */}
          <Card className="p-6 lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">عنوان *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="عنوان اتفاق را وارد کنید"
                />
              </div>

              <div className="space-y-2">
                <PersianDatePicker
                  label="تاریخ *"
                  value={formData.date}
                  onChange={(date) => setFormData({ ...formData, date })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="importance">اهمیت *</Label>
                <Select 
                  value={formData.importance} 
                  onValueChange={(value: any) => setFormData({ ...formData, importance: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="کم">کم</SelectItem>
                    <SelectItem value="متوسط">متوسط</SelectItem>
                    <SelectItem value="زیاد">زیاد</SelectItem>
                    <SelectItem value="بحرانی">بحرانی</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">وضعیت</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="فعال">فعال</SelectItem>
                    <SelectItem value="در حال بررسی">در حال بررسی</SelectItem>
                    <SelectItem value="بسته">بسته</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUp">پیرو</Label>
                <Input
                  id="followUp"
                  value={formData.followUp}
                  onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
                  placeholder="شماره یا کد پیگیری"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">متن *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={6}
                placeholder="شرح کامل اتفاق را وارد کنید"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recordsAndNotes">سوابق و ملاحظات</Label>
              <Textarea
                id="recordsAndNotes"
                value={formData.recordsAndNotes}
                onChange={(e) => setFormData({ ...formData, recordsAndNotes: e.target.value })}
                rows={4}
                placeholder="سوابق مرتبط و نکات قابل توجه"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityOpinion">نظریه حراستی</Label>
              <Textarea
                id="securityOpinion"
                value={formData.securityOpinion}
                onChange={(e) => setFormData({ ...formData, securityOpinion: e.target.value })}
                rows={4}
                placeholder="نظر و تحلیل حراست"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                {isEdit ? 'ذخیره تغییرات' : 'ثبت اتفاق'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/incidents')}>
                انصراف
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default IncidentForm;