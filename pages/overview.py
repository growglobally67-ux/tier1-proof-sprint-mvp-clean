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


def metric_status(value: float, target: float, inverse: bool = False):
    """Return (label, css_class) for status pill."""
    if inverse:
        # Lower is better
        if value <= target:
            return "On target", "ok"
        if value <= target * 1.5:
            return "Watch", "warn"
        return "High risk", "bad"
    else:
        if value >= target:
            return "On target", "ok"
        if value >= target * 0.8:
            return "Slightly low", "warn"
        return "Too low", "bad"


def render_overview(use_fake: bool):
    (
        acc,
        comp,
        safety_score,
        rel,
        run_count,
        safety_count,
        false_hot_rate,
    ) = compute_scores(st.session_state.lead_runs, st.session_state.safety_runs)

    label = gate_label(rel, safety_score, false_hot_rate)

    client_name = st.session_state.get("client_name", "Demo client")
    journey_name = st.session_state.get("journey_name", "ONE inbound lead journey")

    # HERO
    hero_col1, hero_col2 = st.columns([2.1, 1.1])

    with hero_col1:
        hero_html = f"""
        <div class="card">
          <div class="badge-pill">Tier-1 • AI Lead Proof Sprint • 5 days • ONE journey</div>
          <div class="hero-title">
            Proof, not promises: 5-day AI lead sprint with a real reliability score.
          </div>
          <div class="hero-sub">
            We pilot a single lead flow, see how AI tags Hot/Warm/Cold leads,
            run safety tests, and give you a single reliability score (0–100) plus GO / FIX / NO-GO.
          </div>
          <ul class="hero-bullets">
            <li>ONE journey, no scope creep.</li>
            <li>Hot/Warm/Cold tagging you can actually trust.</li>
            <li>Safety gate before any scale-up into CRM.</li>
          </ul>
          <div class="gauge-wrapper">
            <div class="gauge-circle" style="--pct:{rel/100:.2f};">
              <div class="gauge-inner">
                <div class="gauge-label">RELIABILITY</div>
                <div class="gauge-value">{rel:.0f}</div>
                <div class="gauge-pill">{label}</div>
              </div>
            </div>
            <div>
              <div class="metric-label">Baseline for this ONE AI lead journey</div>
              <div class="section-body" style="margin-top:6px;">
                We compress accuracy, completeness and safety into a single score so execs
                can quickly see if this journey is safe to scale or if it needs fixes first.
              </div>
              <div class="metrics-row">
                <div class="metric-card">
                  <div class="metric-label">Accuracy</div>
                  <div class="metric-value">{acc:.1f}%</div>
                  <div class="metric-caption">Correct Hot/Warm/Cold tags.</div>
                </div>
                <div class="metric-card">
                  <div class="metric-label">Completeness</div>
                  <div class="metric-value">{comp:.1f}%</div>
                  <div class="metric-caption">Useful fields captured.</div>
                </div>
                <div class="metric-card">
                  <div class="metric-label">Safety</div>
                  <div class="metric-value">{safety_score:.1f}%</div>
                  <div class="metric-caption">Safety tests passed.</div>
                </div>
                <div class="metric-card">
                  <div class="metric-label">False-Hot</div>
                  <div class="metric-value">{false_hot_rate:.1f}%</div>
                  <div class="metric-caption">Wrongly tagged as Hot.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        """
        st.markdown(hero_html, unsafe_allow_html=True)

    with hero_col2:
        right_html = f"""
        <div class="card hero-right">
          <div class="hero-label">Client / Project</div>
          <div class="hero-sprint-name">{client_name}</div>
          <div class="hero-reliability">
            Journey: <span>{journey_name}</span>
          </div>
          <div style="margin-top:10px;font-size:11px;color:#9ca3af;">
            Reliability: <span>{rel:.0f}/100</span> • {label}
          </div>
          <div style="margin-top:14px;font-size:11px;color:#9ca3af;">
            Mode: {"Demo (fake LLM)" if use_fake else "Live (real OpenAI model)"}
          </div>
        </div>
        """
        st.markdown(right_html, unsafe_allow_html=True)

    # Targets vs actuals + assurance
    acc_status, acc_class = metric_status(acc, ACCURACY_TARGET)
    comp_status, comp_class = metric_status(comp, COMPLETENESS_TARGET)
    safety_status, safety_class = metric_status(safety_score, SAFETY_TARGET)
    fh_status, fh_class = metric_status(false_hot_rate, FALSE_HOT_TARGET, inverse=True)

    cols = st.columns([1.7, 1.3])
    with cols[0]:
        # Targets vs actuals
        html = f"""
        <div class="card" style="margin-top:14px;">
          <div class="section-title">Sprint targets vs actuals</div>
          <div class="section-body" style="margin-top:6px;">
            <table style="width:100%;font-size:11px;border-collapse:collapse;">
              <tr>
                <th style="text-align:left;padding-bottom:4px;">Metric</th>
                <th style="text-align:left;padding-bottom:4px;">Target</th>
                <th style="text-align:left;padding-bottom:4px;">Actual</th>
                <th style="text-align:left;padding-bottom:4px;">Status</th>
              </tr>
              <tr>
                <td>Accuracy</td>
                <td>{ACCURACY_TARGET:.0f}%</td>
                <td>{acc:.1f}%</td>
                <td><span class="status-pill {acc_class}">{acc_status}</span></td>
              </tr>
              <tr>
                <td>Completeness</td>
                <td>{COMPLETENESS_TARGET:.0f}%</td>
                <td>{comp:.1f}%</td>
                <td><span class="status-pill {comp_class}">{comp_status}</span></td>
              </tr>
              <tr>
                <td>Safety</td>
                <td>{SAFETY_TARGET:.0f}%</td>
                <td>{safety_score:.1f}%</td>
                <td><span class="status-pill {safety_class}">{safety_status}</span></td>
              </tr>
              <tr>
                <td>False-HOT rate</td>
                <td>&lt; {FALSE_HOT_TARGET:.0f}%</td>
                <td>{false_hot_rate:.1f}%</td>
                <td><span class="status-pill {fh_class}">{fh_status}</span></td>
              </tr>
            </table>
          </div>
        </div>
        """
        st.markdown(html, unsafe_allow_html=True)

    with cols[1]:
        # Assurance seal if strong enough
        show_seal = (
            label == "GO"
            and safety_score >= SAFETY_TARGET
            and false_hot_rate <= FALSE_HOT_TARGET
        )
        if show_seal:
            seal_html = f"""
            <div class="assurance-card">
              <strong>✅ Passed Tier-1 AI Lead Proof Sprint</strong><br/>
              This journey meets the agreed targets and is safe to scale into Tier-2
              (CRM + calendar), under the conditions in the pilot report.
            </div>
            """
            st.markdown(seal_html, unsafe_allow_html=True)
        else:
            info_html = """
            <div class="card" style="margin-top:14px;">
              <div class="section-title">Sprint decision</div>
              <div class="section-body" style="margin-top:6px;">
                We combine the metrics above into a GO / FIX / NO-GO recommendation.
                Use the detailed report page for the narrative and next steps.
              </div>
            </div>
            """
            st.markdown(info_html, unsafe_allow_html=True)

    # "What this sprint tells you" + how-to-use
    (
        acc,
        comp,
        safety_score,
        rel,
        run_count,
        safety_count,
        false_hot_rate,
    ) = compute_scores(st.session_state.lead_runs, st.session_state.safety_runs)

    bullets = []
    bullets.append(
        f"This journey tags leads correctly about <b>{acc:.0f}%</b> of the time, "
        f"{'above' if acc >= ACCURACY_TARGET else 'below'} the {ACCURACY_TARGET:.0f}% target."
    )
    bullets.append(
        f"It captures around <b>{comp:.0f}%</b> of required lead fields, giving sales rich context."
    )
    if safety_count > 0:
        bullets.append(
            f"It passed <b>{safety_score:.0f}%</b> of safety tests, showing how often the AI refuses bad requests."
        )
    else:
        bullets.append(
            "Safety tests have not been run yet – run the Safety Suite to complete the baseline."
        )
    bullets.append(
        f"False-HOT risk is <b>{false_hot_rate:.1f}%</b>, meaning only a small fraction of weak leads are escalated as “Hot”."
    )

    mid_html = f"""
    <div class="card" style="margin-top:14px;">
      <div class="small-grid">
        <div>
          <div class="section-title">What this sprint tells you</div>
          <div class="section-body" style="margin-top:4px;">
            <ul style="padding-left:18px;margin-top:4px;">
              <li>{bullets[0]}</li>
              <li>{bullets[1]}</li>
              <li>{bullets[2]}</li>
              <li>{bullets[3]}</li>
            </ul>
          </div>
        </div>
        <div>
          <div class="section-title">5-day Tier-1 sprint timeline</div>
          <div class="section-body" style="margin-top:4px;">
            <ul style="padding-left:18px;margin-top:4px;">
              <li><b>Day 1</b>: Lock ONE lead journey + success metric.</li>
              <li><b>Day 2–3</b>: Run pilot conversations, collect lead JSON + notes.</li>
              <li><b>Day 4</b>: Run safety suite (red-team tests) on the same journey.</li>
              <li><b>Day 5</b>: Compute metrics, reliability score, GO/FIX/NO-GO report.</li>
            </ul>
          </div>
        </div>
        <div>
          <div class="section-title">How to use this MVP</div>
          <div class="section-body" style="margin-top:4px;">
            1) Go to <b>Lead Pilot</b> to run demo or logged pilots.<br/>
            2) Go to <b>Sprint Log & Summary</b> to inspect runs and export CSV.<br/>
            3) Go to <b>Safety Suite</b> to run safety tests.<br/>
            4) Go to <b>Report</b> to generate the 1-page pilot report.
          </div>
        </div>
      </div>
    </div>
    """
    st.markdown(mid_html, unsafe_allow_html=True)
