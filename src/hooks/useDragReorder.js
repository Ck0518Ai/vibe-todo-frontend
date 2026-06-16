import { useEffect, useRef } from 'react';

function isDragBlocked(target) {
  return !!target.closest('button, a, input, textarea');
}

export function useDragReorder(containerRef, itemSelector, onReorder) {
  const activeRef = useRef(null);
  const onReorderRef = useRef(onReorder);

  useEffect(() => {
    onReorderRef.current = onReorder;
  }, [onReorder]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const clearDropTargets = () => {
      container.querySelectorAll(itemSelector).forEach((el) => {
        el.classList.remove('drag-item--drop-target');
      });
    };

    const finishDrag = () => {
      const active = activeRef.current;
      if (!active) return;
      active.el.classList.remove('drag-item--dragging');
      clearDropTargets();
      if (active.dragging && active.droppedOn) {
        onReorderRef.current(active.id, active.droppedOn);
      }
      activeRef.current = null;
    };

    const onPointerDown = (e) => {
      const el = e.target.closest(itemSelector);
      if (!el || !container.contains(el)) return;
      if (isDragBlocked(e.target) || e.button !== 0) return;
      activeRef.current = {
        id: el.dataset.id,
        el,
        startY: e.clientY,
        dragging: false,
        droppedOn: null,
      };
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      const active = activeRef.current;
      if (!active) return;
      if (!active.dragging && Math.abs(e.clientY - active.startY) < 8) return;
      active.dragging = true;
      active.el.classList.add('drag-item--dragging');
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const targetEl = under?.closest(itemSelector);
      clearDropTargets();
      if (targetEl && targetEl.dataset.id !== active.id) {
        targetEl.classList.add('drag-item--drop-target');
        active.droppedOn = targetEl.dataset.id;
      } else {
        active.droppedOn = null;
      }
    };

    const onPointerEnd = (e) => {
      const active = activeRef.current;
      if (!active) return;
      const el = active.el;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (active.dragging) e.preventDefault();
      finishDrag();
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerEnd);
    container.addEventListener('pointercancel', onPointerEnd);

    return () => {
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerEnd);
      container.removeEventListener('pointercancel', onPointerEnd);
    };
  }, [containerRef, itemSelector]);
}
