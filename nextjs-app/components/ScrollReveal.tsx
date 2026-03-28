"use client";

import { useEffect } from "react";

export function ScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const els = document.querySelectorAll("[data-reveal]");
    els.forEach((el, i) => {
      (el as HTMLElement).style.setProperty("--reveal-delay", `${i * 100}ms`);
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return null;
}
