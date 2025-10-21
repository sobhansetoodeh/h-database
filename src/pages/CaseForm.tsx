import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sqliteDb } from '@/lib/sqlite-db';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/FileUpload';
import { X, Plus } from 'lucide-react';

const CaseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    status: 'باز' as 'باز' | 'بسته' | 'در حال بررسی',
    relatedPersons: [] as string[],
  });

  const [files, setFiles] = useState<Array<{ id: string; name: string; data: string; type: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPersonSelector, setShowPersonSelector] = useState(false);

  const allPeople = sqliteDb.getPeople();
  const filteredPeople = allPeople.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nationalId?.includes(searchTerm) ||
    p.studentNumber?.includes(searchTerm) ||
    p.employeeNumber?.includes(searchTerm)
  );

  useEffect(() => {
    if (id) {
      const caseData = sqliteDb.getCaseById(id);
      if (caseData) {
        setFormData({
          title: caseData.title,
          summary: caseData.summary || '',
          status: caseData.status,
          relatedPersons: caseData.relatedPersons,
        });
        
        const attachments = caseData.attachments?.map(attId => sqliteDb.getAttachmentById(attId)).filter(Boolean) || [];
        setFiles(attachments.map(att => ({
          id: att!.id,
          name: att!.fileName,
          data: att!.fileData,
          type: att!.fileType,
        })));
      }
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: 'خطا',
        description: 'لطفاً عنوان پرونده را وارد کنید',
        variant: 'destructive',
      });
      return;
    }

    const attachmentIds = files.map(file => {
      const existingAtt = sqliteDb.getAttachments().find(a => a.id === file.id);
      if (existingAtt) return file.id;
      
      const newAtt = sqliteDb.addAttachment({
        fileName: file.name,
        fileType: file.type,
        fileData: file.data,
      });
      return newAtt.id;
    });

    if (id) {
      sqliteDb.updateCase(id, {
        ...formData,
        attachments: attachmentIds,
      });
      toast({
        title: 'ویرایش موفق',
        description: 'پرونده با موفقیت ویرایش شد',
      });
    } else {
      sqliteDb.addCase({
        ...formData,
        attachments: attachmentIds,
        createdBy: user?.id || 'system',
      });
      toast({
        title: 'ثبت موفق',
        description: 'پرونده جدید با موفقیت ایجاد شد',
      });
    }

    navigate('/cases');
  };

  const addPerson = (personId: string) => {
    if (!formData.relatedPersons.includes(personId)) {
      setFormData(prev => ({
        ...prev,
        relatedPersons: [...prev.relatedPersons, personId],
      }));
    }
    setSearchTerm('');
    setShowPersonSelector(false);
  };

  const removePerson = (personId: string) => {
    setFormData(prev => ({
      ...prev,
      relatedPersons: prev.relatedPersons.filter(id => id !== personId),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{id ? 'ویرایش پرونده' : 'ایجاد پرونده جدید'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <Label htmlFor="title">عنوان پرونده*</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="عنوان پرونده را وارد کنید"
              />
            </div>

            <div>
              <Label htmlFor="status">وضعیت</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="باز">باز</SelectItem>
                  <SelectItem value="در حال بررسی">در حال بررسی</SelectItem>
                  <SelectItem value="بسته">بسته</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="summary">خلاصه</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="خلاصه‌ای از پرونده را بنویسید..."
                rows={6}
              />
            </div>

            <FileUpload
              label="پیوست‌ها"
              multiple
              maxSize={10}
              files={files}
              onFilesChange={setFiles}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="font-bold mb-3">افراد مرتبط</h3>
            
            <div className="space-y-2 mb-3">
              {formData.relatedPersons.map(personId => {
                const person = sqliteDb.getPersonById(personId);
                if (!person) return null;
                return (
                  <div key={personId} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{person.fullName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePerson(personId)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {!showPersonSelector ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowPersonSelector(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                افزودن فرد
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="جستجو..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredPeople.map(person => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => addPerson(person.id)}
                      className="w-full text-right p-2 hover:bg-muted rounded text-sm"
                      disabled={formData.relatedPersons.includes(person.id)}
                    >
                      {person.fullName}
                      <span className="text-xs text-muted-foreground mr-2">
                        ({person.type === 'student' ? 'دانشجو' : person.type === 'staff' ? 'کارمند' : 'استاد'})
                      </span>
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setShowPersonSelector(false);
                    setSearchTerm('');
                  }}
                >
                  بستن
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit">
          {id ? 'ذخیره تغییرات' : 'ایجاد پرونده'}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate('/cases')}>
          انصراف
        </Button>
      </div>
    </form>
  );
};

export default CaseForm;
