"use client";

import { usePathname } from "next/navigation";
import { StatusBadge } from "./StatusBadge";
import { useSprintMetrics } from "./SprintContext";

const pathTitles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Overview",
    subtitle: "Reliability, metrics, and decision for this sprint.",
  },
  "/pilot": {
    title: "Pilot runs",
    subtitle: "Test individual leads and log them into the sprint.",
  },
  "/safety": {
    title: "Safety tests",
    subtitle: "Run red-team prompts and track refusal behavior.",
  },
  "/report": {
    title: "Proof report",
    subtitle: "Export a one-page narrative for stakeholders.",
  },
};

export function TopBar() {
  const pathname = usePathname();
  const { title, subtitle } = pathTitles[pathname] ?? pathTitles["/"];

  const { decision } = useSprintMetrics();

  return (
    <header className="border-b border-slate-900/80 bg-slate-950/90 px-4 py-3 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Tier-1 • AI Lead Proof Sprint
          </div>
          <div className="mt-0.5 flex items-center gap-3">
            <h2 className="text-base font-semibold md:text-lg">{title}</h2>
            <StatusBadge
              label={decision}
              variant={
                decision === "GO"
                  ? "success"
                  : decision === "FIX"
                  ? "warning"
                  : "danger"
              }
            />
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="hidden text-xs text-slate-500 md:block">
          <div>Client: Demo Co. (B2B SaaS)</div>
          <div>Day 3 of 5 • ONE lead journey</div>
        </div>
      </div>
    </header>
  );
}
