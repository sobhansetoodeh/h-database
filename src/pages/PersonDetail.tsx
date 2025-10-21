import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { sqliteDb } from '@/lib/sqlite-db';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit, Trash2, User, FileText, Image as ImageIcon } from 'lucide-react';
import { toPersianNumber } from '@/lib/persian-utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const PersonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const person = id ? db.getPersonById(id) : null;

  if (!person) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">فرد مورد نظر یافت نشد</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            بازگشت
          </Button>
        </Card>
      </div>
    );
  }

  const getTypeLabel = () => {
    switch (person.type) {
      case 'student': return 'دانشجو';
      case 'staff': return 'کارمند';
      case 'faculty-heyat': return 'هیئت علمی';
      case 'faculty-haghtadris': return 'حق التدریس';
      default: return person.type;
    }
  };

  const getEditPath = () => {
    if (person.type === 'student') return `/students/${id}/edit`;
    if (person.type === 'staff') return `/staff/${id}/edit`;
    return `/faculty/${id}/edit`;
  };

  const getListPath = () => {
    if (person.type === 'student') return '/students';
    if (person.type === 'staff') return '/staff';
    return '/faculty';
  };

  const handleDelete = () => {
    if (confirm('آیا از حذف این فرد اطمینان دارید؟')) {
      if (db.deletePerson(id!)) {
        toast({
          title: 'حذف موفق',
          description: 'فرد با موفقیت حذف شد',
        });
        navigate(getListPath());
      }
    }
  };

  const profilePic = person.attachments?.find(a => {
    const attachment = db.getAttachmentById(a);
    return attachment?.fileType.startsWith('image/') && attachment?.fileName.includes('profile');
  });

  const profileImage = profilePic ? db.getAttachmentById(profilePic) : null;

  const documents = person.attachments?.filter(a => {
    const attachment = db.getAttachmentById(a);
    return attachment && attachment.id !== profilePic;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(getListPath())}>
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </Button>
        <div className="flex gap-2">
          <Link to={getEditPath()}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              ویرایش
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            حذف
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {profileImage ? (
              <img
                src={profileImage.fileData}
                alt={person.fullName}
                className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                <User className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{person.fullName}</h1>
              <Badge variant="secondary" className="mt-2">{getTypeLabel()}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {person.nationalId && (
                <div>
                  <span className="font-medium text-muted-foreground">کد ملی: </span>
                  <span>{toPersianNumber(person.nationalId)}</span>
                </div>
              )}
              {person.passportNo && (
                <div>
                  <span className="font-medium text-muted-foreground">شماره پاسپورت: </span>
                  <span>{toPersianNumber(person.passportNo)}</span>
                </div>
              )}
              {person.studentNumber && (
                <div>
                  <span className="font-medium text-muted-foreground">شماره دانشجویی: </span>
                  <span>{toPersianNumber(person.studentNumber)}</span>
                </div>
              )}
              {person.employeeNumber && (
                <div>
                  <span className="font-medium text-muted-foreground">شماره پرسنلی: </span>
                  <span>{toPersianNumber(person.employeeNumber)}</span>
                </div>
              )}
              {person.birthDate && (
                <div>
                  <span className="font-medium text-muted-foreground">تاریخ تولد: </span>
                  <span>{person.birthDate}</span>
                </div>
              )}
              {person.gender && (
                <div>
                  <span className="font-medium text-muted-foreground">جنسیت: </span>
                  <span>{person.gender}</span>
                </div>
              )}
              {person.phone && (
                <div>
                  <span className="font-medium text-muted-foreground">تلفن: </span>
                  <span dir="ltr" className="inline-block">{toPersianNumber(person.phone)}</span>
                </div>
              )}
              {person.email && (
                <div>
                  <span className="font-medium text-muted-foreground">ایمیل: </span>
                  <span dir="ltr" className="inline-block">{person.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Academic/Employment Info */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">
          {person.type === 'student' ? 'اطلاعات تحصیلی' : 'اطلاعات شغلی'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {person.faculty && (
            <div>
              <span className="font-medium text-muted-foreground">دانشکده: </span>
              <span>{person.faculty}</span>
            </div>
          )}
          {person.program && (
            <div>
              <span className="font-medium text-muted-foreground">رشته: </span>
              <span>{person.program}</span>
            </div>
          )}
          {person.enrollmentYear && (
            <div>
              <span className="font-medium text-muted-foreground">سال ورود: </span>
              <span>{toPersianNumber(person.enrollmentYear)}</span>
            </div>
          )}
          {person.department && (
            <div>
              <span className="font-medium text-muted-foreground">بخش: </span>
              <span>{person.department}</span>
            </div>
          )}
          {person.position && (
            <div>
              <span className="font-medium text-muted-foreground">سمت: </span>
              <span>{person.position}</span>
            </div>
          )}
          {person.rank && (
            <div>
              <span className="font-medium text-muted-foreground">مرتبه: </span>
              <span>{person.rank}</span>
            </div>
          )}
          {person.specialization && (
            <div>
              <span className="font-medium text-muted-foreground">تخصص: </span>
              <span>{person.specialization}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Personal Info */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">اطلاعات شخصی</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {person.religion && (
            <div>
              <span className="font-medium text-muted-foreground">دین: </span>
              <span>{person.religion}</span>
            </div>
          )}
          {person.sect && (
            <div>
              <span className="font-medium text-muted-foreground">مذهب: </span>
              <span>{person.sect}</span>
            </div>
          )}
          {person.city && (
            <div>
              <span className="font-medium text-muted-foreground">شهر: </span>
              <span>{person.city}</span>
            </div>
          )}
          {person.country && (
            <div>
              <span className="font-medium text-muted-foreground">کشور: </span>
              <span>{person.country}</span>
            </div>
          )}
          {person.address && (
            <div className="col-span-full">
              <span className="font-medium text-muted-foreground">آدرس: </span>
              <span>{person.address}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Notes */}
      {person.notes && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">یادداشت‌ها</h2>
          <p className="text-sm whitespace-pre-wrap">{person.notes}</p>
        </Card>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">مدارک و پیوست‌ها</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map((attachmentId) => {
              const attachment = db.getAttachmentById(attachmentId);
              if (!attachment) return null;
              
              const isImage = attachment.fileType.startsWith('image/');
              
              return (
                <div key={attachment.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {isImage ? (
                    <img 
                      src={attachment.fileData} 
                      alt={attachment.fileName}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-background rounded">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(attachment.uploadedAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <a
                    href={attachment.fileData}
                    download={attachment.fileName}
                    className="text-primary hover:underline text-sm"
                  >
                    دانلود
                  </a>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PersonDetail;
