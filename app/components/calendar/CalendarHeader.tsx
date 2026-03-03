'use client';

import React, { useState } from 'react';
import { getMonthName } from '@/lib/calendar/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  isLoading?: boolean;
}

export default function CalendarHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onGoToToday,
  isLoading = false,
}: CalendarHeaderProps) {
  const [monthKey, setMonthKey] = useState(0);

  const monthName = getMonthName(currentDate.getMonth());
  const year = currentDate.getFullYear();
  const isCurrentMonth =
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  const handlePrev = () => {
    setMonthKey(k => k - 1);
    onPreviousMonth();
  };
  const handleNext = () => {
    setMonthKey(k => k + 1);
    onNextMonth();
  };

  return (
    <div className="flex items-center justify-between mb-5">
      {/*Month/Year*/}
      <div className="flex items-baseline gap-2 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={monthKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="text-xl font-bold tracking-tight"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            {monthName}
          </motion.span>
        </AnimatePresence>
        <span
          className="text-base font-medium"
          style={{ color: 'var(--theme-text-accent)', opacity: 0.7 }}
        >
          {year}
        </span>
      </div>

      {/*Controls*/}
      <div className="flex items-center gap-1.5">
        {/*Today pill*/}
        {!isCurrentMonth && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={onGoToToday}
            disabled={isLoading}
            className="px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 disabled:opacity-40"
            style={{
              background: 'var(--theme-gradient-accent)',
              color: 'var(--theme-text-accent)',
              border: '1px solid var(--theme-text-accent)',
            }}
          >
            Today
          </motion.button>
        )}

        {/*Prev*/}
        <button
          onClick={handlePrev}
          disabled={isLoading}
          aria-label="Previous month"
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40 hover:scale-110"
          style={{
            background: 'var(--theme-gradient-accent)',
            color: 'var(--theme-text-accent)',
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/*Next*/}
        <button
          onClick={handleNext}
          disabled={isLoading}
          aria-label="Next month"
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40 hover:scale-110"
          style={{
            background: 'var(--theme-gradient-accent)',
            color: 'var(--theme-text-accent)',
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
