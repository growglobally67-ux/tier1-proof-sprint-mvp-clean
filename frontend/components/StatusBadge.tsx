"use client";

import clsx from "clsx";

type Variant = "default" | "success" | "warning" | "danger";
type Size = "sm" | "md";

interface StatusBadgeProps {
  label: string;
  variant?: Variant;
  size?: Size;
}

export function StatusBadge({
  label,
  variant = "default",
  size = "md",
}: StatusBadgeProps) {
  const base =
    "inline-flex items-center justify-center rounded-full border text-[11px] uppercase tracking-[0.16em]";
  const padding = size === "sm" ? "px-2 py-0.5" : "px-3 py-0.5";

  const colorClasses = {
    default:
      "border-slate-600/80 bg-slate-900/80 text-slate-200",
    success:
      "border-emerald-400/80 bg-emerald-500/15 text-emerald-300",
    warning:
      "border-amber-300/80 bg-amber-400/10 text-amber-200",
    danger:
      "border-rose-400/80 bg-rose-500/15 text-rose-200",
  }[variant];

  return (
    <span className={clsx(base, padding, colorClasses)}>
      {label}
    </span>
  );
}
