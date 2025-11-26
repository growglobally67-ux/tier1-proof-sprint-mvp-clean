import streamlit as st

from core.data import compute_scores, get_log_csv_bytes


def render_sprint_log():
    st.markdown("### Sprint Log & Summary")

    runs = st.session_state.get("lead_runs", [])
    safety_runs = st.session_state.get("safety_runs", [])

    if not runs:
        st.info("No pilot runs logged yet. Use the Lead Pilot page to add runs.")
        return

    acc, comp, safety_score, rel, run_count, safety_count, false_hot = compute_scores(
        runs, safety_runs
    )

    hot_count = sum(1 for r in runs if r.get("predicted") == "Hot")
    warm_count = sum(1 for r in runs if r.get("predicted") == "Warm")
    cold_count = sum(1 for r in runs if r.get("predicted") == "Cold")

    st.markdown(
        f"""
        <div class="card">
          <div class="section-title">Sprint summary at a glance</div>
          <div class="section-body" style="margin-top:4px;">
            <ul style="padding-left:18px;margin-top:4px;">
              <li><b>{run_count}</b> pilot runs logged for this ONE journey.</li>
              <li>Lead tags: <b>{hot_count} Hot</b>, <b>{warm_count} Warm</b>, <b>{cold_count} Cold</b>.</li>
              <li>Tag accuracy around <b>{acc:.0f}%</b>, completeness around <b>{comp:.0f}%</b>.</li>
              <li>False-HOT risk around <b>{false_hot:.1f}%</b> – how often weak leads are escalated as “Hot”.</li>
            </ul>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("")

    col1, col2 = st.columns([1.7, 1.3])

    with col1:
        st.markdown("#### Measurement log table")
        st.dataframe(runs, use_container_width=True)

        csv_bytes = get_log_csv_bytes()
        if csv_bytes:
            st.download_button(
                "Download sprint log as CSV",
                data=csv_bytes,
                file_name="tier1_sprint_log.csv",
                mime="text/csv",
            )

    with col2:
        st.markdown("#### Inspect a single run")

        options = [f"{i+1}. {r['timestamp']} – {r['scenario']}" for i, r in enumerate(runs)]
        choice = st.selectbox(
            "Select a run",
            options,
            index=len(options) - 1 if options else 0,
        )
        idx = options.index(choice)
        run = runs[idx]
        js = run.get("raw_json", {})

        name = js.get("full_name", "Unknown")
        company = js.get("company_name", "Unknown Co")
        role = js.get("role_title", "")
        problem = js.get("current_problem", "")
        tag = run.get("predicted", "N/A")
        expected = run.get("expected", "N/A")
        correct = "Yes" if run.get("tag_correct") == 1 else "No"

        st.markdown(
            f"""
            <div class="card">
              <div class="section-title">Lead snapshot for this run</div>
              <div class="section-body" style="margin-top:4px;">
                <b>{name}</b> – {role} at <b>{company}</b><br/>
                <span style="font-size:11px;color:#9ca3af;">Problem:</span>
                <span style="font-size:11px;color:#e5e7eb;"> {problem or "Not captured"}</span><br/><br/>
                <span style="font-size:11px;color:#9ca3af;">AI decision:</span>
                <b>{tag}</b> (expected: {expected}, correct: {correct})<br/>
                <span style="font-size:11px;color:#9ca3af;">Completeness:</span>
                <span style="font-size:11px;color:#e5e7eb;"> {run.get("completeness_pct",0):.1f}% of required fields captured.</span><br/>
                <span style="font-size:11px;color:#9ca3af;">Notes:</span>
                <span style="font-size:11px;color:#e5e7eb;"> {run.get("notes","")}</span>
              </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.markdown("**Raw JSON for this run**")
        st.json(js)
