import React, { useState } from 'react';
import { sqliteDb } from '@/lib/sqlite-db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toPersianNumber } from '@/lib/persian-utils';
import { formatPersianDateTime } from '@/lib/persian-date';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const Incidents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const incidents = sqliteDb.getIncidents();

  const filteredIncidents = incidents.filter(incident =>
    incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این اتفاق اطمینان دارید؟')) {
      if (sqliteDb.deleteIncident(id)) {
        toast({
          title: 'حذف موفق',
          description: 'اتفاق با موفقیت حذف شد',
        });
        window.location.reload();
      }
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'بحرانی':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'زیاد':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'متوسط':
        return <Info className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
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

  const stats = {
    total: incidents.length,
    active: incidents.filter(i => i.status === 'فعال').length,
    critical: incidents.filter(i => i.importance === 'بحرانی').length,
    underReview: incidents.filter(i => i.status === 'در حال بررسی').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">اتفاقات</h1>
          <p className="text-muted-foreground">
            مدیریت و پیگیری اتفاقات امنیتی
          </p>
        </div>
        <Link to="/incidents/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            <span>ثبت اتفاق جدید</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">کل اتفاقات</p>
              <p className="text-2xl font-bold">{toPersianNumber(stats.total)}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <AlertCircle className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">فعال</p>
              <p className="text-2xl font-bold text-green-600">{toPersianNumber(stats.active)}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <Info className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">بحرانی</p>
              <p className="text-2xl font-bold text-red-600">{toPersianNumber(stats.critical)}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">در حال بررسی</p>
              <p className="text-2xl font-bold text-yellow-600">{toPersianNumber(stats.underReview)}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="جستجو بر اساس عنوان یا توضیحات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredIncidents.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {searchTerm ? 'نتیجه‌ای یافت نشد' : 'هیچ اتفاقی ثبت نشده است'}
          </Card>
        ) : (
          filteredIncidents.map((incident) => (
            <Card key={incident.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getImportanceIcon(incident.importance)}
                    <h3 className="font-bold text-lg">{incident.title}</h3>
                    <Badge className={getImportanceBadge(incident.importance)}>
                      {incident.importance}
                    </Badge>
                    <Badge className={getStatusBadge(incident.status)}>
                      {incident.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {incident.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div>
                      تاریخ: {formatPersianDateTime(incident.date)}
                    </div>
                    <div>
                      افراد درگیر: {toPersianNumber(incident.involvedPersons.length)} نفر
                    </div>
                    {incident.updates.length > 0 && (
                      <div>
                        بروزرسانی‌ها: {toPersianNumber(incident.updates.length)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/incidents/${incident.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to={`/incidents/${incident.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(incident.id)}
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

export default Incidents;