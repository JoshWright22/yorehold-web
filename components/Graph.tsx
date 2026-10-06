"use client";

// A small one-series graph: bars or a line over time, with the newest value as the headline and a
// readout of the point under the pointer. The marks are drawn in a stretched SVG so the graph fills
// any width; every word and number is HTML laid over it, so text never stretches with it.

import { useState } from "react";
import type { StatPoint } from "@/lib/server";

const width = 600;
const height = 160;
// Room at the top so the tallest mark never touches the edge.
const headroom = 0.05;

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const step = Math.pow(10, Math.floor(Math.log10(value)));
  for (const factor of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    if (step * factor >= value) return step * factor;
  }
  return step * 10;
}

function count(value: number): string {
  return value.toLocaleString("en-GB");
}

export default function Graph({
  points,
  shape,
  unit,
  pointLabel,
}: {
  points: StatPoint[];
  shape: "bars" | "line";
  // What one point counts, as "published" or "players".
  unit: string;
  // How a point's day is read out, for example "week of".
  pointLabel: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (points.length === 0) return <p className="list-empty">Nothing counted yet.</p>;

  const top = niceMax(Math.max(...points.map((point) => point.value)) * (1 + headroom));
  const last = points[points.length - 1];
  const before = points.length > 1 ? points[points.length - 2] : null;
  const change = before ? last.value - before.value : 0;

  const slot = width / points.length;
  const y = (value: number) => height - (value / top) * height;
  const x = (index: number) => (shape === "bars" ? slot * index + slot / 2 : (index / Math.max(points.length - 1, 1)) * width);
  const shown = hover ?? points.length - 1;

  function pick(event: React.PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const at = ((event.clientX - box.left) / box.width) * width;
    const index = shape === "bars" ? Math.floor(at / slot) : Math.round((at / width) * (points.length - 1));
    setHover(Math.min(points.length - 1, Math.max(0, index)));
  }

  const line = points.map((point, index) => (index === 0 ? "M" : "L") + x(index).toFixed(1) + " " + y(point.value).toFixed(1)).join(" ");

  return (
    <figure className="graph">
      <p className="graph-head">
        <span className="graph-value num">{count(points[shown].value)}</span>
        <span className="graph-unit">
          {unit}, {hover === null ? "latest" : pointLabel + " " + points[shown].day}
        </span>
        {hover === null && before ? (
          <span className="graph-change num">
            {change >= 0 ? "+" : "−"}
            {count(Math.abs(change))} on the one before
          </span>
        ) : null}
      </p>
      <div className="graph-plot" onPointerMove={pick} onPointerLeave={() => setHover(null)}>
        <span className="graph-max num">{count(top)}</span>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={unit + " over time"}>
          <line className="graph-grid" x1="0" x2={width} y1="0" y2="0" />
          <line className="graph-grid" x1="0" x2={width} y1={height / 2} y2={height / 2} />
          <line className="graph-base" x1="0" x2={width} y1={height} y2={height} />
          {shape === "bars" ? (
            points.map((point, index) => (
              <rect
                key={point.day}
                className={index === hover ? "graph-bar on" : "graph-bar"}
                // A 2 px gap between bars, whatever the width.
                x={slot * index + 1}
                width={Math.max(slot - 2, 1)}
                y={y(point.value)}
                height={height - y(point.value)}
              />
            ))
          ) : (
            <path className="graph-line" d={line} />
          )}
          {hover !== null ? <line className="graph-cross" x1={x(hover)} x2={x(hover)} y1="0" y2={height} /> : null}
        </svg>
        {shape === "line" ? (
          <span
            className="graph-dot"
            style={{ left: (x(shown) / width) * 100 + "%", top: (y(points[shown].value) / height) * 100 + "%" }}
          />
        ) : null}
      </div>
      <p className="graph-axis num">
        <span>{points[0].day}</span>
        <span>{last.day}</span>
      </p>
      <table className="sr-only">
        <caption>{unit}</caption>
        <tbody>
          {points.map((point) => (
            <tr key={point.day}>
              <th scope="row">{point.day}</th>
              <td>{point.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
