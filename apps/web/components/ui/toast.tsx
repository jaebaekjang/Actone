"use client";

import { useEffect, useState } from "react";

type Listener = (message: string) => void;
let listeners: Listener[] = [];

export function toast(message: string) {
  listeners.forEach((l) => l(message));
}

interface ToastItem {
  id: number;
  text: string;
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener: Listener = (text) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, text }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 2800);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4 md:bottom-8">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border bg-surface-soft px-4 py-2.5 text-sm text-foreground shadow-lg"
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}
