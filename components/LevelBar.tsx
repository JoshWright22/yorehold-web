"use client";

// The level filter as one bar with two handles. The range shows while a handle is dragged and the
// search runs when it is let go, so dragging does not load a page for every step.

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LevelBar({ lowest, highest, min, max }: { lowest: number; highest: number; min: number; max: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const [range, setRange] = useState({ min, max });
  const [shown, setShown] = useState({ min, max });

  // A new address (Back, or another filter) moves the handles to match it.
  if (shown.min !== min || shown.max !== max) {
    setShown({ min, max });
    setRange({ min, max });
  }

  function commit() {
    if (range.min === min && range.max === max) return;
    const params = new URLSearchParams(query.toString());
    params.delete("cursor");
    if (range.min > lowest) params.set("min", String(range.min));
    else params.delete("min");
    if (range.max < highest) params.set("max", String(range.max));
    else params.delete("max");
    const built = params.toString();
    router.push(built ? pathname + "?" + built : pathname, { scroll: false });
  }

  const span = highest - lowest;
  const left = ((range.min - lowest) / span) * 100;
  const right = ((range.max - lowest) / span) * 100;
  const label = range.min === lowest && range.max === highest ? "Any level" : range.min === range.max ? "Level " + range.min : "Levels " + range.min + " to " + range.max;

  return (
    <div className="level-bar">
      <div className="level-track" style={{ "--from": left + "%", "--to": right + "%" } as React.CSSProperties}>
        <input
          type="range"
          aria-label="Lowest level"
          // When both handles meet at the top end, the low one must be the one on top or it could
          // never be dragged back down.
          style={{ zIndex: range.min > (lowest + highest) / 2 ? 2 : 1 }}
          min={lowest}
          max={highest}
          value={range.min}
          onChange={(event) => setRange({ min: Math.min(Number(event.target.value), range.max), max: range.max })}
          onPointerUp={commit}
          onKeyUp={commit}
        />
        <input
          type="range"
          aria-label="Highest level"
          min={lowest}
          max={highest}
          value={range.max}
          onChange={(event) => setRange({ min: range.min, max: Math.max(Number(event.target.value), range.min) })}
          onPointerUp={commit}
          onKeyUp={commit}
        />
      </div>
      <span className="level-label num">{label}</span>
    </div>
  );
}
