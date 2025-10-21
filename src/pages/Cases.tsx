import React, { useState } from 'react';
import { sqliteDb } from '@/lib/sqlite-db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toPersianNumber } from '@/lib/persian-utils';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'باز':
      return 'bg-green-500';
    case 'بسته':
      return 'bg-gray-500';
    case 'در حال بررسی':
      return 'bg-yellow-500';
    default:
      return 'bg-blue-500';
  }
};

const Cases: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const cases = sqliteDb.getCases();

  const filteredCases = cases.filter(caseItem =>
    caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این پرونده اطمینان دارید؟')) {
      sqliteDb.deleteCase(id);
      toast({
        title: 'حذف موفق',
        description: 'پرونده با موفقیت حذف شد',
      });
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">پرونده‌ها</h1>
          <p className="text-muted-foreground">
            مجموع: {toPersianNumber(cases.length)} پرونده
          </p>
        </div>
        <Link to="/cases/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            <span>ایجاد پرونده جدید</span>
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="جستجو بر اساس عنوان یا خلاصه..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredCases.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {searchTerm ? 'نتیجه‌ای یافت نشد' : 'هیچ پرونده‌ای ثبت نشده است'}
          </Card>
        ) : (
          filteredCases.map((caseItem) => (
            <Card key={caseItem.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{caseItem.title}</h3>
                    <Badge className={getStatusColor(caseItem.status)}>
                      {caseItem.status}
                    </Badge>
                  </div>
                  {caseItem.summary && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {caseItem.summary}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    افراد مرتبط: {toPersianNumber(caseItem.relatedPersons.length)} نفر
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/cases/${caseItem.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to={`/cases/${caseItem.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(caseItem.id)}
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

export default Cases;