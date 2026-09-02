import React, { useState, useEffect, useRef } from 'react';
import { useOutlet, useLocation, useNavigationType } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

// Tab routes rendered inside AppShell that should stay mounted (keep-alive)
// when switching bottom-nav tabs, preserving transient component state.
const MOBILE_TAB_PATHS = ['/', '/chart', '/scanner', '/alerts'];

// Direction-aware slide: forward (PUSH) = right-to-left, back (POP) = left-to-right.
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%' }),
};

export default function KeepAliveOutlet() {
  const isMobile = useIsMobile();
  const outlet = useOutlet();
  const location = useLocation();
  const navType = useNavigationType();
  const [cache, setCache] = useState({});
  const outletRef = useRef(outlet);
  outletRef.current = outlet;
  const lastTabRef = useRef(location.pathname);

  const isTab = MOBILE_TAB_PATHS.includes(location.pathname);
  const direction = navType === 'POP' ? -1 : 1;
  const tabReset = location.state?._tabReset;

  // Remember the most recent tab so it stays visible underneath a sliding sub-view overlay.
  useEffect(() => {
    if (isTab) lastTabRef.current = location.pathname;
  }, [isTab, location.pathname]);

  // Cache tab outlets on first visit (skip on double-tap reset — the key change remounts instead).
  useEffect(() => {
    if (!isMobile || !isTab) return;
    if (tabReset) return;
    const path = location.pathname;
    setCache(prev => (prev[path] ? prev : { ...prev, [path]: outletRef.current }));
  }, [isMobile, isTab, location.pathname, tabReset]);

  // Desktop: preserve the existing fade transition exactly.
  if (!isMobile) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname + (tabReset || '')}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Mobile: keep-alive tabs (display toggled) + sliding sub-view overlay.
  const currentCached = cache[location.pathname];

  return (
    <div className="relative">
      {/* Cached tab routes — stay mounted to preserve state; only the active/last is shown. */}
      {Object.entries(cache).map(([path, el]) => {
        const isActive = path === location.pathname;
        const show = isActive || (!isTab && path === lastTabRef.current);
        const resetKey = isActive && tabReset ? `-${tabReset}` : '';
        return (
          <div key={`${path}${resetKey}`} style={{ display: show ? 'block' : 'none' }}>
            {el}
          </div>
        );
      })}

      {/* First visit to a tab (not yet cached): render the fresh outlet with a stable key
          so the subsequent cache update does not remount it. */}
      {isTab && !currentCached && (
        <div key={location.pathname} style={{ display: 'block' }}>
          {outlet}
        </div>
      )}

      {/* Sub-views slide in as an overlay (right-to-left forward, left-to-right back). */}
      <AnimatePresence custom={direction}>
        {!isTab && (
          <motion.div
            key={location.pathname}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="absolute inset-0 z-10 bg-background"
          >
            {outlet}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}