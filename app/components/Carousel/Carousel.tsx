"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Carousel.module.scss";

interface CarouselProps {
  items: string[];
  interval?: number; // ms between slides
}

export default function Carousel({ items, interval = 3000 }: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (items.length <= 1) return;
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, interval);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, items.length, interval]);

  if (!items.length) return null;

  return (
    <div className={styles.carousel}>
      <div className={styles.track} style={{ transform: `translateX(-${current * 100}%)` }}>
        {items.map((item, idx) => (
          <div className={styles.slide} key={idx}>
            <p className={styles.slideText}>{item}</p>
          </div>
        ))}
      </div>
      {/* Optionally, add dots or arrows here */}
    </div>
  );
} 