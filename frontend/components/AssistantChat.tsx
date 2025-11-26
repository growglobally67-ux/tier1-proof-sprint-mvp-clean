"use client";

import { useState, useMemo, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Role = "user" | "assistant";

interface ChatMessage {
  id: number;
  role: Role;
  text: string;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 1,
  role: "assistant",
  text:
    "Hi, I’m your Tier-1 assistant. I can explain how this sprint works and where to click. Try: “How do I complete a sprint?”",
};

function getAssistantReply(input: string): string {
  const t = input.toLowerCase();

  if (t.includes("pilot")) {
    return (
      "The Pilot runs tab is where you test individual leads. " +
      "Pick a scenario, run the pilot, and each run will appear in the measurement log and drive the accuracy/completeness metrics."
    );
  }

  if (t.includes("safety")) {
    return (
      "The Safety tests tab runs a fixed red-team suite: leakage, prompt injection, abuse, self-harm etc. " +
      "Click “Run safety suite (simulated)” once per sprint to populate the safety baseline."
    );
  }

  if (t.includes("reliability") || t.includes("score")) {
    return (
      "The reliability score on the Overview page compresses three things: " +
      "Accuracy (45%), Completeness (35%), and Safety (20%). " +
      "It’s the single number we use to say whether this ONE AI lead journey looks safe to scale."
    );
  }

  if (t.includes("go") && t.includes("no-go")) {
    return (
      "Decision logic: GO = Reliability ≥ 80, Safety = 100%, and at least 3 pilot runs. " +
      "FIX = Reliability between 60 and 79 (we’d tune before rollout). " +
      "NO-GO = Reliability below 60 or a weak safety baseline."
    );
  }

  if (t.includes("complete") || t.includes("finish") || t.includes("sprint")) {
    return (
      "To complete a Tier-1 sprint in this MVP:\n" +
      "1) Run at least 3 pilot runs on the Pilot runs tab.\n" +
      "2) Run the safety suite once on the Safety tests tab.\n" +
      "3) Go back to Overview – you’ll see “Sprint complete → View report”, then open the Proof report tab."
    );
  }

  if (t.includes("where") && t.includes("start")) {
    return (
      "Start on the Pilot runs tab. Run 3–5 example scenarios so you see the log fill up and the Overview metrics move. " +
      "Then run the Safety tests, and finally open the Proof report to show the one-page summary."
    );
  }

  if (t.includes("explain") && t.includes("tier")) {
    return (
      "Tier-1 (AI Lead Proof Sprint) is a 5-day, single-journey pilot. " +
      "We don’t build a full CRM; we just prove whether ONE AI lead flow is accurate, complete, and safe enough to scale."
    );
  }

  return (
    "I’m here to help you navigate this console and explain what the metrics mean. " +
    "You can ask things like:\n" +
    "• “How do I run a pilot?”\n" +
    "• “How do I complete a sprint?”\n" +
    "• “What is the reliability score?”\n" +
    "• “What does GO / FIX / NO-GO mean?”"
  );
}

const SUGGESTIONS = [
  "How do I use this dashboard?",
  "How do I complete a sprint?",
  "Explain GO / FIX / NO-GO",
  "What is the reliability score?",
];

export function AssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };

    const reply: ChatMessage = {
      id: Date.now() + 1,
      role: "assistant",
      text: getAssistantReply(trimmed),
    };

    setMessages((prev) => [...prev, userMessage, reply]);
    setInput("");
  };

  const handleSuggestion = (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text,
    };
    const reply: ChatMessage = {
      id: Date.now() + 1,
      role: "assistant",
      text: getAssistantReply(text),
    };
    setMessages((prev) => [...prev, userMessage, reply]);
  };

  const reversedMessages = useMemo(
    () => messages.slice().reverse(),
    [messages]
  );

  return (
    <>
      {/* Floating toggle button */}
      <button
        type="button"
        onClick={handleToggle}
        className="fixed bottom-5 right-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:brightness-105"
      >
        {isOpen ? "×" : "AI"}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-5 z-40 w-[320px] max-w-[90vw] rounded-2xl border border-slate-800 bg-slate-950/95 p-3 text-xs text-slate-100 shadow-2xl shadow-emerald-500/30 backdrop-blur"
          >
            {/* Header */}
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Tier-1 assistant
                </div>
                <div className="text-[11px] text-slate-400">
                  Ask how to use this sprint console.
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                Beta
              </span>
            </div>

            {/* Suggestions */}
            <div className="mb-2 flex flex-wrap gap-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSuggestion(s)}
                  className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5 text-[10px] text-slate-200 hover:border-emerald-400"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="mb-2 max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {reversedMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-2.5 py-1.5 text-[11px] leading-snug ${
                      m.role === "user"
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-100"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about pilot, safety, or score…"
                className="flex-1 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-[11px] text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400"
              />
              <button
                type="submit"
                className="rounded-full bg-emerald-500 px-2.5 py-1.5 text-[11px] font-semibold text-slate-950 hover:brightness-105"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
