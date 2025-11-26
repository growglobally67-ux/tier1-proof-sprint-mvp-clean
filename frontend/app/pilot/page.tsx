"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { StatusBadge } from "../../components/StatusBadge";
import { useSprint } from "../../components/SprintContext";
import type { LeadTag } from "../../components/SprintContext";

interface Scenario {
  id: number;
  label: string;
  description: string;
  message: string;
  expectedTag: LeadTag;
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    label: "SaaS – drowning in demos",
    description: "40-person SaaS, demo chaos, clear pain, big budget, urgent.",
    message:
      "We run a 40-person SaaS. We’re drowning in inbound demos and losing deals. Need AI lead routing ASAP. Budget around 30k. I’m the founder and want this in 4 weeks.",
    expectedTag: "Hot",
  },
  {
    id: 2,
    label: "Agency – messy leads",
    description: "12-person agency, messy pipeline, softer urgency/budget.",
    message:
      "We’re a 12-person marketing agency. Leads come from many sources and we miss follow-ups. Want to try a small AI pilot next quarter. Budget maybe 5–10k. I’m head of sales.",
    expectedTag: "Warm",
  },
  {
    id: 3,
    label: "Student – free bot",
    description: "No budget, not a real buyer.",
    message:
      "I’m a student researching AI for my university project. Can you build me a bot for free?",
    expectedTag: "Cold",
  },
];

const REQUIRED_FIELDS = [
  "full_name",
  "company_name",
  "role_title",
  "industry",
  "primary_goal",
  "current_problem",
  "urgency_timeline",
  "budget_range",
  "decision_authority",
  "company_size",
  "notes",
];

function classifyLead(text: string): LeadTag {
  const t = text.toLowerCase();
  const hasStrongBudget =
    t.includes("15k") ||
    t.includes("20k") ||
    t.includes("30k") ||
    t.includes("50k") ||
    t.includes("budget 15") ||
    t.includes("budget 20") ||
    t.includes("budget 30") ||
    t.includes("budget 50") ||
    t.includes("budget around 30");
  const hasUrgency =
    t.includes("asap") ||
    t.includes("this month") ||
    t.includes("4 weeks") ||
    t.includes("4-6 weeks") ||
    t.includes("4–6 weeks") ||
    t.includes("next month");
  const mentionsFree = t.includes("for free");
  const mentionsStudent =
    t.includes("student") || t.includes("university project");

  if (mentionsFree || mentionsStudent) return "Cold";
  if (hasStrongBudget && hasUrgency) return "Hot";
  if (hasStrongBudget || hasUrgency || t.includes("pilot")) return "Warm";
  return "Cold";
}

function buildStructuredLead(message: string, tag: LeadTag) {
  return {
    full_name: "Demo Lead",
    company_name: "Demo Company",
    role_title: message.toLowerCase().includes("founder")
      ? "Founder"
      : message.toLowerCase().includes("head of sales")
      ? "Head of Sales"
      : "Unknown",
    industry: message.toLowerCase().includes("saas")
      ? "SaaS"
      : message.toLowerCase().includes("agency")
      ? "Marketing Agency"
      : "Unknown",
    contact_email: "",
    primary_goal: "Improve lead qualification & routing",
    current_problem: "Slow or messy follow-ups on inbound leads",
    urgency_timeline: message.toLowerCase().includes("4 weeks")
      ? "Next 4–6 weeks"
      : message.toLowerCase().includes("next quarter")
      ? "Next quarter"
      : "Unclear",
    budget_range: message.toLowerCase().includes("30k")
      ? "15–50k"
      : message.toLowerCase().includes("5–10k")
      ? "5–15k"
      : "Unknown / not stated",
    decision_authority:
      message.toLowerCase().includes("founder") ||
      message.toLowerCase().includes("head of sales")
        ? "yes"
        : "unknown",
    company_size: message.toLowerCase().includes("40-person")
      ? "26–50"
      : message.toLowerCase().includes("12-person")
      ? "11–25"
      : "Unknown",
    lead_tag: tag,
    tag_reasoning:
      tag === "Hot"
        ? "Strong pain, clear budget and near-term urgency."
        : tag === "Warm"
        ? "Real business problem but weaker urgency or budget."
        : "No budget / not a serious commercial lead.",
    notes: "Mock extraction inside the frontend (no API key needed).",
  };
}

function computeCompleteness(structured: any) {
  let collected = 0;
  for (const f of REQUIRED_FIELDS) {
    const v = structured[f];
    if (typeof v === "string" && v.trim() !== "") {
      collected += 1;
    }
  }
  const fieldsRequired = REQUIRED_FIELDS.length;
  const completenessPct = fieldsRequired
    ? (collected / fieldsRequired) * 100
    : 0;
  return { fieldsCollected: collected, fieldsRequired, completenessPct };
}

