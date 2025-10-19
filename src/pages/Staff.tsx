import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toPersianNumber } from '@/lib/persian-utils';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Staff: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const staff = db.getPeople().filter(p => p.type === 'staff');

  const filteredStaff = staff.filter(person =>
    person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.nationalId?.includes(searchTerm) ||
    person.employeeNumber?.includes(searchTerm)
  );

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این کارمند اطمینان دارید؟')) {
      if (db.deletePerson(id)) {
        toast({
          title: 'حذف موفق',
          description: 'کارمند با موفقیت حذف شد',
        });
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">کارکنان</h1>
          <p className="text-muted-foreground">
            مجموع: {toPersianNumber(staff.length)} کارمند
          </p>
        </div>
        <Link to="/staff/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            <span>افزودن کارمند</span>
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
        {filteredStaff.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {searchTerm ? 'نتیجه‌ای یافت نشد' : 'هیچ کارمندی ثبت نشده است'}
          </Card>
        ) : (
          filteredStaff.map((person) => (
            <Card key={person.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{person.fullName}</h3>
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
                    {person.department && (
                      <div>
                        <span className="font-medium">بخش: </span>
                        <span>{person.department}</span>
                      </div>
                    )}
                    {person.position && (
                      <div>
                        <span className="font-medium">سمت: </span>
                        <span>{person.position}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/staff/${person.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to={`/staff/${person.id}/edit`}>
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

export default Staff;