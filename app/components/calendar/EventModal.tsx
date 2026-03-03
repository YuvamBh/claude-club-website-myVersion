'use client';

import React, { useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';

interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCalendar?: () => void;
}

export default function EventModal({ event, isOpen, onClose, onAddToCalendar }: EventModalProps) {
  const sanitizeHTML = (html: string): string => {
    const normalizedHTML = html
      .replace(/<wbr\s*\/>/gi, '<wbr>')
      .replace(/<br\s*\/>/gi, '<br>');
    return DOMPurify.sanitize(normalizedHTML, {
      ALLOWED_TAGS: ['a', 'p', 'br', 'wbr', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
    });
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, isOpen]);

  const formatEventTime = (event: CalendarEvent) => {
    const start = event.start.dateTime || event.start.date;
    const end = event.end.dateTime || event.end.date;
    if (!start) return 'Time not specified';
    const startDate = new Date(start);
    const endDate = new Date(end || start);
    const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (event.start.dateTime && event.end.dateTime) {
      const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${dateStr} · ${startTime} – ${endTime}`;
    }
    return dateStr;
  };

  return (
    <AnimatePresence>
      {isOpen && event && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative max-w-md w-full rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'var(--theme-card-bg)',
              border: '1px solid var(--theme-card-border)',
            }}
          >
            {/* Accent top bar */}
            <div
              className="h-1 w-full"
              style={{ background: 'linear-gradient(90deg, var(--theme-text-accent), color-mix(in oklab, var(--theme-text-accent) 55%, white))' }}
            />

            {/* Header */}
            <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid var(--theme-card-border)' }}>
              <div className="flex items-start justify-between gap-4">
                {/* Icon + title */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'var(--theme-gradient-accent)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--theme-text-accent)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-bold text-base leading-snug" style={{ color: 'var(--theme-text-primary)' }}>
                      {event.summary}
                    </h2>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--theme-text-accent)' }}>
                      {formatEventTime(event)}
                    </p>
                  </div>
                </div>
                {/* Close */}
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 hover:scale-110"
                  style={{ background: 'var(--theme-gradient-accent)', color: 'var(--theme-text-primary)' }}
                  aria-label="Close"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 max-h-[55vh] overflow-y-auto">
              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-2.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--theme-text-accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm" style={{ color: 'var(--theme-text-primary)', opacity: 0.75 }}>
                    {event.location}
                  </span>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div
                  className="text-sm leading-relaxed prose prose-sm max-w-none"
                  style={{ color: 'var(--theme-text-primary)', opacity: 0.8 }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(event.description) }}
                />
              )}

              {/* Link */}
              {event.htmlLink && (
                <a
                  href={event.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: 'var(--theme-text-accent)' }}
                >
                  <span>Open in Google Calendar</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            {/* Footer */}
            {onAddToCalendar && (
              <div className="px-6 pb-5 pt-3" style={{ borderTop: '1px solid var(--theme-card-border)' }}>
                <button
                  onClick={onAddToCalendar}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:scale-[1.01]"
                  style={{
                    background: 'var(--theme-button-bg)',
                    color: 'var(--theme-button-text)',
                  }}
                >
                  Subscribe to Calendar
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
