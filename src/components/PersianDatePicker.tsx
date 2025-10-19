import React from 'react';
import DatePicker from 'react-modern-calendar-datepicker';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import { Label } from '@/components/ui/label';

interface PersianDatePickerProps {
  label?: string;
  value: { year: number; month: number; day: number } | null;
  onChange: (date: { year: number; month: number; day: number } | null) => void;
}

export const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <DatePicker
        value={value}
        onChange={onChange}
        locale="fa"
        colorPrimary="hsl(var(--primary))"
        colorPrimaryLight="hsl(var(--primary) / 0.2)"
        calendarClassName="custom-calendar"
        inputClassName="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        inputPlaceholder="انتخاب تاریخ"
      />
    </div>
  );
};