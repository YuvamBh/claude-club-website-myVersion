"use client";

import { useState } from "react";
import { motion } from "framer-motion";
const images = [
  "",
  "",
  "",
  "",
];

export const ExpandOnHover = () => {
  const [expandedImage, setExpandedImage] = useState(2);

  return (
    <div className="w-full py-4 relative z-20">
      <div className="relative flex w-full items-stretch gap-2">
        {images.map((src, idx) => {
          const isExpanded = expandedImage === idx + 1;
          return (
            <motion.div
              layout
              key={idx}
              className="relative cursor-pointer overflow-hidden rounded-2xl bg-[var(--theme-card-bg)]"
              initial={false}
              animate={{
                flexGrow: isExpanded ? 5 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 25,
                mass: 1,
              }}
              style={{
                flexShrink: 0,
                flexBasis: 0,
                minWidth: 0,
                height: "24rem",
                border: "1px solid var(--theme-card-border)",
              }}
              onMouseEnter={() => setExpandedImage(idx + 1)}
            >
              {src ? (
                <motion.img
                  layout="position"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  src={src}
                  alt={`Event highlight ${idx + 1}`}
                />
              ) : (
                <div className="absolute inset-0 bg-[var(--theme-card-bg)]/20 flex flex-col items-center justify-center">
                   {/* Empty state overlay similar to past events page fallback */}
                   <div className="absolute inset-0 bg-linear-to-tl from-[var(--theme-bg)]/40 via-[var(--theme-card-bg)]/10 to-[var(--theme-bg)]/10" />
                   <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center border-2 border-[var(--theme-card-border)] bg-[var(--theme-bg)]/50">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--theme-text-accent)]">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                   </div>
                   <p className="font-semibold text-sm" style={{ color: "var(--theme-text-primary)", opacity: 0.5 }}>Event Photo {idx + 1}</p>
                </div>
              )}
              
              <motion.div
                initial={false}
                animate={{ opacity: isExpanded ? 0 : 0.6 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black pointer-events-none"
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
