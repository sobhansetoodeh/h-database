import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Users, Briefcase, GraduationCap, FileText } from 'lucide-react';
import { sqliteDb } from '@/lib/sqlite-db';
import { toPersianNumber } from '@/lib/persian-utils';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const people = sqliteDb.getPeople();
  const cases = sqliteDb.getCases();

  const stats = {
    students: people.filter(p => p.type === 'student').length,
    staff: people.filter(p => p.type === 'staff').length,
    faculty: people.filter(p => p.type.startsWith('faculty')).length,
    cases: cases.length,
    openCases: cases.filter(c => c.status === 'باز').length,
  };

  const statCards = [
    {
      title: 'دانشجویان',
      value: stats.students,
      icon: Users,
      color: 'bg-blue-500',
      link: '/students',
    },
    {
      title: 'کارکنان',
      value: stats.staff,
      icon: Briefcase,
      color: 'bg-green-500',
      link: '/staff',
    },
    {
      title: 'اساتید',
      value: stats.faculty,
      icon: GraduationCap,
      color: 'bg-purple-500',
      link: '/faculty',
    },
    {
      title: 'پرونده‌ها',
      value: stats.cases,
      icon: FileText,
      color: 'bg-orange-500',
      link: '/cases',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">داشبورد</h1>
        <p className="text-muted-foreground">خلاصه اطلاعات سیستم</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} to={stat.link}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">
                      {toPersianNumber(stat.value)}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">پرونده‌های اخیر</h2>
          {cases.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              هیچ پرونده‌ای ثبت نشده است
            </p>
          ) : (
            <div className="space-y-3">
              {cases.slice(0, 5).map((caseItem) => (
                <Link key={caseItem.id} to={`/cases/${caseItem.id}`}>
                  <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{caseItem.title}</span>
                      <Badge className={getStatusColor(caseItem.status)}>
                        {caseItem.status}
                      </span>
                    </div>
                    {caseItem.summary && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {caseItem.summary}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">آمار پرونده‌ها</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950">
              <span>پرونده‌های باز</span>
              <span className="font-bold text-green-600">
                {toPersianNumber(stats.openCases)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
              <span>پرونده‌های بسته</span>
              <span className="font-bold">
                {toPersianNumber(cases.filter(c => c.status === 'بسته').length)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <span>در حال بررسی</span>
              <span className="font-bold text-yellow-600">
                {toPersianNumber(cases.filter(c => c.status === 'در حال بررسی').length)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;