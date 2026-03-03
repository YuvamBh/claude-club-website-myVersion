'use client';

import React from 'react';
import { CalendarDay as CalendarDayType, CalendarEvent } from '@/types/calendar';
import { motion } from 'framer-motion';

interface CalendarDayProps {
  day: CalendarDayType;
  onSelect: () => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export default function CalendarDay({ day, onSelect, onEventClick }: CalendarDayProps) {
  const dayNumber = day.date.getDate();
  const isCurrentMonth = day.isCurrentMonth;
  const isToday = day.isToday;
  const hasEvents = day.hasEvents;
  const eventCount = day.events?.length ?? 0;

  const handleDayClick = () => {
    if (hasEvents && eventCount > 0 && onEventClick) {
      onEventClick(day.events[0]);
    } else {
      onSelect();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: isCurrentMonth ? 1.05 : 1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        relative min-h-[44px] rounded-xl cursor-pointer
        flex flex-col items-center justify-start pt-1.5 pb-1 px-1
        transition-all duration-200
        ${!isCurrentMonth ? 'opacity-25' : ''}
        ${isToday
          ? 'ring-2 ring-[var(--theme-text-accent)] ring-offset-0'
          : hasEvents
          ? 'hover:ring-1 hover:ring-[var(--theme-text-accent)]/40'
          : 'hover:bg-[var(--theme-text-accent)]/8'}
        ${hasEvents ? 'bg-[var(--theme-gradient-accent)]' : ''}
      `}
      onClick={handleDayClick}
      role="button"
      tabIndex={isCurrentMonth ? 0 : -1}
      aria-label={`${day.date.toLocaleDateString()}${hasEvents ? `, ${eventCount} events` : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDayClick(); }
      }}
    >
      {/* Day number */}
      <span
        className={`text-xs font-semibold tabular-nums leading-none
          ${isToday ? 'text-[var(--theme-text-accent)]' : 'text-[var(--theme-text-primary)]'}
        `}
      >
        {dayNumber}
      </span>

      {/* Event dots */}
      {hasEvents && isCurrentMonth && (
        <div className="flex gap-[3px] mt-1.5">
          {Array.from({ length: Math.min(eventCount, 3) }).map((_, i) => (
            <span
              key={i}
              className="w-[5px] h-[5px] rounded-full"
              style={{ background: 'var(--theme-text-accent)' }}
            />
          ))}
          {eventCount > 3 && (
            <span className="text-[8px] font-bold leading-[5px]" style={{ color: 'var(--theme-text-accent)' }}>
              +{eventCount - 3}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
