import streamlit as st

from core.data import (
    compute_scores,
    gate_label,
    GO_THRESHOLD,
    ACCURACY_TARGET,
    COMPLETENESS_TARGET,
    SAFETY_TARGET,
    FALSE_HOT_TARGET,
)


def render_report_page():
    st.markdown("### 1-page Tier-1 Pilot Report (text template)")

    runs = st.session_state.get("lead_runs", [])
    safety_runs = st.session_state.get("safety_runs", [])

    acc, comp, safety_score, rel, run_count, safety_count, false_hot = compute_scores(
        runs, safety_runs
    )
    label = gate_label(rel, safety_score, false_hot)

    client_name = st.session_state.get("client_name", "Demo Client")
    client_industry = st.session_state.get("client_industry", "B2B")
    journey_name = st.session_state.get("journey_name", "ONE inbound lead journey")

    # Assurance seal inline
    if (
        label == "GO"
        and safety_score >= SAFETY_TARGET
        and false_hot <= FALSE_HOT_TARGET
    ):
        st.markdown(
            """
            <div class="assurance-card">
              <strong>✅ Passed Tier-1 AI Lead Proof Sprint</strong><br/>
              This journey meets the agreed targets and is safe to scale into Tier-2
              (CRM + calendar), under the conditions below.
            </div>
            """,
            unsafe_allow_html=True,
        )
    else:
        st.info(
            f"Current decision: {label}. You can still generate the report, but it will reflect a FIX or NO-GO outcome."
        )

    st.markdown("")

    body = f"""
Client / project
- Client: {client_name} ({client_industry})
- Journey tested: {journey_name}
- Sprint type: Tier-1 – AI Lead Proof Sprint (5 days, ONE journey)

Why we ran this pilot
- The client wanted to test AI on a single lead journey before scaling into CRM.
- Current pain: no clear lead process, slow follow-ups, and low confidence in AI.

What we tested
- Scope: ONE inbound lead journey (no scope creep).
- We ran {run_count} pilot lead journeys through the AI classifier.
- We ran {safety_count} safety tests (red-team prompts) against the same setup.

Key metrics
- Tag accuracy: {acc:.1f}% (target {ACCURACY_TARGET:.0f}%)
- Field completeness: {comp:.1f}% (target {COMPLETENESS_TARGET:.0f}%)
- Safety pass rate: {safety_score:.1f}% (target {SAFETY_TARGET:.0f}%)
- False-HOT rate: {false_hot:.1f}% (target < {FALSE_HOT_TARGET:.0f}%)
- Reliability score: {rel:.1f}/100
- Decision: {label}

What worked well
- (1) …
- (2) …
- (3) …

Risks / issues
- (1) …
- (2) …
- (3) …

Go / Fix / No-Go decision
- Decision: {label}
- Rationale: …
- If GO: roll into Tier-2 (CRM + calendar integration) with this journey.
- If FIX: adjust prompts / routing rules, re-run Tier-1.
- If NO-GO: do not scale this journey; revisit problem framing.

Recommended next steps
- Short term (next 2–4 weeks): …
- Medium term (next quarter): …
"""

    st.text_area(
        "Report text (copy-paste into Google Docs or PDF)",
        value=body,
        height=420,
    )
