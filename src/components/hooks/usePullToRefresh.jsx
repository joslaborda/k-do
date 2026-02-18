import { useEffect, useRef, useState } from 'react';

export function usePullToRefresh(onRefresh) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    const container = document.documentElement;
    const PULL_THRESHOLD = 80;

    const handleTouchStart = (e) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!pulling.current || container.scrollTop > 0) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY.current);

      if (distance > 0) {
        setPullDistance(distance);
        setIsPulling(distance > PULL_THRESHOLD);
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > PULL_THRESHOLD && onRefresh) {
        await onRefresh();
      }
      pulling.current = false;
      setPullDistance(0);
      setIsPulling(false);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, pullDistance]);

  return { isPulling, pullDistance };
}