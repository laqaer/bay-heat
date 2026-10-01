"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGarage } from "@/lib/garage-store";

// Mobile-only sticky CTA (BLUEPRINT.md §4.5). Once a garage is saved, it becomes the
// "Your garage: 13.0k BTU/h · B" bar instead of the generic "Size my garage" pitch.
//
// It slides out of the way while a buy plate ([data-buy-group]) is on screen: at 390x844 the bar covers the bottom
// 57 px, which is exactly where a first-screen plate's button sits on several pages, and a covered buy button is
// the click this whole page exists to earn. Plates can appear after load (the planner's report renders client-side),
// so the plate list is rescanned when the DOM changes.
function usePlateInView(): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const visible = new Set<Element>();
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setInView(visible.size > 0);
    });
    const scan = () => {
      for (const el of document.querySelectorAll("[data-buy-group]")) {
        if (!seen.has(el)) {
          seen.add(el);
          io.observe(el);
        }
      }
    };
    scan();
    let frame = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
      io.disconnect();
    };
  }, []);
  return inView;
}

export function StickyCta() {
  const garage = useGarage();
  const hidden = usePlateInView();
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-(--color-line) bg-(--color-ember) transition-transform duration-200 lg:hidden ${hidden ? "translate-y-full" : ""}`}
      aria-hidden={hidden || undefined}
      data-sticky-cta
    >
      <Link
        href={garage ? `/garage-heater-calculator?g=${garage.code}` : "/garage-heater-calculator"}
        tabIndex={hidden ? -1 : undefined}
        className="flex h-14 items-center justify-center px-4 text-[15px] font-medium text-black"
      >
        {garage ? (
          <>
            Your garage: {(garage.qSize / 1000).toFixed(1)}k BTU/h · {garage.grade} &rarr;
          </>
        ) : (
          "Size my garage — 60 s"
        )}
      </Link>
    </div>
  );
}
