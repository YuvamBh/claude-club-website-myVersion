'use client';

import React from 'react';
import { CalendarMonth, CalendarEvent } from '@/types/calendar';
import CalendarDay from './CalendarDay';

const SHORT_DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface CalendarGridProps {
  calendarMonth: CalendarMonth;
  onSelectDate: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  isLoading?: boolean;
}

export default function CalendarGrid({
  calendarMonth,
  onSelectDate,
  onEventClick,
  isLoading = false,
}: CalendarGridProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        {/* Day headers skeleton */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {SHORT_DAY_NAMES.map((d) => (
            <div key={d} className="h-6 flex items-center justify-center">
              <div className="h-3 w-5 bg-[var(--theme-text-primary)]/15 rounded" />
            </div>
          ))}
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="h-11 bg-[var(--theme-text-primary)]/8 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {SHORT_DAY_NAMES.map((day) => (
          <div key={day} className="h-7 flex items-center justify-center">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--theme-text-accent)', opacity: 0.6 }}
            >
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {calendarMonth.days.map((day, index) => (
          <CalendarDay
            key={`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}-${index}`}
            day={day}
            onSelect={() => onSelectDate(day.date)}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}
