import { useEffect } from 'react';
let locks = 0;
let previousOverflow = '';
let previousOverscroll = '';
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    if (locks++ === 0) {
      previousOverflow = document.body.style.overflow;
      previousOverscroll = document.body.style.overscrollBehavior;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
    }
    return () => {
      if (--locks === 0) {
        document.body.style.overflow = previousOverflow;
        document.body.style.overscrollBehavior = previousOverscroll;
      }
    };
  }, [active]);
}
