import streamlit as st

from core.data import SAFETY_TESTS, call_safety_llm, compute_scores


def render_safety_suite(use_fake: bool):
    st.markdown("### Safety Suite — red-team this ONE journey")

    st.markdown(
        """
        <div class="card">
          <div class="section-body" style="margin-top:4px;">
            This page runs a fixed set of 10 “red-team” prompts against the same AI setup
            to see how often it refuses unsafe or sensitive requests.
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    safety_runs = st.session_state.get("safety_runs", [])

    # Mini summary at top
    if safety_runs:
        passed = sum(r["pass"] for r in safety_runs)
        total = len(safety_runs)
        pct = passed / total * 100 if total else 0

        # Group by category
        by_cat = {}
        for r in safety_runs:
            cat = r.get("category", "Other")
            by_cat.setdefault(cat, {"total": 0, "passed": 0})
            by_cat[cat]["total"] += 1
            by_cat[cat]["passed"] += r["pass"]

        st.markdown(
            f"""
            <div class="card" style="margin-top:10px;">
              <div class="section-title">Last safety run</div>
              <div class="section-body" style="margin-top:4px;">
                Overall: <b>{passed}/{total}</b> tests passed (~{pct:.0f}%).<br/><br/>
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;font-size:11px;">
            """,
            unsafe_allow_html=True,
        )
        parts = []
        for cat, stats in by_cat.items():
            parts.append(
                f'<div class="context-chip"><b>{cat}:</b> {stats["passed"]}/{stats["total"]} passed</div>'
            )
        st.markdown("".join(parts) + "</div></div></div>", unsafe_allow_html=True)
    else:
        st.info("No safety tests run yet. Use the button below to run the full suite.")

    st.markdown("")

    if st.button("Run red-team safety suite (10 tests)"):
        results = []
        for name, category, prompt in SAFETY_TESTS:
            resp_text, passed = call_safety_llm(prompt, use_fake=use_fake)
            results.append(
                {
                    "test": name,
                    "category": category,
                    "prompt": prompt,
                    "pass": 1 if passed else 0,
                    "response_preview": resp_text[:140] + ("…" if len(resp_text) > 140 else ""),
                }
            )
        st.session_state.safety_runs = results
        st.success("Safety tests recorded ✅")
        safety_runs = results

    if safety_runs:
        st.markdown("#### Detailed safety log")
        st.dataframe(safety_runs, use_container_width=True)

    # Also show effect on scores
    runs = st.session_state.get("lead_runs", [])
    if runs:
        acc, comp, safety_score, rel, run_count, safety_count, false_hot = compute_scores(
            runs, safety_runs
        )
        st.markdown(
            f"""
            <div class="card" style="margin-top:14px;">
              <div class="section-title">Impact on reliability baseline</div>
              <div class="section-body" style="margin-top:4px;">
                With the current safety results, the overall reliability score for this journey is
                about <b>{rel:.0f}/100</b> (accuracy ~{acc:.0f}%, completeness ~{comp:.0f}%, safety ~{safety_score:.0f}%).
              </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
