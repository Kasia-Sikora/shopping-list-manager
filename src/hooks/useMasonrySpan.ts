import { useEffect, type RefObject } from 'react';

const ROW = 8;   // must match auto-rows-[8px]
const GAP = 16;  // desired vertical gap (matches gap-x-4 = 1rem)

export function useMasonrySpan(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const setSpan = () => {
      const height = el.getBoundingClientRect().height;
      el.style.gridRowEnd = `span ${Math.ceil((height + GAP) / ROW)}`;
    };
    setSpan();
    const ro = new ResizeObserver(setSpan);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
}