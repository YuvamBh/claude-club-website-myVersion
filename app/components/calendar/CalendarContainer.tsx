'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarState, CalendarEvent } from '@/types/calendar';
import { createCalendarMonth } from '@/lib/calendar/utils';
import { getEventsForMonth } from '@/lib/calendar/google';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import CalendarActions from './CalendarActions';
import EventModal from './EventModal';

interface CalendarContainerProps {
  className?: string;
}

function formatUpcomingDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatUpcomingTime(event: CalendarEvent) {
  if (!event.start.dateTime) return 'All day';
  const d = new Date(event.start.dateTime);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function CalendarContainer({ className = '' }: CalendarContainerProps) {
  const [calendarState, setCalendarState] = useState<CalendarState>({
    currentDate: new Date(),
    selectedDate: null,
    view: 'month',
    isLoading: true,
    error: null,
  });

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calendarMonth = useMemo(() =>
    createCalendarMonth(
      calendarState.currentDate.getFullYear(),
      calendarState.currentDate.getMonth(),
      calendarState.selectedDate,
      events
    ),
    [calendarState.currentDate, calendarState.selectedDate, events]
  );

  // Upcoming events: next 4 events after today
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(ev => {
        const start = ev.start.dateTime || ev.start.date;
        return start && new Date(start) >= now;
      })
      .sort((a, b) => {
        const aTime = new Date(a.start.dateTime || a.start.date || '').getTime();
        const bTime = new Date(b.start.dateTime || b.start.date || '').getTime();
        return aTime - bTime;
      })
      .slice(0, 4);
  }, [events]);

  useEffect(() => {
    const loadEvents = async () => {
      setCalendarState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const monthEvents = await getEventsForMonth(
          calendarState.currentDate.getFullYear(),
          calendarState.currentDate.getMonth()
        );
        setEvents(monthEvents);
      } catch (error) {
        setCalendarState(prev => ({
          ...prev,
          error: `Failed to load events: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }));
      } finally {
        setCalendarState(prev => ({ ...prev, isLoading: false }));
      }
    };
    loadEvents();
  }, [calendarState.currentDate]);

  const handlePreviousMonth = () => {
    const d = new Date(calendarState.currentDate);
    d.setMonth(d.getMonth() - 1);
    setCalendarState(prev => ({ ...prev, currentDate: d }));
  };
  const handleNextMonth = () => {
    const d = new Date(calendarState.currentDate);
    d.setMonth(d.getMonth() + 1);
    setCalendarState(prev => ({ ...prev, currentDate: d }));
  };
  const handleGoToToday = () => {
    const today = new Date();
    setCalendarState(prev => ({ ...prev, currentDate: today, selectedDate: today }));
  };
  const handleSelectDate = (date: Date) => {
    setCalendarState(prev => ({ ...prev, selectedDate: date }));
  };
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <>
      {/* Outer wrapper: two-column layout on larger screens */}
      <div className={`grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5 ${className}`}>

        {/* ── Calendar card ── */}
        <div
          className="rounded-2xl p-5 sm:p-6"
          style={{
            background: 'var(--theme-card-bg)',
            border: '1px solid var(--theme-card-border)',
          }}
        >
          <CalendarHeader
            currentDate={calendarState.currentDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            onGoToToday={handleGoToToday}
            isLoading={calendarState.isLoading}
          />

          <CalendarGrid
            calendarMonth={calendarMonth}
            onSelectDate={handleSelectDate}
            onEventClick={handleEventClick}
            isLoading={calendarState.isLoading}
          />

          <CalendarActions
            calendarId={process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID || 'asu.edu_primary'}
            selectedDate={calendarState.selectedDate}
          />

          {calendarState.error && (
            <div
              className="mt-3 px-4 py-3 rounded-xl text-xs"
              style={{
                background: 'rgba(204,120,92,0.1)',
                border: '1px solid rgba(204,120,92,0.3)',
                color: 'var(--theme-text-accent)',
              }}
            >
              {calendarState.error}
            </div>
          )}
        </div>

        {/* ── Upcoming events sidebar ── */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{
            background: 'var(--theme-card-bg)',
            border: '1px solid var(--theme-card-border)',
          }}
        >
          {/* Section label */}
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--theme-text-accent)' }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.2em] font-semibold"
              style={{ color: 'var(--theme-text-accent)', opacity: 0.7 }}
            >
              Upcoming
            </span>
          </div>

          {/* Event list */}
          {calendarState.isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                  {/* Date chip shimmer */}
                  <div
                    className="cal-shimmer-cell w-10 h-10 rounded-lg shrink-0"
                    style={{ animationDelay: `${i * 80}ms`, opacity: 0.5 + i * 0.05 }}
                  />
                  {/* Text lines shimmer */}
                  <div className="flex-1 space-y-2 pt-1">
                    <div
                      className="cal-shimmer-cell h-2.5 rounded-full"
                      style={{ width: `${70 - i * 5}%`, animationDelay: `${i * 80 + 40}ms`, opacity: 0.6 }}
                    />
                    <div
                      className="cal-shimmer-cell h-2 rounded-full"
                      style={{ width: `${45 - i * 3}%`, animationDelay: `${i * 80 + 80}ms`, opacity: 0.4 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {upcomingEvents.map((ev, i) => {
                const dateText = formatUpcomingDate(ev.start.dateTime || ev.start.date || '');
                const timeText = formatUpcomingTime(ev);
                return (
                  <motion.button
                    key={ev.id || i}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: i * 0.06, duration: 0.22 }}
                    onClick={() => handleEventClick(ev)}
                    className="w-full flex items-start gap-3 text-left group rounded-xl p-2 -mx-2 transition-all duration-200 hover:bg-[var(--theme-gradient-accent)]"
                  >
                    {/* Date chip */}
                    <div
                      className="w-10 h-10 rounded-lg flex-shrink-0 flex flex-col items-center justify-center"
                      style={{
                        background: 'var(--theme-gradient-accent)',
                        border: '1px solid var(--theme-card-border)',
                      }}
                    >
                      <span className="text-[10px] font-bold leading-none" style={{ color: 'var(--theme-text-accent)' }}>
                        {dateText.split(' ')[0].toUpperCase()}
                      </span>
                      <span className="text-base font-bold leading-none" style={{ color: 'var(--theme-text-primary)' }}>
                        {dateText.split(' ')[1]}
                      </span>
                    </div>

                    {/* Event info */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p
                        className="text-xs font-semibold leading-snug truncate group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--theme-text-primary)' }}
                      >
                        {ev.summary}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--theme-text-accent)', opacity: 0.7 }}>
                        {timeText}
                        {ev.location && ` · ${ev.location.split(',')[0]}`}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--theme-gradient-accent)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--theme-text-accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs text-center" style={{ color: 'var(--theme-text-primary)', opacity: 0.4 }}>
                No upcoming events
              </p>
            </div>
          )}

          {/* Powered-by Claude watermark */}
          <div className="mt-auto pt-3 flex items-center gap-1.5" style={{ borderTop: '1px solid var(--theme-card-border)' }}>
            <svg viewBox="0 0 10 10" className="w-3.5 h-3.5 flex-shrink-0" fill="var(--theme-text-accent)" style={{ opacity: 0.5 }}>
              <circle cx="5" cy="5" r="4.5" stroke="none" />
              <path d="M3.5 5 L5 3 L6.5 5 L5 7 Z" fill="var(--theme-card-bg)" />
            </svg>
            <span
              className="text-[9px] uppercase tracking-[0.18em] font-semibold"
              style={{ color: 'var(--theme-text-accent)', opacity: 0.4 }}
            >
              ASU CBC Events
            </span>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
