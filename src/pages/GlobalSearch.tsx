import React, { useState, useMemo } from 'react';
import { db } from '@/lib/db';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, User, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toPersianNumber } from '@/lib/persian-utils';

const GlobalSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return { people: [], cases: [], total: 0 };
    }

    const term = searchTerm.toLowerCase().trim();
    const people = db.getPeople();
    const cases = db.getCases();

    const matchedPeople = people.filter(person => {
      const searchableFields = [
        person.fullName,
        person.nationalId,
        person.passportNo,
        person.studentNumber,
        person.employeeNumber,
        person.phone,
        person.email,
        person.address,
        person.city,
        person.country,
        person.faculty,
        person.program,
        person.department,
        person.position,
        person.rank,
        person.specialization,
        person.notes,
      ].filter(Boolean).map(f => f?.toLowerCase());

      return searchableFields.some(field => field?.includes(term));
    });

    const matchedCases = cases.filter(caseItem => {
      const searchableFields = [
        caseItem.title,
        caseItem.summary,
      ].filter(Boolean).map(f => f?.toLowerCase());

      return searchableFields.some(field => field?.includes(term));
    });

    return {
      people: matchedPeople,
      cases: matchedCases,
      total: matchedPeople.length + matchedCases.length,
    };
  }, [searchTerm]);

  const getPersonTypeLabel = (type: string) => {
    switch (type) {
      case 'student': return 'دانشجو';
      case 'staff': return 'کارمند';
      case 'faculty-heyat': return 'هیئت علمی';
      case 'faculty-haghtadris': return 'حق التدریس';
      default: return '';
    }
  };

  const getPersonRoute = (person: any) => {
    if (person.type === 'student') return `/students/${person.id}`;
    if (person.type === 'staff') return `/staff/${person.id}`;
    if (person.type.startsWith('faculty')) return `/faculty/${person.id}`;
    return '#';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">جستجوی جامع</h1>
        <p className="text-muted-foreground">جستجو در تمام اطلاعات سیستم</p>
      </div>

      <Card className="p-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6" />
          <Input
            placeholder="جستجو بر اساس نام، کد ملی، شماره پاسپورت، آدرس، شماره تماس و..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-14 h-14 text-lg"
            autoFocus
          />
        </div>

        {searchTerm && (
          <div className="mt-4 text-sm text-muted-foreground">
            {toPersianNumber(searchResults.total)} نتیجه یافت شد
          </div>
        )}
      </Card>

      {searchTerm && searchResults.total > 0 && (
        <div className="space-y-6">
          {/* People Results */}
          {searchResults.people.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">افراد ({toPersianNumber(searchResults.people.length)})</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {searchResults.people.map((person) => (
                  <Link key={person.id} to={getPersonRoute(person)}>
                    <Card className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-muted-foreground" />
                            <h3 className="font-bold text-lg">{person.fullName}</h3>
                            <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                              {getPersonTypeLabel(person.type)}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                            {person.nationalId && (
                              <div>کد ملی: {toPersianNumber(person.nationalId)}</div>
                            )}
                            {person.passportNo && (
                              <div>پاسپورت: {person.passportNo}</div>
                            )}
                            {person.studentNumber && (
                              <div>شماره دانشجویی: {toPersianNumber(person.studentNumber)}</div>
                            )}
                            {person.employeeNumber && (
                              <div>شماره پرسنلی: {toPersianNumber(person.employeeNumber)}</div>
                            )}
                            {person.phone && (
                              <div>تلفن: {toPersianNumber(person.phone)}</div>
                            )}
                            {person.email && (
                              <div>ایمیل: {person.email}</div>
                            )}
                            {person.faculty && (
                              <div>دانشکده: {person.faculty}</div>
                            )}
                            {person.department && (
                              <div>بخش: {person.department}</div>
                            )}
                            {person.city && (
                              <div>شهر: {person.city}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Cases Results */}
          {searchResults.cases.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">پرونده‌ها ({toPersianNumber(searchResults.cases.length)})</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {searchResults.cases.map((caseItem) => (
                  <Link key={caseItem.id} to={`/cases/${caseItem.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <h3 className="font-bold text-lg">{caseItem.title}</h3>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                caseItem.status === 'باز'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  : caseItem.status === 'بسته'
                                  ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              }`}
                            >
                              {caseItem.status}
                            </span>
                          </div>
                          {caseItem.summary && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {caseItem.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {searchTerm && searchResults.total === 0 && (
        <Card className="p-12 text-center">
          <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold mb-2">نتیجه‌ای یافت نشد</h3>
          <p className="text-muted-foreground">
            لطفاً عبارت جستجوی دیگری را امتحان کنید
          </p>
        </Card>
      )}

      {!searchTerm && (
        <Card className="p-12 text-center">
          <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold mb-2">جستجوی پیشرفته</h3>
          <p className="text-muted-foreground">
            برای جستجو در تمام اطلاعات سیستم، کلمه کلیدی خود را وارد کنید
          </p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-accent/50">
              <p className="font-medium">نام افراد</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/50">
              <p className="font-medium">کد ملی و پاسپورت</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/50">
              <p className="font-medium">آدرس و شهر</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/50">
              <p className="font-medium">شماره تماس</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;