APP_CSS = """
<style>
.stApp {
    background: radial-gradient(circle at top left, #111827 0, #020617 45%, #000 100%);
    color: #e5e7eb;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}
.block-container {
    padding-top: 2rem;
    padding-bottom: 3rem;
    max-width: 1200px;
}
.card {
    background: rgba(15,23,42,0.96);
    border-radius: 22px;
    padding: 20px 24px;
    border: 1px solid rgba(148,163,184,0.35);
    box-shadow: 0 18px 45px rgba(15,23,42,0.9);
}
.badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    padding: 3px 10px;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: rgba(15,23,42,0.9);
    border: 1px solid rgba(148,163,184,0.5);
    color: #9ca3af;
}
.hero-title {
    font-size: 26px;
    font-weight: 650;
    line-height: 1.22;
    margin-top: 14px;
    margin-bottom: 8px;
}
.hero-sub {
    font-size: 14px;
    color: #9ca3af;
    max-width: 540px;
}
.hero-bullets {
    margin-top: 10px;
    font-size: 13px;
    color: #9ca3af;
}
.hero-bullets li::marker {
    color: #22c55e;
}
.hero-right {
    text-align: right;
    font-size: 13px;
}
.hero-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #9ca3af;
}
.hero-sprint-name {
    font-size: 15px;
    font-weight: 600;
}
.hero-reliability {
    font-size: 13px;
    margin-top: 4px;
}
.hero-reliability span {
    color: #22c55e;
    font-weight: 600;
}
.gauge-wrapper {
    display: flex;
    align-items: center;
    gap: 26px;
    margin-top: 16px;
}
.gauge-circle {
    --pct: 0.86;
    width: 170px;
    height: 170px;
    border-radius: 999px;
    background: conic-gradient(#22c55e calc(var(--pct) * 360deg), rgba(30,64,175,0.35) 0);
    display: flex;
    align-items: center;
    justify-content: center;
}
.gauge-inner {
    width: 124px;
    height: 124px;
    border-radius: 999px;
    background: radial-gradient(circle at top, #020617, #020617 60%, #020617 100%);
    border: 1px solid rgba(148,163,184,0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.gauge-value {
    font-size: 34px;
    font-weight: 650;
}
.gauge-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #9ca3af;
}
.gauge-pill {
    margin-top: 8px;
    font-size: 11px;
    padding: 2px 10px;
    border-radius: 999px;
    background: rgba(22,163,74,0.16);
    border: 1px solid rgba(34,197,94,0.8);
    color: #bbf7d0;
}
.metrics-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
    font-size: 12px;
}
.metric-card {
    background: rgba(15,23,42,0.96);
    border-radius: 16px;
    padding: 10px 12px;
    border: 1px solid rgba(30,64,175,0.6);
}
.metric-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #9ca3af;
}
.metric-value {
    font-size: 18px;
    font-weight: 600;
    margin-top: 4px;
}
.metric-caption {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 2px;
}
.small-grid {
    display: grid;
    grid-template-columns: 1.25fr 1.05fr 1.15fr;
    gap: 14px;
    margin-top: 18px;
}
.section-title {
    font-size: 13px;
    font-weight: 600;
}
.section-body {
    font-size: 12px;
    color: #9ca3af;
}
textarea {
    border-radius: 12px !important;
    border: 1px solid rgba(55,65,81,0.9) !important;
    background: rgba(15,23,42,0.96) !important;
    color: #e5e7eb !important;
    font-size: 13px !important;
}
.stButton>button {
    border-radius: 999px;
    background: linear-gradient(135deg, #22c55e, #22d3ee);
    color: #020617;
    border: none;
    font-weight: 600;
    padding: 0.4rem 1.1rem;
}
.stButton>button:hover {
    filter: brightness(1.03);
}

/* Brand header */
.app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.25rem;
}
.app-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}
.app-logo {
    width: 26px;
    height: 26px;
    border-radius: 999px;
    background: linear-gradient(135deg, #22c55e, #22d3ee);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: #020617;
}
.app-brand-title {
    font-size: 13px;
    font-weight: 600;
}
.app-brand-sub {
    font-size: 11px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.12em;
}

/* Client context strip */
.context-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 18px;
    align-items: center;
    font-size: 11px;
    color: #9ca3af;
    margin-bottom: 0.75rem;
}
.context-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px;
    border-radius: 999px;
    background: rgba(15,23,42,0.9);
    border: 1px solid rgba(75,85,99,0.8);
}

/* Stepper on Lead Pilot */
.stepper {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    font-size: 11px;
}
.stepper-item {
    display: flex;
    align-items: center;
    gap: 6px;
}
.step-dot {
    width: 18px;
    height: 18px;
    border-radius: 999px;
    border: 1px solid rgba(148,163,184,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
}
.step-dot.done {
    background: linear-gradient(135deg, #22c55e, #22d3ee);
    border: none;
    color: #020617;
}
.step-label {
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.09em;
}
.step-label.done {
    color: #e5e7eb;
}
.step-arrow {
    color: #4b5563;
    font-size: 12px;
}

/* Scenario chips */
.scenario-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 6px;
}
.scenario-chip-btn {
    border-radius: 999px !important;
    padding: 2px 10px !important;
    font-size: 11px !important;
}

/* Chat-like mock history */
.chat-history {
    margin-top: 10px;
    margin-bottom: 6px;
}
.chat-row-ai,
.chat-row-user {
    font-size: 12px;
    margin-bottom: 4px;
}
.chat-bubble-ai {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 14px;
    background: rgba(30,64,175,0.55);
}
.chat-bubble-user {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 14px;
    background: rgba(15,23,42,0.9);
}

/* Assurance seal */
.assurance-card {
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid rgba(34,197,94,0.7);
    background: rgba(22,163,74,0.16);
    font-size: 11px;
    color: #bbf7d0;
}

/* Status pill small */
.status-pill {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
}
.status-pill.ok {
    background: rgba(22,163,74,0.18);
    border: 1px solid rgba(34,197,94,0.8);
    color: #bbf7d0;
}
.status-pill.warn {
    background: rgba(234,179,8,0.18);
    border: 1px solid rgba(234,179,8,0.9);
    color: #facc15;
}
.status-pill.bad {
    background: rgba(248,113,113,0.18);
    border: 1px solid rgba(248,113,113,0.9);
    color: #fecaca;
}
</style>
"""
