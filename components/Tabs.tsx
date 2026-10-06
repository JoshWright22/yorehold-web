"use client";

// Tabs over panels the server already rendered; switching never reloads the page.

import { useState, type ReactNode } from "react";

export default function Tabs({
  tabs,
  label,
  initial,
}: {
  tabs: { id: string; label: string; count?: number; panel: ReactNode }[];
  label: string;
  // The tab open at first, when an address asks for one.
  initial?: string;
}) {
  const [current, setCurrent] = useState(tabs.some((tab) => tab.id === initial) ? initial! : (tabs[0]?.id ?? ""));
  return (
    <div className="tabs">
      <div className="tab-bar" role="tablist" aria-label={label}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={"tab-" + tab.id}
            aria-selected={tab.id === current}
            aria-controls={"panel-" + tab.id}
            className={tab.id === current ? "tab active" : "tab"}
            onClick={() => setCurrent(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined ? <span className="tab-count num">{tab.count}</span> : null}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" id={"panel-" + tab.id} aria-labelledby={"tab-" + tab.id} hidden={tab.id !== current}>
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