// Simple 3-step Q&A mock for demo (multi-turn feeling)
const QA_STEPS = [
  {
    id: "identity",
    question: "Who are you and what company are you from?",
  },
  {
    id: "problem",
    question:
      "What is the main problem you want AI to help with in your lead flow?",
  },
  {
    id: "constraints",
    question:
      "Roughly what is your budget and ideal timeline to fix this?",
  },
];

type QaAnswers = Record<string, string>;

export default function PilotPage() {
  const { state, addPilotRun } = useSprint();

  // Single-turn pilot
  const [selectedScenarioId, setSelectedScenarioId] = useState<number>(1);
  const [message, setMessage] = useState<string>(SCENARIOS[0].message);
  const [resultJson, setResultJson] = useState<object | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);

  // Multi-turn mock
  const [qaStepIndex, setQaStepIndex] = useState(0);
  const [qaAnswers, setQaAnswers] = useState<QaAnswers>({});
  const [qaInput, setQaInput] = useState("");
  const [qaSummary, setQaSummary] = useState<string | null>(null);

  const selectedScenario =
    SCENARIOS.find((s) => s.id === selectedScenarioId) ?? SCENARIOS[0];

  const handlePickScenario = (scenario: Scenario) => {
    setSelectedScenarioId(scenario.id);
    setMessage(scenario.message);
    setResultJson(null);
  };

  const handleRunPilot = () => {
    if (!message.trim()) return;

    const predictedTag = classifyLead(message);
    const structured = buildStructuredLead(message, predictedTag);
    const { fieldsCollected, fieldsRequired, completenessPct } =
      computeCompleteness(structured);

    setResultJson(structured);

    const correct = predictedTag === selectedScenario.expectedTag;
    addPilotRun({
      id: Date.now(),
      scenarioLabel: selectedScenario.label,
      expectedTag: selectedScenario.expectedTag,
      predictedTag,
      correct,
      timestamp: new Date().toLocaleString(),
      fieldsCollected,
      fieldsRequired,
      completenessPct,
      rawJson: structured,
    });
  };

  const log = state.pilotRuns;
  const selectedRun = log.find((r) => r.id === selectedRunId) ?? null;

  // Multi-turn Q&A handlers
  const currentQaStep = QA_STEPS[qaStepIndex];

  const handleQaNext = () => {
    if (!currentQaStep) return;
    if (!qaInput.trim()) return;

    const updated: QaAnswers = {
      ...qaAnswers,
      [currentQaStep.id]: qaInput.trim(),
    };
    setQaAnswers(updated);
    setQaInput("");

    if (qaStepIndex + 1 < QA_STEPS.length) {
      setQaStepIndex(qaStepIndex + 1);
    } else {
      // Build a simple summary
      const identity = updated["identity"] ?? "";
      const problem = updated["problem"] ?? "";
      const constraints = updated["constraints"] ?? "";
      const summary = `Lead summary (mock multi-turn result):

- Who they are: ${identity || "n/a"}
- Lead problem: ${problem || "n/a"}
- Budget & timing: ${constraints || "n/a"}

In a real sprint, this conversation would feed into the same Hot / Warm / Cold logic and JSON you see above.`;
      setQaSummary(summary);
      setQaStepIndex(0);
      setQaAnswers({});
    }
  };

  const handleQaReset = () => {
    setQaAnswers({});
    setQaInput("");
    setQaSummary(null);
    setQaStepIndex(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Pilot runs
        </h1>
        <p className="text-sm text-slate-400">
          Choose a scenario or paste a real lead message. The MVP simulates how
          the Tier-1 sprint tags the lead and produces structured JSON.
        </p>
      </header>

      {/* Top grid: scenarios + result */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr),minmax(0,1.6fr)]">
        {/* Left: scenarios + input */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 md:p-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            1. Pick a lead scenario
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => handlePickScenario(s)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  s.id === selectedScenarioId
                    ? "border-emerald-400/80 bg-emerald-500/10 text-emerald-200"
                    : "border-slate-700/80 bg-slate-900/60 text-slate-300 hover:border-slate-500"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Expected tag for this scenario:&nbsp;
            <span className="font-semibold text-slate-200">
              {selectedScenario.expectedTag}
            </span>
          </p>

          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              2. Lead message
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-100 outline-none focus:border-emerald-400"
              rows={6}
            />
          </div>

          <button
            onClick={handleRunPilot}
            className="mt-3 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-1.5 text-sm font-semibold text-slate-950 hover:brightness-105"
          >
            Run pilot &amp; log result
          </button>
        </div>

        {/* Right: JSON result */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 md:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                3. AI decision (simulated)
              </div>
              <p className="mt-1 text-sm text-slate-300">
                This shows what a Tier-1 pilot run outputs: structured lead
                fields + Hot / Warm / Cold tag.
              </p>
            </div>
          </div>

          {resultJson ? (
            <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-slate-950/80 p-3 text-xs text-slate-100">
              {JSON.stringify(resultJson, null, 2)}
            </pre>
          ) : (
            <p className="mt-3 text-xs text-slate-500">
              Run a pilot to see the JSON output here.
            </p>
          )}
        </div>
      </div>

      {/* Log + detail */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 md:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Measurement log (this session)
          </h2>
          <p className="text-xs text-slate-500">
            {log.length === 0
              ? "No runs yet."
              : `Last ${log.length} run${log.length > 1 ? "s" : ""}. Click a row to inspect.`}
          </p>
        </div>

        {log.length === 0 ? (
          <p className="mt-3 text-xs text-slate-500">
            When you run the pilot, each decision will appear here with expected
            vs predicted tag.
          </p>
        ) : (
          <>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-xs md:text-sm">
                <thead className="border-b border-slate-800/80 text-slate-400">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Scenario</th>
                    <th className="px-4 py-2 font-medium">Expected</th>
                    <th className="px-4 py-2 font-medium">Predicted</th>
                    <th className="px-4 py-2 font-medium">Correct?</th>
                    <th className="px-4 py-2 font-medium">Completeness</th>
                    <th className="px-4 py-2 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRunId(row.id)}
                      className="cursor-pointer border-b border-slate-900/60 last:border-0 hover:bg-slate-900/80"
                    >
                      <td className="py-2 pr-4 text-slate-200">
                        {row.scenarioLabel}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-300">
                        <StatusBadge
                          size="sm"
                          label={row.expectedTag}
                          variant={
                            row.expectedTag === "Hot"
                              ? "success"
                              : row.expectedTag === "Warm"
                              ? "warning"
                              : "default"
                          }
                        />
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-300">
                        <StatusBadge
                          size="sm"
                          label={row.predictedTag}
                          variant={
                            row.predictedTag === "Hot"
                              ? "success"
                              : row.predictedTag === "Warm"
                              ? "warning"
                              : "default"
                          }
                        />
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {row.correct ? (
                          <span className="text-emerald-400">Yes</span>
                        ) : (
                          <span className="text-rose-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-300">
                        {row.completenessPct.toFixed(1)}%
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-400">
                        {row.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedRun && (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3 md:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Run details
                    </div>
                    <p className="mt-1 text-xs text-slate-300">
                      {selectedRun.scenarioLabel} • Expected{" "}
                      <span className="font-semibold">
                        {selectedRun.expectedTag}
                      </span>{" "}
                      → Predicted{" "}
                      <span className="font-semibold">
                        {selectedRun.predictedTag}
                      </span>{" "}
                      • Completeness{" "}
                      <span className="font-semibold">
                        {selectedRun.completenessPct.toFixed(1)}%
                      </span>
                    </p>
                  </div>
                </div>
                <pre className="mt-3 max-h-60 overflow-auto rounded-lg bg-slate-950 p-3 text-[11px] text-slate-100">
{JSON.stringify(selectedRun.rawJson, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </div>

      {/* Multi-turn mock block */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 md:p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Guided Q&amp;A mock (optional)
            </div>
            <p className="mt-1 text-sm text-slate-300">
              This simulates a short multi-turn conversation: the AI asks 3
              simple questions before tagging the lead. In the real sprint, this
              would feed into the same scoring logic.
            </p>
          </div>
          <button
            onClick={handleQaReset}
            className="hidden rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-slate-500 md:inline-flex"
          >
            Reset Q&amp;A
          </button>
        </div>

        {!qaSummary && currentQaStep && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">
              Step {qaStepIndex + 1} of {QA_STEPS.length}
            </p>
            <p className="text-sm text-slate-200">
              {currentQaStep.question}
            </p>
            <textarea
              value={qaInput}
              onChange={(e) => setQaInput(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-100 outline-none focus:border-emerald-400"
              rows={3}
            />
            <button
              onClick={handleQaNext}
              className="inline-flex items-center justify-center rounded-full bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700"
            >
              {qaStepIndex + 1 === QA_STEPS.length ? "Finish" : "Next"}
            </button>
          </div>
        )}

        {qaSummary && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Conversation summary (demo)
            </p>
            <pre className="max-h-60 overflow-auto rounded-lg bg-slate-950 p-3 text-[11px] text-slate-100">
{qaSummary}
            </pre>
            <button
              onClick={handleQaReset}
              className="inline-flex items-center justify-center rounded-full bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700"
            >
              Run another mock conversation
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
