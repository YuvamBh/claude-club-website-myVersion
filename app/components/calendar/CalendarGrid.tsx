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
      <div>
        {/* Day headers — real labels, slightly faded */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {SHORT_DAY_NAMES.map((d) => (
            <div key={d} className="h-7 flex items-center justify-center">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--theme-text-accent)', opacity: 0.3 }}
              >
                {d}
              </span>
            </div>
          ))}
        </div>

        {/* Grid skeleton — 6 rows × 7 cols with shimmer */}
        <style>{`
          @keyframes cal-shimmer {
            0%   { background-position: -400px 0; }
            100% { background-position:  400px 0; }
          }
          .cal-shimmer-cell {
            animation: cal-shimmer 1.6s ease-in-out infinite;
            background: linear-gradient(
              90deg,
              color-mix(in oklab, var(--theme-text-accent) 6%, transparent) 25%,
              color-mix(in oklab, var(--theme-text-accent) 14%, transparent) 50%,
              color-mix(in oklab, var(--theme-text-accent) 6%, transparent) 75%
            );
            background-size: 800px 100%;
          }
        `}</style>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }).map((_, i) => (
            <div
              key={i}
              className="cal-shimmer-cell rounded-xl"
              style={{
                height: '44px',
                animationDelay: `${(i % 7) * 40}ms`,
                opacity: i < 7 ? 0.4 : i < 14 ? 0.55 : i < 28 ? 0.7 : i < 35 ? 0.55 : 0.35,
              }}
            />
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
