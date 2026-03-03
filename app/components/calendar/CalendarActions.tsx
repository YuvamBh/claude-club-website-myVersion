'use client';

import React from 'react';
import { getCalendarSubscriptionUrl } from '@/lib/calendar/google';

interface CalendarActionsProps {
  calendarId: string;
  selectedDate?: Date | null;
}

export default function CalendarActions({ calendarId }: CalendarActionsProps) {
  const subscriptionUrl = getCalendarSubscriptionUrl(calendarId);

  return (
    <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--theme-card-border)' }}>
      <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--theme-text-accent)', opacity: 0.5 }}>
        CBC Calendar
      </p>
      <a
        href={subscriptionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 hover:opacity-70"
        style={{ color: 'var(--theme-text-accent)' }}
        data-umami-event="Calendar - Subscribe"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Subscribe
      </a>
    </div>
  );
}
