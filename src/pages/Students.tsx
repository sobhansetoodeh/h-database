import React, { useState } from 'react';
import { db, Person } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toPersianNumber } from '@/lib/persian-utils';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const students = db.getPeople().filter(p => p.type === 'student');

  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nationalId?.includes(searchTerm) ||
    student.studentNumber?.includes(searchTerm)
  );

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این دانشجو اطمینان دارید؟')) {
      if (db.deletePerson(id)) {
        toast({
          title: 'حذف موفق',
          description: 'دانشجو با موفقیت حذف شد',
        });
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">دانشجویان</h1>
          <p className="text-muted-foreground">
            مجموع: {toPersianNumber(students.length)} دانشجو
          </p>
        </div>
        <Link to="/students/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            <span>افزودن دانشجو</span>
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="جستجو بر اساس نام، کد ملی یا شماره دانشجویی..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredStudents.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {searchTerm ? 'نتیجه‌ای یافت نشد' : 'هیچ دانشجویی ثبت نشده است'}
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{student.fullName}</h3>
                    {student.isForeign && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        دانشجوی خارجی
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                    {student.studentNumber && (
                      <div>
                        <span className="font-medium">شماره دانشجویی: </span>
                        <span>{toPersianNumber(student.studentNumber)}</span>
                      </div>
                    )}
                    {student.nationalId && (
                      <div>
                        <span className="font-medium">کد ملی: </span>
                        <span>{toPersianNumber(student.nationalId)}</span>
                      </div>
                    )}
                    {student.faculty && (
                      <div>
                        <span className="font-medium">دانشکده: </span>
                        <span>{student.faculty}</span>
                      </div>
                    )}
                    {student.program && (
                      <div>
                        <span className="font-medium">رشته: </span>
                        <span>{student.program}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/students/${student.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to={`/students/${student.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(student.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Students;