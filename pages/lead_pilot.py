import streamlit as st
from datetime import datetime

from core.data import (
    SCENARIOS,
    call_llm,
    validate_lead_message,
    score_tag,
    completeness,
    REQUIRED_FIELDS,
)


MULTI_TURN_QUESTIONS = [
    "Who are you and what is your role?",
    "What does your company do?",
    "What is the main problem with your current lead process?",
    "Roughly what budget are you considering for fixing this?",
    "What timeline are you aiming for (e.g., next month, next quarter)?",
    "Are you the decision maker for this project?",
]


def init_state():
    if "last_pilot_json" not in st.session_state:
        st.session_state.last_pilot_json = None
    if "last_pilot_tag" not in st.session_state:
        st.session_state.last_pilot_tag = ""
    if "mock_step" not in st.session_state:
        st.session_state.mock_step = 0
    if "mock_history" not in st.session_state:
        st.session_state.mock_history = []
    if "mock_done" not in st.session_state:
        st.session_state.mock_done = False
    if "mock_result" not in st.session_state:
        st.session_state.mock_result = None
    if "lead_message" not in st.session_state:
        st.session_state.lead_message = ""


def render_lead_pilot(use_fake: bool):
    init_state()

    st.markdown(
        """
        <div class="card">
          <div class="section-title">Lead Pilot — run ONE AI lead journey</div>
          <div class="section-body" style="margin-top:4px;">
            This page lets you simulate an inbound lead, see how the AI would tag it
            (Hot/Warm/Cold), and optionally log the run into the Tier-1 sprint.
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("")

    # Stepper status
    has_message = bool(st.session_state.lead_message.strip())
    has_decision = st.session_state.last_pilot_json is not None
    has_logged = len(st.session_state.lead_runs) > 0

    step1_class = "done" if has_message else ""
    step2_class = "done" if has_decision else ""
    step3_class = "done" if has_logged else ""

    st.markdown(
        f"""
        <div class="stepper">
          <div class="stepper-item">
            <div class="step-dot {step1_class}">1</div>
            <div class="step-label {step1_class}">Lead message</div>
          </div>
          <div class="step-arrow">→</div>
          <div class="stepper-item">
            <div class="step-dot {step2_class}">2</div>
            <div class="step-label {step2_class}">AI decision</div>
          </div>
          <div class="step-arrow">→</div>
          <div class="stepper-item">
            <div class="step-dot {step3_class}">3</div>
            <div class="step-label {step3_class}">Logged in sprint</div>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    col_left, col_right = st.columns([1.6, 1.4])

    with col_left:
        st.markdown("#### 1) Lead message (choose or paste)")

        # Scenario chips for quick demo
        st.markdown(
            '<div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">'
            "Use quick scenarios for different client types:</div>",
            unsafe_allow_html=True,
        )
        chip_cols = st.columns(5)
        verticals = {
            "SaaS": SCENARIOS[0][1],
            "Agency": SCENARIOS[1][1],
            "Property": SCENARIOS[5][1],
            "Logistics": SCENARIOS[3][1],
            "Fintech": SCENARIOS[9][1],
        }
        for (label, text), col in zip(verticals.items(), chip_cols):
            with col:
                if st.button(label, key=f"chip_{label}", help=f"Use a {label} demo lead"):
                    st.session_state.lead_message = text

        st.session_state.lead_message = st.text_area(
            "Inbound lead message",
            value=st.session_state.lead_message
            or "Example: We get ~200 inbound leads per month. I am the founder, budget is 10–20k, and we want to fix our slow follow-ups in the next 4–6 weeks…",
            height=130,
        )

        valid, err = validate_lead_message(st.session_state.lead_message)
        if not valid:
            st.warning(err)

        st.markdown("")

        scenario_names = [s[0] for s in SCENARIOS]
        picked = st.selectbox(
            "Expected tag (for logging)",
            scenario_names,
            help="Pick the closest dummy scenario if you want to log a scored run.",
        )
        expected_tag = [s[2] for s in SCENARIOS if s[0] == picked][0]

        col_btn1, col_btn2 = st.columns(2)
        with col_btn1:
            if st.button("Simulate AI decision (one-shot)"):
                if not valid:
                    st.error("Lead message is too weak – improve it before testing.")
                else:
                    js = call_llm(st.session_state.lead_message, use_fake=use_fake)
                    st.session_state.last_pilot_json = js
                    st.session_state.last_pilot_tag = js.get("lead_tag", "")
                    st.success("AI decision simulated ✅")

        with col_btn2:
            if st.button("Run Tier-1 pilot & log result"):
                if not valid:
                    st.error("Lead message is too weak – improve it before logging.")
                else:
                    js = call_llm(st.session_state.lead_message, use_fake=use_fake)
                    predicted_tag = js.get("lead_tag", "")
                    tag_correct = score_tag(expected_tag, predicted_tag)
                    fields_collected, comp_pct = completeness(js)

                    st.session_state.last_pilot_json = js
                    st.session_state.last_pilot_tag = predicted_tag

                    st.session_state.lead_runs.append(
                        {
                            "timestamp": datetime.now().isoformat(timespec="seconds"),
                            "scenario": picked,
                            "expected": expected_tag,
                            "predicted": predicted_tag,
                            "tag_correct": tag_correct,
                            "fields_required": len(REQUIRED_FIELDS),
                            "fields_collected": fields_collected,
                            "completeness_pct": round(comp_pct, 1),
                            "false_hot": 1
                            if predicted_tag == "Hot" and expected_tag != "Hot"
                            else 0,
                            "notes": js.get("tag_reasoning", ""),
                            "raw_json": js,
                        }
                    )
                    st.success("Pilot run added to sprint log ✅")

    with col_right:
        st.markdown("#### 2) AI decision & summary")

        js = st.session_state.last_pilot_json
        if js is None:
            st.info("Run a simulation or a logged pilot to see AI output here.")
        else:
            tag = js.get("lead_tag", "N/A")
            reason = js.get("tag_reasoning", "")
            name = js.get("full_name", "Unknown")
            company = js.get("company_name", "Unknown Co")
            role = js.get("role_title", "")
            problem = js.get("current_problem", "")

            st.markdown(
                f"""
                <div class="card">
                  <div class="section-title">Lead snapshot</div>
                  <div class="section-body" style="margin-top:4px;">
                    <b>{name}</b> – {role} at <b>{company}</b><br/>
                    <span style="font-size:11px;color:#9ca3af;">Problem:</span>
                    <span style="font-size:11px;color:#e5e7eb;"> {problem or "Not captured"}</span><br/><br/>
                    <span style="font-size:11px;color:#9ca3af;">AI decision:</span>
                    <b>{tag}</b><br/>
                    <span style="font-size:11px;color:#9ca3af;">Why:</span>
                    <span style="font-size:11px;color:#e5e7eb;">{reason}</span>
                  </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            st.markdown("**Raw JSON output**")
            st.json(js)

    st.markdown("---")
    st.markdown("### Optional: step-by-step mock journey (for demo)")

    # Chat-like multi-turn mock
    mock_col1, mock_col2 = st.columns([1.4, 1.6])

    with mock_col1:
        st.markdown(
            """
            <div class="section-body">
              Use this section in a live demo to show how a structured AI journey could
              ask questions one by one. This is a mock (no API calls) but gives a feel
              for the experience.
            </div>
            """,
            unsafe_allow_html=True,
        )

        if st.button("Reset mock journey"):
            st.session_state.mock_step = 0
            st.session_state.mock_history = []
            st.session_state.mock_done = False
            st.session_state.mock_result = None

        st.markdown("")

        # Chat history
        if st.session_state.mock_history:
            st.markdown('<div class="chat-history">', unsafe_allow_html=True)
            for role, text in st.session_state.mock_history:
                if role == "ai":
                    st.markdown(
                        f'<div class="chat-row-ai"><span class="chat-bubble-ai">{text}</span></div>',
                        unsafe_allow_html=True,
                    )
                else:
                    st.markdown(
                        f'<div class="chat-row-user"><span class="chat-bubble-user">{text}</span></div>',
                        unsafe_allow_html=True,
                    )
            st.markdown("</div>", unsafe_allow_html=True)

        if not st.session_state.mock_done:
            q = MULTI_TURN_QUESTIONS[st.session_state.mock_step]
            st.markdown(f"**AI:** {q}")
            answer = st.text_input(
                "Your answer",
                key=f"mock_answer_{st.session_state.mock_step}",
            )
            if st.button("Save answer & next"):
                st.session_state.mock_history.append(("ai", q))
                st.session_state.mock_history.append(("user", answer or "[no answer]"))
                if st.session_state.mock_step + 1 >= len(MULTI_TURN_QUESTIONS):
                    st.session_state.mock_done = True
                    st.session_state.mock_step = len(MULTI_TURN_QUESTIONS) - 1
                    st.session_state.mock_result = {
                        "lead_tag": "Warm",
                        "reason": "Demo-only: based on the answers, this looks like a reasonable fit but with some open questions.",
                    }
                else:
                    st.session_state.mock_step += 1
        else:
            st.success("Mock journey complete ✅")

    with mock_col2:
        st.markdown("#### Mock journey result")
        if st.session_state.mock_result:
            res = st.session_state.mock_result
            st.markdown(
                f"""
                <div class="card">
                  <div class="section-title">Demo-only classification</div>
                  <div class="section-body" style="margin-top:4px;">
                    <b>Tag:</b> {res.get("lead_tag","Warm")}<br/>
                    <b>Reason:</b> {res.get("reason","") }
                  </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        else:
            st.info("Complete the mock journey on the left to see a fake result here.")
