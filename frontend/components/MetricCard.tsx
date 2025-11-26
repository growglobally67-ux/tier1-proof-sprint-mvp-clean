"use client";

import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string;
  description?: string;
}

export function MetricCard({
  label,
  value,
  description,
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4"
    >
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-50">
        {value}
      </div>
      {description && (
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      )}
    </motion.div>
  );
}
