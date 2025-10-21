import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { sqliteDb } from '@/lib/sqlite-db';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit, Trash2, User, FileText } from 'lucide-react';
import { toPersianNumber } from '@/lib/persian-utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const caseData = id ? sqliteDb.getCaseById(id) : null;

  if (!caseData) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">پرونده مورد نظر یافت نشد</p>
          <Button className="mt-4" onClick={() => navigate('/cases')}>
            بازگشت
          </Button>
        </Card>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('آیا از حذف این پرونده اطمینان دارید؟')) {
      sqliteDb.deleteCase(id!);
      toast({
        title: 'حذف موفق',
        description: 'پرونده با موفقیت حذف شد',
      });
      navigate('/cases');
    }
  };

  const relatedPeople = caseData.personIds.map(personId => sqliteDb.getPersonById(personId)).filter(Boolean);
  const attachments = caseData.attachmentIds?.map(attId => sqliteDb.getAttachmentById(attId)).filter(Boolean) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'باز': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'بسته': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/cases')}>
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </Button>
        <div className="flex gap-2">
          <Link to={`/cases/${id}/edit`}>
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
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{caseData.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                ایجاد شده: {new Date(caseData.createdAt).toLocaleDateString('fa-IR')}
              </p>
            </div>
            <Badge className={getStatusColor(caseData.status)}>{caseData.status}</Badge>
          </div>

          {caseData.summary && (
            <div>
              <h3 className="font-semibold mb-2">خلاصه:</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{caseData.summary}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Related People */}
      {relatedPeople.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">افراد مرتبط ({toPersianNumber(relatedPeople.length)})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relatedPeople.map((person) => {
              if (!person) return null;
              return (
                <Link key={person.id} to={`/${person.type === 'student' ? 'students' : person.type === 'staff' ? 'staff' : 'faculty'}/${person.id}`}>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{person.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {person.type === 'student' ? 'دانشجو' : person.type === 'staff' ? 'کارمند' : 'استاد'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">پیوست‌ها</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attachments.map((attachment) => {
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

export default CaseDetail;
