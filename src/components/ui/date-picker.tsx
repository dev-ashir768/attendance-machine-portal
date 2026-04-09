'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  label?: string;
}

export function DatePicker({ date, setDate, label }: DatePickerProps) {
  return (
    <div className="grid gap-2">
      {label && <span className="text-sm font-semibold text-slate-700">{label}</span>}
      <Popover>
        <PopoverTrigger>
          <Button
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal h-11 px-4 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all rounded-lg',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-xl shadow-2xl border-slate-200" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            className="rounded-xl"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
