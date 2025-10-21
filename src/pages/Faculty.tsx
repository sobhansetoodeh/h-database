import React, { useState } from 'react';
import { sqliteDb } from '@/lib/sqlite-db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toPersianNumber } from '@/lib/persian-utils';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Faculty: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const faculty = sqliteDb.getPeople().filter(p => p.type === 'faculty-heyat' || p.type === 'faculty-haghtadris');

  const filteredFaculty = faculty.filter(person =>
    person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.nationalId?.includes(searchTerm) ||
    person.employeeNumber?.includes(searchTerm)
  );

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این استاد اطمینان دارید؟')) {
      if (sqliteDb.deletePerson(id)) {
        toast({
          title: 'حذف موفق',
          description: 'استاد با موفقیت حذف شد',
        });
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">اساتید</h1>
          <p className="text-muted-foreground">
            مجموع: {toPersianNumber(faculty.length)} استاد
          </p>
        </div>
        <Link to="/faculty/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            <span>افزودن استاد</span>
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="جستجو بر اساس نام، کد ملی یا شماره پرسنلی..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredFaculty.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {searchTerm ? 'نتیجه‌ای یافت نشد' : 'هیچ استادی ثبت نشده است'}
          </Card>
        ) : (
          filteredFaculty.map((person) => (
            <Card key={person.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{person.fullName}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        person.type === 'faculty-heyat'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      }`}
                    >
                      {person.type === 'faculty-heyat' ? 'هیئت علمی' : 'حق التدریس'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                    {person.employeeNumber && (
                      <div>
                        <span className="font-medium">شماره پرسنلی: </span>
                        <span>{toPersianNumber(person.employeeNumber)}</span>
                      </div>
                    )}
                    {person.nationalId && (
                      <div>
                        <span className="font-medium">کد ملی: </span>
                        <span>{toPersianNumber(person.nationalId)}</span>
                      </div>
                    )}
                    {person.rank && (
                      <div>
                        <span className="font-medium">مرتبه: </span>
                        <span>{person.rank}</span>
                      </div>
                    )}
                    {person.specialization && (
                      <div>
                        <span className="font-medium">تخصص: </span>
                        <span>{person.specialization}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/faculty/${person.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to={`/faculty/${person.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(person.id)}
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

export default Faculty;