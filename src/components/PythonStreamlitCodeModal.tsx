import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal, Code2, Play, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonStreamlitCodeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedApp, setCopiedApp] = useState(false);
  const [copiedReq, setCopiedReq] = useState(false);
  const [activeFile, setActiveFile] = useState<'app.py' | 'requirements.txt' | 'instructions'>('app.py');

  if (!isOpen) return null;

  const pythonStreamlitCode = `"""
EcoWatt – Real-Time Campus Micro-Grid Energy Optimizer
======================================================
Technology Stack:
- Python 3.9+
- Streamlit (Web UI & Interactive Sliders)
- Plotly (24-Hour Energy Profile Chart)
- PuLP (Linear Programming & MILP Optimization)

How to Run Locally:
1. pip install -r requirements.txt
2. streamlit run app.py
"""

import streamlit as st
import plotly.graph_objects as go
import pulp
import numpy as np
import pandas as pd

# -------------------------------------------------------------
# 1. PAGE CONFIG & STYLING
# -------------------------------------------------------------
st.set_page_config(
    page_title="EcoWatt - Campus Micro-Grid Optimizer",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Dark Luxury Microgrid Theme CSS
st.markdown("""
<style>
    .reportview-container { background: #0b0f19; }
    .main-header { font-size: 28px; font-weight: 800; color: #10b981; }
    .sub-header { color: #94a3b8; font-size: 14px; margin-bottom: 20px; }
    .metric-card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 16px; }
</style>
""", unsafe_allow_html=True)

st.title("⚡ EcoWatt – Real-Time Campus Micro-Grid Energy Optimizer")
st.markdown("<div class='sub-header'>Automatic load-shifting of deferrable campus equipment to peak solar production windows.</div>", unsafe_allow_html=True)

# -------------------------------------------------------------
# 2. DEFAULT REALISTIC CAMPUS DATA (24 Hours: 00:00 to 23:00)
# -------------------------------------------------------------
HOURS = list(range(24))
HOUR_LABELS = [f"{h:02d}:00" for h in HOURS]

# Baseline Campus Electricity Demand (kW)
# Includes university dorms, server room, safety lighting, libraries
DEFAULT_BASELINE = [
    2.1, 2.0, 1.9, 1.9, 2.1, 2.3, 
    3.2, 4.1, 5.5, 6.2, 6.8, 7.0, 
    6.5, 6.2, 5.8, 5.2, 4.9, 5.6, 
    6.8, 7.2, 6.4, 5.0, 3.8, 2.6
]

# Solar Power Generation Profile (kW)
# 12.4 kW peak campus rooftop array
DEFAULT_SOLAR = [
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 
    0.6, 2.2, 4.8, 7.1, 8.9, 9.8, 
    9.6, 8.4, 6.9, 4.5, 2.3, 0.7, 
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0
]

# Time-of-Use Electricity Tariff (₹ / kWh)
# Super off-peak (00-08): ₹6.5, Solar abundance (08-15): ₹8.0, Evening Peak (15-21): ₹14.5, Standard: ₹7.2
BASE_TARIFF = [
    6.5 if h < 8 else (8.0 if h < 15 else (14.5 if h < 21 else 7.2))
    for h in HOURS
]

# -------------------------------------------------------------
# 3. INTERACTIVE CONTROLS (SIDEBAR)
# -------------------------------------------------------------
st.sidebar.header("🎛️ Microgrid Controls")

solar_scale = st.sidebar.slider("☀️ Solar Generation Multiplier", 0.5, 2.0, 1.0, 0.1)
tariff_multiplier = st.sidebar.slider("💰 Electricity Price Multiplier", 0.5, 2.5, 1.0, 0.1)
carbon_factor = st.sidebar.slider("🌱 Grid Carbon Factor (kg CO₂ / kWh)", 0.4, 1.2, 0.82, 0.02)
feed_in_tariff = st.sidebar.number_input("⚡ Solar Export Feed-in Credit (₹/kWh)", 1.0, 10.0, 3.5, 0.5)

# Scaled series
solar_profile = [val * solar_scale for val in DEFAULT_SOLAR]
tariff_profile = [val * tariff_multiplier for val in BASE_TARIFF]

# Deferrable Loads Definition
st.sidebar.subheader("🔌 Deferrable Loads Configuration")

loads_data = [
    {"name": "EV Campus Shuttle", "power": 3.6, "duration": 3, "earliest": 8, "latest": 18, "orig_start": 18},
    {"name": "HVAC Pre-Cooling", "power": 2.8, "duration": 3, "earliest": 9, "latest": 17, "orig_start": 15},
    {"name": "Water Supply Pump", "power": 4.0, "duration": 2, "earliest": 7, "latest": 17, "orig_start": 6},
    {"name": "Lab Autoclaves & Centrifuge", "power": 2.5, "duration": 2, "earliest": 9, "latest": 16, "orig_start": 16},
    {"name": "Dormitory Laundromat", "power": 2.0, "duration": 2, "earliest": 8, "latest": 20, "orig_start": 19},
]

configured_loads = []
for i, l in enumerate(loads_data):
    with st.sidebar.expander(f"{l['name']}", expanded=(i == 0)):
        p = st.number_input(f"Power (kW) - {l['name']}", 0.5, 15.0, float(l['power']), 0.5, key=f"p_{i}")
        d = st.slider(f"Duration (hrs) - {l['name']}", 1, 6, int(l['duration']), key=f"d_{i}")
        e = st.slider(f"Earliest Start (hr)", 0, 22, int(l['earliest']), key=f"e_{i}")
        lt = st.slider(f"Latest Finish (hr)", e + d, 24, int(l['latest']), key=f"lt_{i}")
        configured_loads.append({
            "name": l["name"],
            "power": p,
            "duration": d,
            "earliest": e,
            "latest": lt,
            "orig_start": l["orig_start"]
        })

# -------------------------------------------------------------
# 4. PuLP OPTIMIZATION ENGINE (Mixed-Integer Linear Formulation)
# -------------------------------------------------------------
def optimize_schedule(loads, baseline, solar, tariff, feed_in):
    prob = pulp.LpProblem("Campus_Microgrid_Optimization", pulp.LpMinimize)
    
    # Binary decision variable: x[i, t] = 1 if load i starts at hour t
    x = {}
    for i, l in enumerate(loads):
        for t in HOURS:
            if l["earliest"] <= t <= (l["latest"] - l["duration"]):
                x[i, t] = pulp.LpVariable(f"start_{i}_{t}", cat="Binary")
            else:
                x[i, t] = 0

    # Constraint: Each load must start exactly once
    for i, l in enumerate(loads):
        prob += pulp.lpSum([x[i, t] for t in HOURS if not isinstance(x[i, t], int)]) == 1

    # Continuous variables for grid import & export at each hour
    grid_import = {t: pulp.LpVariable(f"import_{t}", lowBound=0) for t in HOURS}
    solar_export = {t: pulp.LpVariable(f"export_{t}", lowBound=0) for t in HOURS}

    # Hourly power balance constraints
    for t in HOURS:
        load_power_at_t = pulp.lpSum([
            loads[i]["power"] * x[i, tau]
            for i in range(len(loads))
            for tau in range(max(0, t - loads[i]["duration"] + 1), t + 1)
            if (i, tau) in x and not isinstance(x[i, tau], int)
        ])
        # Balance: baseline + deferrable loads - solar = import - export
        prob += (baseline[t] + load_power_at_t - solar[t]) == (grid_import[t] - solar_export[t])

    # Objective: Minimize net electricity import cost minus solar export revenue
    prob += pulp.lpSum([
        grid_import[t] * tariff[t] - solar_export[t] * feed_in
        for t in HOURS
    ])

    # Solve using CBC solver
    prob.solve(pulp.PULP_CBC_CMD(msg=False))

    # Extract chosen start hours
    optimized_starts = {}
    for i, l in enumerate(loads):
        for t in HOURS:
            var = x[i, t]
            if not isinstance(var, int) and pulp.value(var) is not None and pulp.value(var) > 0.5:
                optimized_starts[l["name"]] = t

    return optimized_starts

# -------------------------------------------------------------
# 5. DEMO "OPTIMIZE NOW" BUTTON & RESULTS
# -------------------------------------------------------------
st.subheader("⚡ 24-Hour Campus Energy Dashboard")

col_btn, col_info = st.columns([1, 3])
with col_btn:
    run_btn = st.button("⚡ Optimize Now", type="primary", use_container_width=True)

# Run optimization if button clicked or load default state
if run_btn or "optimized_starts" not in st.session_state:
    st.session_state.optimized_starts = optimize_schedule(
        configured_loads, DEFAULT_BASELINE, solar_profile, tariff_profile, feed_in_tariff
    )

opt_starts = st.session_state.optimized_starts

# Compute Profiles
orig_load_curve = np.zeros(24)
opt_load_curve = np.zeros(24)

for l in configured_loads:
    # Original
    o_s = l["orig_start"]
    orig_load_curve[o_s : min(24, o_s + l["duration"])] += l["power"]
    # Optimized
    opt_s = opt_starts.get(l["name"], l["orig_start"])
    opt_load_curve[opt_s : min(24, opt_s + l["duration"])] += l["power"]

orig_total = np.array(DEFAULT_BASELINE) + orig_load_curve
opt_total = np.array(DEFAULT_BASELINE) + opt_load_curve
solar_arr = np.array(solar_profile)
tariff_arr = np.array(tariff_profile)

# Financial and Environmental Calculations
orig_import = np.maximum(0, orig_total - solar_arr)
opt_import = np.maximum(0, opt_total - solar_arr)
orig_export = np.maximum(0, solar_arr - orig_total)
opt_export = np.maximum(0, solar_arr - opt_total)

orig_cost = np.sum(orig_import * tariff_arr) - np.sum(orig_export * feed_in_tariff)
opt_cost = np.sum(opt_import * tariff_arr) - np.sum(opt_export * feed_in_tariff)
money_saved = max(0, orig_cost - opt_cost)

orig_emissions = np.sum(orig_import) * carbon_factor
opt_emissions = np.sum(opt_import) * carbon_factor
co2_saved = max(0, orig_emissions - opt_emissions)

total_solar = np.sum(solar_arr)
orig_solar_util = (np.sum(np.minimum(solar_arr, orig_total)) / total_solar * 100) if total_solar > 0 else 0
opt_solar_util = (np.sum(np.minimum(solar_arr, opt_total)) / total_solar * 100) if total_solar > 0 else 0

# -------------------------------------------------------------
# 6. RESULTS & IMPACT CARDS
# -------------------------------------------------------------
m1, m2, m3, m4 = st.columns(4)
m1.metric("💰 Money Saved (Daily)", f"₹{money_saved:.2f}", f"-{(money_saved/orig_cost*100):.1f}% Cost")
m2.metric("🌱 CO₂ Saved (Daily)", f"{co2_saved:.2f} kg", f"-{(co2_saved/orig_emissions*100):.1f}% Emissions")
m3.metric("☀️ Solar Utilized", f"{opt_solar_util:.1f}%", f"+{(opt_solar_util - orig_solar_util):.1f}% vs Before")
m4.metric("⚡ Optimized Cost", f"₹{opt_cost:.2f}", f"Original: ₹{orig_cost:.2f}")

# -------------------------------------------------------------
# 7. PLOTLY 24-HOUR INTERACTIVE VISUALIZATION
# -------------------------------------------------------------
fig = go.Figure()

# 1. Solar Curve (Amber)
fig.add_trace(go.Scatter(
    x=HOUR_LABELS, y=solar_profile,
    name="Solar Generation",
    fill="tozeroy",
    fillcolor="rgba(245, 158, 11, 0.2)",
    line=dict(color="#f59e0b", width=3),
    mode="lines"
))

# 2. Campus Baseline Demand (Grey dashed)
fig.add_trace(go.Scatter(
    x=HOUR_LABELS, y=DEFAULT_BASELINE,
    name="Campus Baseline Demand",
    line=dict(color="#64748b", width=1.5, dash="dot"),
    mode="lines"
))

# 3. Original Schedule (Red dashed)
fig.add_trace(go.Scatter(
    x=HOUR_LABELS, y=orig_total,
    name="Original Schedule (Unshifted)",
    line=dict(color="#f43f5e", width=2, dash="dash"),
    mode="lines"
))

# 4. Optimized Schedule (Emerald Green)
fig.add_trace(go.Scatter(
    x=HOUR_LABELS, y=opt_total,
    name="Optimized Schedule (EcoWatt)",
    line=dict(color="#10b981", width=3.5),
    mode="lines"
))

fig.update_layout(
    title="24-Hour Solar Production vs Campus Electricity Demand",
    xaxis_title="Time of Day",
    yaxis_title="Power (kW)",
    template="plotly_dark",
    plot_bgcolor="#111827",
    paper_bgcolor="#111827",
    hovermode="x unified",
    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
)

st.plotly_chart(fig, use_container_width=True)

# -------------------------------------------------------------
# 8. SCHEDULE DISPATCH TABLE
# -------------------------------------------------------------
st.subheader("📋 Deferrable Load Schedule Comparison")
table_data = []
for l in configured_loads:
    table_data.append({
        "Load Name": l["name"],
        "Power (kW)": l["power"],
        "Duration (hrs)": l["duration"],
        "Original Hour": f"{l['orig_start']:02d}:00",
        "Optimized Hour": f"{opt_starts.get(l['name'], l['orig_start']):02d}:00",
        "Status": "Shifted into Solar Peak" if opt_starts.get(l['name']) != l['orig_start'] else "Optimal"
    })

st.table(pd.DataFrame(table_data))
`;

  const requirementsCode = `streamlit>=1.32.0
plotly>=5.18.0
pulp>=2.8.0
pandas>=2.2.0
numpy>=1.26.0
`;

  const instructionsText = `# How to Run EcoWatt Locally on Your Machine

### Step 1: Open Terminal / Command Prompt
Open your terminal in an empty project folder.

### Step 2: Create a Virtual Environment (Recommended)
\`\`\`bash
python3 -m venv venv
# On macOS / Linux:
source venv/bin/activate
# On Windows:
venv\\Scripts\\activate
\`\`\`

### Step 3: Install Required Dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Step 4: Run the Streamlit Application
\`\`\`bash
streamlit run app.py
\`\`\`

The app will instantly launch in your default web browser at http://localhost:8501!
Click "⚡ Optimize Now" to run the PuLP solver and watch the schedule reconfigure in real-time.
`;

  const handleCopy = (code: string, type: 'app' | 'req') => {
    navigator.clipboard.writeText(code);
    if (type === 'app') {
      setCopiedApp(true);
      setTimeout(() => setCopiedApp(false), 2000);
    } else {
      setCopiedReq(true);
      setTimeout(() => setCopiedReq(false), 2000);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Python & Streamlit Source Code
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Ready to Run
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete local runner with PuLP Linear Programming, Plotly graphs, and Streamlit sliders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Action Buttons */}
        <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 font-mono text-xs">
          <div className="flex space-x-1.5">
            <button
              onClick={() => setActiveFile('app.py')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFile === 'app.py'
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📄 app.py
            </button>
            <button
              onClick={() => setActiveFile('requirements.txt')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFile === 'requirements.txt'
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📦 requirements.txt
            </button>
            <button
              onClick={() => setActiveFile('instructions')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFile === 'instructions'
                  ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🚀 Local Run Guide
            </button>
          </div>

          {/* Quick Copy & Download */}
          <div className="flex items-center space-x-2">
            {activeFile === 'app.py' && (
              <>
                <button
                  onClick={() => handleCopy(pythonStreamlitCode, 'app')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  {copiedApp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedApp ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={() => handleDownload(pythonStreamlitCode, 'app.py')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download app.py</span>
                </button>
              </>
            )}
            {activeFile === 'requirements.txt' && (
              <>
                <button
                  onClick={() => handleCopy(requirementsCode, 'req')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  {copiedReq ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReq ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => handleDownload(requirementsCode, 'requirements.txt')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download requirements.txt</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Code Content Window */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs">
          {activeFile === 'app.py' && (
            <pre className="text-emerald-300/90 leading-relaxed overflow-x-auto whitespace-pre selection:bg-emerald-500/30">
              <code>{pythonStreamlitCode}</code>
            </pre>
          )}
          {activeFile === 'requirements.txt' && (
            <pre className="text-cyan-300 leading-relaxed overflow-x-auto whitespace-pre">
              <code>{requirementsCode}</code>
            </pre>
          )}
          {activeFile === 'instructions' && (
            <div className="space-y-4 text-slate-300 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-100 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Run in 4 Quick Commands:
                </h4>
                <div className="bg-black/60 p-3 rounded-lg text-emerald-400 font-mono text-xs space-y-1.5">
                  <p># 1. Create a project directory</p>
                  <p className="text-slate-100">mkdir ecowatt && cd ecowatt</p>
                  <p className="pt-2"># 2. Setup Python environment</p>
                  <p className="text-slate-100">python3 -m venv venv && source venv/bin/activate</p>
                  <p className="pt-2"># 3. Install packages</p>
                  <p className="text-slate-100">pip install streamlit plotly pulp pandas numpy</p>
                  <p className="pt-2"># 4. Launch Streamlit app</p>
                  <p className="text-slate-100">streamlit run app.py</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-100">Why PuLP Linear Programming?</h4>
                <p className="text-slate-400 leading-relaxed">
                  PuLP models each deferrable appliance as a mixed-integer linear program (MILP) with binary start variables.
                  It mathematically guarantees the global minimum electricity bill without heuristics, perfectly nesting deferrable loads beneath the solar curve.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
