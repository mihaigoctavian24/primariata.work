"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  formatFn?: (n: number) => string;
}

function AnimatedCounter({
  target,
  duration = 1200,
  className,
  style,
  formatFn = (n: number) => n.toLocaleString("ro-RO"),
}: AnimatedCounterProps) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.floor(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    },
    [target, duration]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          startTime.current = null;
          rafRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <span ref={elementRef} className={className} style={style}>
      {formatFn(value)}
    </span>
  );
}

export { AnimatedCounter };
export type { AnimatedCounterProps };
