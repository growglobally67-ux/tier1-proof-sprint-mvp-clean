import streamlit as st

from core.styling import APP_CSS
from core.data import seed_demo_data

from pages.overview import render_overview
from pages.lead_pilot import render_lead_pilot
from pages.sprint_log import render_sprint_log
from pages.safety_suite import render_safety_suite
from pages.report_page import render_report_page


st.set_page_config(page_title="AI Lead Proof Sprint MVP", layout="wide")
st.markdown(APP_CSS, unsafe_allow_html=True)

# Session init
if "lead_runs" not in st.session_state:
    st.session_state.lead_runs = []
if "safety_runs" not in st.session_state:
    st.session_state.safety_runs = []

# Seed demo data on first load
seed_demo_data()

with st.sidebar:
    st.markdown("### Tier-1 Pilot")
    use_fake = st.toggle("Fake mode (no API key needed)", value=True)

    client_name = st.text_input(
        "Client / Project name",
        value=st.session_state.get("client_name", "Demo Client"),
    )
    client_industry = st.text_input(
        "Industry",
        value=st.session_state.get("client_industry", "B2B SaaS"),
    )
    lead_volume = st.text_input(
        "Lead volume / month",
        value=st.session_state.get("lead_volume", "~200 inbound leads"),
    )
    journey_name = st.text_input(
        "Journey name",
        value=st.session_state.get("journey_name", "Website form → AI lead qualification"),
    )
    sprint_day = st.number_input(
        "Sprint day (1–5)",
        min_value=1,
        max_value=5,
        value=int(st.session_state.get("sprint_day", 3)),
    )

    st.session_state.client_name = client_name
    st.session_state.client_industry = client_industry
    st.session_state.lead_volume = lead_volume
    st.session_state.journey_name = journey_name
    st.session_state.sprint_day = sprint_day

    page = st.radio(
        "View",
        ["Overview", "Lead Pilot", "Sprint Log & Summary", "Safety Suite", "Report"],
    )

# Brand header
st.markdown(
    """
    <div class="app-header">
      <div class="app-header-left">
        <div class="app-logo">A</div>
        <div>
          <div class="app-brand-title">Your Brand AI</div>
          <div class="app-brand-sub">Tier-1 • AI Lead Proof Sprint</div>
        </div>
      </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# Client context strip (shows on all pages)
client_name = st.session_state.get("client_name", "Demo Client")
client_industry = st.session_state.get("client_industry", "B2B SaaS")
lead_volume = st.session_state.get("lead_volume", "~200 inbound leads")
journey_name = st.session_state.get("journey_name", "Website form → AI lead qualification")
sprint_day = st.session_state.get("sprint_day", 3)

context_html = f"""
<div class="context-strip">
  <div class="context-chip"><b>Client:</b> {client_name} ({client_industry})</div>
  <div class="context-chip"><b>Journey:</b> {journey_name}</div>
  <div class="context-chip"><b>Lead volume:</b> {lead_volume}</div>
  <div class="context-chip"><b>Sprint day:</b> Day {int(sprint_day)} of 5</div>
</div>
"""
st.markdown(context_html, unsafe_allow_html=True)

# Routing
if page == "Overview":
    render_overview(use_fake)
elif page == "Lead Pilot":
    render_lead_pilot(use_fake)
elif page == "Sprint Log & Summary":
    render_sprint_log()
elif page == "Safety Suite":
    render_safety_suite(use_fake)
elif page == "Report":
    render_report_page()
