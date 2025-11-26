"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReliabilityScoreCard } from "../components/ReliabilityScoreCard";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { useSprint, useSprintMetrics } from "../components/SprintContext";

export default function OverviewPage() {
  const { state } = useSprint();
  const {
    accuracy,
    completeness,
    safety,
    reliability,
    decision,
    falseHotRate,
    pilotRunsCount,
    safetyPassed,
    safetyTotal,
    isSprintComplete,
  } = useSprintMetrics();

  const recentRuns = state.pilotRuns.slice(0, 3);
  const safetyPct =
    safetyTotal > 0 ? Math.round((safetyPassed / safetyTotal) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Page title */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          AI Lead Proof Sprint
        </h1>
        <p className="text-sm text-slate-400">
          Proof, not promises: pilot ONE AI lead journey, measure it, and decide
          if it’s safe to scale.
        </p>
      </header>

      {/* Sprint complete / in-progress banner */}
      {isSprintComplete ? (
        <Link href="/report">
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-50 md:text-sm flex items-center justify-between">
            <span>
              ✅ Sprint complete: {pilotRunsCount} pilot runs & {safetyTotal}{" "}
              safety tests. Reliability {Math.round(reliability)}/100 – click to
              open the proof report.
            </span>
            <span className="text-emerald-300 font-semibold">
              View report →
            </span>
          </div>
        </Link>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400 md:text-sm">
          🔄 Sprint in progress – run at least 3 pilot runs and one full safety
          suite to unlock a complete proof report.
        </div>
      )}

      {/* Top row: Reliability + Metrics */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr),minmax(0,1.6fr)]">
        <ReliabilityScoreCard
          score={Math.round(reliability)}
          decision={decision}
          accuracy={accuracy}
          completeness={completeness}
          safety={safety}
        />

        <motion.div
          className="grid gap-3 md:grid-cols-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <MetricCard
            label="Accuracy"
            value={`${accuracy.toFixed(1)}%`}
            description="Correct Hot / Warm / Cold tags across pilot runs."
          />
          <MetricCard
            label="Completeness"
            value={`${completeness.toFixed(1)}%`}
            description="Useful lead fields captured for sales."
          />
          <MetricCard
            label="Safety"
            value={`${safety.toFixed(1)}%`}
            description="Safety tests passed in the latest suite."
          />
          <MetricCard
            label="False-HOT rate"
            value={`${falseHotRate.toFixed(1)}%`}
            description="How often weak leads are wrongly escalated as Hot."
          />
        </motion.div>
      </div>

      {/* Safety + narrative */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr),minmax(0,1.7fr)]">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Safety baseline
              </h2>
              {safetyTotal > 0 ? (
                <p className="mt-1 text-sm text-slate-200">
                  {safetyPassed}/{safetyTotal} tests passed ({safetyPct}%)
                  on the current safety suite.
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-200">
                  Safety suite not run yet. Use the{" "}
                  <span className="font-semibold">Safety tests</span> tab to
                  simulate a run.
                </p>
              )}
            </div>
            <StatusBadge
              variant={safety === 100 && safetyTotal > 0 ? "success" : "warning"}
              label={
                safetyTotal === 0
                  ? "Not run"
                  : safety === 100
                  ? "Clean"
                  : "Needs review"
              }
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            We run fixed red-team prompts (data leakage, prompt injection,
            self-harm, abuse) against this journey to ensure the AI refuses bad
            requests before you scale it.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 md:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            What this sprint tells you
          </h2>
          {pilotRunsCount === 0 ? (
            <p className="mt-2 text-sm text-slate-300">
              No pilot runs logged yet. Move to{" "}
              <span className="font-semibold">Pilot runs</span> and execute at
              least 3 sample journeys to see real numbers here.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5 text-sm text-slate-200">
              <li>
                • This journey tags leads correctly about{" "}
                <span className="font-semibold">
                  {accuracy.toFixed(0)}% of the time
                </span>
                .
              </li>
              <li>
                • It captures around{" "}
                <span className="font-semibold">
                  {completeness.toFixed(0)}% of required fields
                </span>
                , so sales receives rich context instead of guesswork.
              </li>
              <li>
                • Safety suite is currently{" "}
                <span className="font-semibold">{safety.toFixed(0)}%</span>{" "}
                clean (when run), showing how often the AI refuses unsafe
                requests.
              </li>
              <li>
                • False-HOT risk is{" "}
                <span className="font-semibold">
                  {falseHotRate.toFixed(1)}%
                </span>
                , so only a small fraction of weak leads are escalated as “Hot”.
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Recent runs */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 md:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Recent pilot runs
          </h2>
          <p className="text-xs text-slate-500">
            {recentRuns.length === 0
              ? "No pilot runs yet."
              : `Showing the last ${recentRuns.length} run${
                  recentRuns.length > 1 ? "s" : ""
                }.`}
          </p>
        </div>

        {recentRuns.length === 0 ? (
          <p className="mt-3 text-xs text-slate-500">
            Use the <span className="font-semibold">Pilot runs</span> tab to run
            a few sample leads. They will appear here automatically.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-xs md:text-sm">
              <thead className="border-b border-slate-800/80 text-slate-400">
                <tr>
                  <th className="py-2 pr-4 font-medium">Journey</th>
                  <th className="px-4 py-2 font-medium">Expected</th>
                  <th className="px-4 py-2 font-medium">Predicted</th>
                  <th className="px-4 py-2 font-medium">Correct?</th>
                  <th className="px-4 py-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((run) => (
                  <tr
                    key={run.id}
                    className="border-b border-slate-900/60 last:border-0 hover:bg-slate-900/80"
                  >
                    <td className="py-2 pr-4 text-slate-200">
                      {run.scenarioLabel}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-300">
                      <StatusBadge
                        size="sm"
                        label={run.expectedTag}
                        variant={
                          run.expectedTag === "Hot"
                            ? "success"
                            : run.expectedTag === "Warm"
                            ? "warning"
                            : "default"
                        }
                      />
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-300">
                      <StatusBadge
                        size="sm"
                        label={run.predictedTag}
                        variant={
                          run.predictedTag === "Hot"
                            ? "success"
                            : run.predictedTag === "Warm"
                            ? "warning"
                            : "default"
                        }
                      />
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-300">
                      {run.correct ? (
                        <span className="text-emerald-400">Yes</span>
                      ) : (
                        <span className="text-rose-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-400">
                      {run.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
