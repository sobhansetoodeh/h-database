import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sqliteDb, Person } from '@/lib/sqlite-db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PersianDatePicker } from '@/components/PersianDatePicker';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from '@/components/FileUpload';
import { useAuth } from '@/contexts/AuthContext';

const StudentForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEdit = !!id;
  const [files, setFiles] = useState<Array<{ id: string; name: string; data: string; type: string }>>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    passportNo: '',
    birthDate: null as any,
    gender: '' as 'مرد' | 'زن' | '',
    religion: '',
    sect: '',
    address: '',
    city: '',
    country: 'ایران',
    phone: '',
    email: '',
    studentNumber: '',
    isForeign: false,
    faculty: '',
    program: '',
    enrollmentYear: '',
    notes: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      const person = sqliteDb.getPersonById(id);
      if (person) {
        setFormData({
          fullName: person.fullName,
          nationalId: person.nationalId || '',
          passportNo: person.passportNo || '',
          birthDate: person.birthDate ? parseDateToCalendar(person.birthDate) : null,
          gender: person.gender || '',
          religion: person.religion || '',
          sect: person.sect || '',
          address: person.address || '',
          city: person.city || '',
          country: person.country || 'ایران',
          phone: person.phone || '',
          email: person.email || '',
          studentNumber: person.studentNumber || '',
          isForeign: person.isForeign || false,
          faculty: person.faculty || '',
          program: person.program || '',
          enrollmentYear: person.enrollmentYear || '',
          notes: person.notes || '',
        });
      }
    }
  }, [id, isEdit]);

  const parseDateToCalendar = (dateStr: string) => {
    try {
      const parts = dateStr.split('/');
      return { year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2]) };
    } catch {
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const birthDateStr = formData.birthDate 
      ? `${formData.birthDate.year}/${formData.birthDate.month}/${formData.birthDate.day}`
      : undefined;

    const personData = {
      type: 'student' as const,
      fullName: formData.fullName,
      nationalId: formData.nationalId || undefined,
      passportNo: formData.passportNo || undefined,
      birthDate: birthDateStr,
      gender: formData.gender || undefined,
      religion: formData.religion || undefined,
      sect: formData.sect || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      country: formData.country || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      studentNumber: formData.studentNumber || undefined,
      isForeign: formData.isForeign,
      faculty: formData.faculty || undefined,
      program: formData.program || undefined,
      enrollmentYear: formData.enrollmentYear || undefined,
      notes: formData.notes || undefined,
    };

    if (isEdit && id) {
      sqliteDb.updatePerson(id, personData);
      toast({
        title: 'ویرایش موفق',
        description: 'اطلاعات دانشجو با موفقیت ویرایش شد',
      });
    } else {
      sqliteDb.addPerson(personData);
      toast({
        title: 'ثبت موفق',
        description: 'دانشجو با موفقیت ثبت شد',
      });
    }
    
    navigate('/students');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/students')}>
          <ArrowRight className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'ویرایش دانشجو' : 'افزودن دانشجو جدید'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">نام و نام خانوادگی *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentNumber">شماره دانشجویی</Label>
              <Input
                id="studentNumber"
                value={formData.studentNumber}
                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalId">کد ملی</Label>
              <Input
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passportNo">شماره پاسپورت</Label>
              <Input
                id="passportNo"
                value={formData.passportNo}
                onChange={(e) => setFormData({ ...formData, passportNo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <PersianDatePicker
                label="تاریخ تولد"
                value={formData.birthDate}
                onChange={(date) => setFormData({ ...formData, birthDate: date })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">جنسیت</Label>
              <Select value={formData.gender} onValueChange={(value: any) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="مرد">مرد</SelectItem>
                  <SelectItem value="زن">زن</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">شماره تماس</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty">دانشکده</Label>
              <Input
                id="faculty"
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="program">رشته تحصیلی</Label>
              <Input
                id="program"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollmentYear">سال ورود</Label>
              <Input
                id="enrollmentYear"
                value={formData.enrollmentYear}
                onChange={(e) => setFormData({ ...formData, enrollmentYear: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2 space-x-reverse pt-8">
              <Checkbox
                id="isForeign"
                checked={formData.isForeign}
                onCheckedChange={(checked) => setFormData({ ...formData, isForeign: checked as boolean })}
              />
              <Label htmlFor="isForeign" className="cursor-pointer">دانشجوی خارجی</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="religion">دین</Label>
              <Input
                id="religion"
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sect">مذهب</Label>
              <Input
                id="sect"
                value={formData.sect}
                onChange={(e) => setFormData({ ...formData, sect: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">شهر</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">کشور</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">آدرس</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">یادداشت‌ها</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              {isEdit ? 'ذخیره تغییرات' : 'ثبت دانشجو'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/students')}>
              انصراف
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default StudentForm;