"use client";

import { motion } from "framer-motion";
import { StatusBadge } from "../../components/StatusBadge";
import { useSprintMetrics } from "../../components/SprintContext";

const PROS = [
  "Tagging accuracy is above the 85% target across the sampled pilot runs.",
  "The system consistently captures rich lead context (budget, urgency, authority).",
  "Safety suite fully passed on all tested red-team prompts in this demo (when safety is 100%).",
];

const CONS = [
  "Metrics are based on a limited number of sampled pilot runs in this MVP.",
  "False-HOT rate, while low, still means some weak leads might be escalated.",
  "Real-world performance will depend on client-specific training data and prompts.",
];

export default function ReportPage() {
  const m = useSprintMetrics();

  const handleCopy = () => {
    const text = `
AI Lead Proof Sprint – Pilot Report

Client: Demo Co. (B2B)
Journey: Inbound demo requests

Decision: ${m.decision}
Reliability: ${Math.round(m.reliability)}/100

Metrics
- Accuracy: ${m.accuracy.toFixed(1)}%
- Completeness: ${m.completeness.toFixed(1)}%
- Safety: ${m.safety.toFixed(1)}%
- False-HOT rate: ${m.falseHotRate.toFixed(1)}%
- Pilot runs sampled: ${m.pilotRunsCount}
- Safety tests in suite: ${m.safetyTotal}

Strengths:
${PROS.map((p) => `- ${p}`).join("\n")}

Risks / caveats:
${CONS.map((c) => `- ${c}`).join("\n")}

Recommendation:
Based on this sprint, recommended decision: ${m.decision}.
`.trim();

    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch((err) => {
        console.error("Failed to copy", err);
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Pilot proof report
          </h1>
          <p className="text-sm text-slate-400">
            One-page summary of the Tier-1 AI Lead Proof Sprint: what we
            tested, how it performed, and whether this journey looks safe to
            scale.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-200 hover:border-emerald-400"
          >
            Copy report as text
          </button>
          <StatusBadge
            label={m.decision}
            variant={
              m.decision === "GO"
                ? "success"
                : m.decision === "FIX"
                ? "warning"
                : "danger"
            }
          />
          <div className="text-xs text-slate-500 text-right">
            <div>Client: Demo Co. (B2B)</div>
            <div>Journey: Inbound demo requests</div>
          </div>
        </div>
      </header>

      {/* Top metrics */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr),minmax(0,1.8fr)]">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 md:p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Reliability score
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-semibold text-slate-50">
                {Math.round(m.reliability)}
              </span>
              <span className="text-sm text-slate-400">/ 100</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Weighted blend of accuracy (45%), completeness (35%), and safety
              (20%) for this ONE AI lead journey.
            </p>
          </div>
          <p className="mt-3 text-xs text-slate-300">
            Interpretation: With the current configuration and test coverage,
            this journey looks{" "}
            <span className="font-semibold text-emerald-300">
              {m.decision === "GO"
                ? "production-ready with monitoring"
                : m.decision === "FIX"
                ? "viable but needs tuning"
                : "not ready for deployment"}
            </span>{" "}
            rather than purely experimental.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 md:p-5 grid gap-3 md:grid-cols-2">
          <MetricBlock
            label="Accuracy"
            value={`${m.accuracy.toFixed(1)}%`}
            description="Share of pilot runs where the Hot / Warm / Cold tag matched the expected outcome."
          />
          <MetricBlock
            label="Completeness"
            value={`${m.completeness.toFixed(1)}%`}
            description="Average share of required lead fields captured (company, role, budget, urgency, etc.)."
          />
          <MetricBlock
            label="Safety"
            value={`${m.safety.toFixed(1)}%`}
            description="Pass rate on the fixed red-team suite (leakage, injection, abuse, safety edge-cases)."
          />
          <MetricBlock
            label="False-HOT rate"
            value={`${m.falseHotRate.toFixed(1)}%`}
            description="How often a weak lead was wrongly escalated as “Hot” in the sampled runs."
          />
        </div>
      </div>

      {/* Narrative sections */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 md:p-5 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            What we tested
          </h2>
          <p className="text-sm text-slate-300">
            This Tier-1 sprint ran a pilot on{" "}
            <span className="font-semibold">
              ONE inbound lead journey (demo requests)
            </span>{" "}
            using a small set of realistic scenarios (SaaS, agency, non-buyer).
            For each run, the AI had to:
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
            <li>Ingest a free-text lead description.</li>
            <li>
              Decide whether the lead is <b>Hot / Warm / Cold</b>.
            </li>
            <li>Surface key fields for sales (company, role, budget, urgency).</li>
            <li>Respect safety rules around privacy and abuse.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 md:p-5 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Pros and risks
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold text-emerald-300">
                Strengths
              </h3>
              <ul className="mt-1 list-disc pl-4 text-xs text-slate-300 space-y-1">
                {PROS.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-amber-300">
                Risks / caveats
              </h3>
              <ul className="mt-1 list-disc pl-4 text-xs text-slate-300 space-y-1">
                {CONS.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Final decision */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Go / Fix / No-Go recommendation
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Based on this sprint, we would recommend a{" "}
            <span
              className={
                m.decision === "GO"
                  ? "font-semibold text-emerald-300"
                  : m.decision === "FIX"
                  ? "font-semibold text-amber-300"
                  : "font-semibold text-rose-300"
              }
            >
              {m.decision}
            </span>{" "}
            decision for this journey.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            In a real client engagement, these numbers would be computed from
            their actual pilot conversations and safety logs, not only this
            MVP’s demo logic.
          </p>
        </div>
        <div className="text-xs text-slate-500">
          <div>Pilot runs sampled: {m.pilotRunsCount}</div>
          <div>Safety tests in suite: {m.safetyTotal}</div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricBlock({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="text-lg font-semibold text-slate-50">{value}</div>
      <p className="text-[11px] text-slate-400">{description}</p>
    </div>
  );
}
