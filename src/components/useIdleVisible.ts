import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Visible after mouse movement, hidden after timeoutMs idle unless held (e.g. hovered or a dialog is open).
 * Hides the page cursor while hidden.
 */
export function useIdleVisible(timeoutMs: number, held: boolean) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<number | null>(null);
  const keep = held || hovered;

  const restartTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setVisible(false), timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    const onMove = () => {
      setVisible(true);
      restartTimer();
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [restartTimer]);

  // while kept, no timer; once released, hide after the usual idle time
  useEffect(() => {
    if (keep) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setVisible(true);
    } else {
      restartTimer();
    }
  }, [keep, restartTimer]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const shown = visible || keep;
  useEffect(() => {
    document.body.style.cursor = shown ? '' : 'none';
  }, [shown]);

  return {
    visible: shown,
    hoverProps: { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) },
  };
}
