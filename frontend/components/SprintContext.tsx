"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

export type LeadTag = "Hot" | "Warm" | "Cold";

export interface PilotRun {
  id: number;
  scenarioLabel: string;
  expectedTag: LeadTag;
  predictedTag: LeadTag;
  correct: boolean;
  timestamp: string;
  fieldsCollected: number;
  fieldsRequired: number;
  completenessPct: number;
  rawJson: any; // structured lead JSON for drilldown
}

interface SprintState {
  pilotRuns: PilotRun[];
  safetyTestsRun: boolean;
  safetyPassed: number;
  safetyTotal: number;
}

interface SprintContextValue {
  state: SprintState;
  addPilotRun: (run: PilotRun) => void;
  setSafetyResults: (passed: number, total: number) => void;
}

const SprintContext = createContext<SprintContextValue | undefined>(
  undefined
);

export function SprintProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SprintState>({
    pilotRuns: [],
    safetyTestsRun: false,
    safetyPassed: 0,
    safetyTotal: 0,
  });

  const addPilotRun = (run: PilotRun) => {
    setState((prev) => ({
      ...prev,
      pilotRuns: [run, ...prev.pilotRuns],
    }));
  };

  const setSafetyResults = (passed: number, total: number) => {
    setState((prev) => ({
      ...prev,
      safetyTestsRun: true,
      safetyPassed: passed,
      safetyTotal: total,
    }));
  };

  return (
    <SprintContext.Provider value={{ state, addPilotRun, setSafetyResults }}>
      {children}
    </SprintContext.Provider>
  );
}

export function useSprint() {
  const ctx = useContext(SprintContext);
  if (!ctx) {
    throw new Error("useSprint must be used within a SprintProvider");
  }
  return ctx;
}

/**
 * Derived metrics + decision + sprint-complete flag.
 */
export function useSprintMetrics() {
  const { state } = useSprint();
  const { pilotRuns, safetyTestsRun, safetyPassed, safetyTotal } = state;

  const pilotRunsCount = pilotRuns.length;
  const correctCount = pilotRuns.filter((r) => r.correct).length;

  const accuracy =
    pilotRunsCount > 0 ? (correctCount / pilotRunsCount) * 100 : 0;

  // NEW: real completeness = average of per-run completeness
  let completeness = 0;
  if (pilotRunsCount > 0) {
    const totalComp = pilotRuns.reduce(
      (sum, r) => sum + r.completenessPct,
      0
    );
    completeness = totalComp / pilotRunsCount;
  }

  const safety =
    safetyTestsRun && safetyTotal > 0
      ? (safetyPassed / safetyTotal) * 100
      : 0;

  const reliability =
    0.45 * accuracy + 0.35 * completeness + 0.2 * safety;

  const falseHotCount = pilotRuns.filter(
    (r) => r.predictedTag === "Hot" && r.expectedTag !== "Hot"
  ).length;
  const falseHotRate =
    pilotRunsCount > 0 ? (falseHotCount / pilotRunsCount) * 100 : 0;

  let decision: "GO" | "FIX" | "NO-GO" = "NO-GO";
  if (reliability >= 80 && safety === 100 && pilotRunsCount >= 3) {
    decision = "GO";
  } else if (reliability >= 60) {
    decision = "FIX";
  } else {
    decision = "NO-GO";
  }

  const isSprintComplete = pilotRunsCount >= 3 && safetyTestsRun;

  return {
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
  };
}
