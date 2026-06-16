import { useEffect, useRef } from 'react';

export function useLongPress(callback, delay = 500) {
  const timerRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  function cancel() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function start(e) {
    if (e.target.closest('.category-pill__add')) return;
    cancel();
    timerRef.current = setTimeout(() => callbackRef.current(), delay);
  }

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
  };
}
