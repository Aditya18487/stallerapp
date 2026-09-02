import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const pullDistRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => { pullDistRef.current = pullDistance; }, [pullDistance]);
  useEffect(() => { refreshingRef.current = refreshing; }, [refreshing]);

  useEffect(() => {
    const getScrollTop = () => {
      const mainEl = document.querySelector('main');
      return mainEl ? mainEl.scrollTop : window.scrollY;
    };

    const handleTouchStart = (e) => {
      if (refreshingRef.current) return;
      if (getScrollTop() <= 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      } else {
        isPulling.current = false;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling.current || refreshingRef.current) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0 && diff < 120) {
        setPullDistance(diff * 0.4);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;
      if (pullDistRef.current > 45) {
        setRefreshing(true);
        setPullDistance(40);
        try {
          await onRefresh?.();
        } catch (e) { /* ignore */ }
        setRefreshing(false);
      }
      setPullDistance(0);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh]);

  return (
    <>
      {(pullDistance > 0 || refreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{ height: `${Math.max(pullDistance, refreshing ? 36 : 0)}px` }}
        >
          <RefreshCw
            className={`w-5 h-5 text-primary ${refreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 3}deg)` }}
          />
        </div>
      )}
      {children}
    </>
  );
}