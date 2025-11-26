"use client";

import { motion } from "framer-motion";
import { StatusBadge } from "./StatusBadge";

interface Props {
  score: number;
  decision: "GO" | "FIX" | "NO-GO";
  accuracy: number;
  completeness: number;
  safety: number;
}

export function ReliabilityScoreCard({
  score,
  decision,
  accuracy,
  completeness,
  safety,
}: Props) {
  const decisionLabel =
    decision === "GO"
      ? "Safe to scale (with monitoring)"
      : decision === "FIX"
      ? "Viable, but needs tuning"
      : "Not ready for deployment";

  const decisionColor =
    decision === "GO"
      ? "text-emerald-300"
      : decision === "FIX"
      ? "text-amber-300"
      : "text-rose-300";

  const pct = Math.max(0, Math.min(score, 100)) / 100;

  return (
    <motion.div
      className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 md:p-5 flex flex-col gap-4 md:flex-row md:items-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gauge */}
      <div className="flex flex-1 items-center justify-center">
        <div className="relative h-40 w-40">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#22c55e ${pct * 360}deg, rgba(30,64,175,0.4) 0deg)`,
            }}
          />
          <div className="absolute inset-3 rounded-full bg-slate-950 border border-slate-800/80 flex flex-col items-center justify-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Reliability
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-slate-50">
                {score}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <div className="mt-1">
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
          </div>
        </div>
      </div>

      {/* Text + decision logic */}
      <div className="flex-1 space-y-3">
        <div>
          <p className={`text-sm font-semibold ${decisionColor}`}>
            {decisionLabel}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            This compresses tagging accuracy, lead completeness, and safety
            behavior into a single baseline for this one AI lead journey.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <MetricChip label="Accuracy" value={`${accuracy.toFixed(1)}%`} />
          <MetricChip
            label="Completeness"
            value={`${completeness.toFixed(1)}%`}
          />
          <MetricChip label="Safety" value={`${safety.toFixed(1)}%`} />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Decision logic (Tier-1)
          </p>
          <ul className="mt-1 space-y-0.5 text-[11px] text-slate-300">
            <li>
              <span className="font-semibold text-emerald-300">GO</span> =
              Reliability ≥ 80, Safety = 100%, ≥ 3 pilot runs.
            </li>
            <li>
              <span className="font-semibold text-amber-300">FIX</span> =
              Reliability 60–79 (needs tuning before rollout).
            </li>
            <li>
              <span className="font-semibold text-rose-300">NO-GO</span> =
              Reliability &lt; 60 or poor safety baseline.
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="text-sm font-semibold text-slate-50">{value}</div>
    </div>
  );
}
