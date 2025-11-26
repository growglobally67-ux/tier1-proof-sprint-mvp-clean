"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/pilot", label: "Pilot runs" },
  { href: "/safety", label: "Safety tests" },
  { href: "/report", label: "Proof report" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 border-r border-slate-900/80 bg-slate-950/95 px-4 py-5 md:flex md:flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-400 text-sm font-bold text-slate-950">
          AI
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">
            Lead Proof Console
          </div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Tier-1 • Pilot &amp; Safety
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={clsx(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                  active
                    ? "bg-slate-900 text-slate-50"
                    : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-100"
                )}
              >
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 text-[11px] text-slate-500">
        <div>AI Lead Proof Sprint</div>
        <div className="text-slate-600">v0.1 • MVP</div>
      </div>
    </aside>
  );
}
