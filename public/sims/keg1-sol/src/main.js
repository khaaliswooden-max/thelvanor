// Keg-1 SOL Digital Twin — app bootstrap & UI wiring.
// Runs the same ES-module simulation core as the Node test suite.
import { runSimulation } from './sim/sim.js';
import { SCENARIOS } from './sim/scenarios.js';
import { flattenParams } from './sim/params.js';
import { Chart } from './charts.js';
import { View3D } from './view3d.js';
import { toCSV, download } from './exporter.js';

const PARAMS_URL = './params/v0.2.json';
// series colours: keep in step with the --c-* tokens in styles.css
const COL = { pv: '#d99a1b', batt: '#3fbf74', load: '#5b9cf6', bus: '#a9adb4',
  node: '#e8650a', wall: '#5b9cf6', amb: '#6f737b', work: '#f2f2f0' };

const $ = s => document.querySelector(s);
const state = {
  paramsReg: null, params: null,
  scenario: null, result: null,
  cursorS: 0, playing: false, speed: 600,
  compareResult: null,
  view3d: null, charts: {},
};
const embedded = window.parent !== window;
if (!embedded) document.documentElement.classList.add('standalone');

const fmt = {
  wh: v => `${v.toFixed(1)} Wh`,
  w: v => `${v.toFixed(1)} W`,
  c: v => `${v.toFixed(1)} °C`,
  pct: v => `${(v * 100).toFixed(1)}%`,
  cu: v => v >= 1000 ? `${(v / 1000).toFixed(1)}k CU` : `${v.toFixed(0)} CU`,
  hms: s => {
    const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
    return `T+${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  },
  utc: ts => new Date(ts * 1000).toISOString().slice(5, 16).replace('T', ' ') + 'Z',
};

async function boot() {
  state.paramsReg = await (await fetch(PARAMS_URL)).json();
  state.params = flattenParams(state.paramsReg);
  buildScenarioList();
  const glProbe = document.createElement('canvas');
  const glOk = !!(glProbe.getContext('webgl2') || glProbe.getContext('webgl'));
  if (glOk) {
    try {
      state.view3d = new View3D($('#view3d'));
    } catch { state.view3d = null; }
  }
  if (!state.view3d) {
    $('#view3d').innerHTML = '<p class="hint" style="padding:16px">3D view unavailable (WebGL context could not be created in this browser). Charts, metrics, and exports are unaffected.</p>';
  }
  buildCharts();
  wireControls();
  selectScenario(SCENARIOS.find(s => s.name === 'S4-week-paired-soc-aware') ?? SCENARIOS[0]);
  requestAnimationFrame(tick);
  // canvas text needs the web fonts; redraw once they are in
  document.fonts?.ready.then(() => drawCharts());
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(reportSize).observe(document.body);
}

// When embedded in the site, tell the host page how tall the app is so it can
// size the frame (stacked layout) instead of scrolling inside a scroll.
function reportSize() {
  if (!embedded) return;
  const stacked = window.matchMedia('(max-width:1100px)').matches;
  window.parent.postMessage(
    { type: 'keg1-sol:size', stacked, height: Math.ceil(document.documentElement.scrollHeight) },
    window.location.origin);
}

function buildScenarioList() {
  const box = $('#scenario-list');
  for (const s of SCENARIOS) {
    const b = document.createElement('button');
    b.textContent = s.name;
    b.dataset.name = s.name;
    b.addEventListener('click', () => selectScenario(s));
    box.appendChild(b);
  }
}

function buildCharts() {
  state.charts.batt = new Chart($('#ch-batt'), {
    series: [{ key: 'battery_energy_wh', label: 'E', color: COL.batt }],
    yMin: 0, band: state.params.reserve_fraction * state.params.battery_capacity_wh,
  });
  state.charts.power = new Chart($('#ch-power'), {
    series: [
      { key: 'pv_power_w', label: 'PV', color: COL.pv },
      { key: 'bus_power_w', label: 'bus', color: COL.bus },
      { key: 'device_power_w', label: 'device', color: COL.load },
    ], yMin: 0,
  });
  state.charts.temp = new Chart($('#ch-temp'), {
    series: [
      { key: 't_node0_c', label: 'node0', color: COL.node },
      { key: 't_plate_c', label: 'strip', color: COL.pv },
      { key: 't_wall_c', label: 'wall', color: COL.wall },
      { key: 't_amb_c', label: 'amb', color: COL.amb },
    ],
  });
  state.charts.work = new Chart($('#ch-work'), {
    series: [{ key: 'completed_cu', label: 'CU', color: COL.work }], yMin: 0,
  });
  window.addEventListener('resize', () => drawCharts());
}

function wireControls() {
  $('#btn-play').addEventListener('click', togglePlay);
  $('#btn-reset').addEventListener('click', () => { state.cursorS = 0; syncCursor(); });
  $('#speed-group').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    state.speed = Number(b.dataset.speed);
    document.querySelectorAll('#speed-group button').forEach(x => x.classList.toggle('on', x === b));
  });
  $('#scrub').addEventListener('input', e => {
    const dur = state.result.summary.duration_s;
    state.cursorS = (Number(e.target.value) / 1000) * dur;
    state.playing = false; $('#btn-play').textContent = '▶';
    syncCursor();
  });
  $('#btn-cutaway').addEventListener('click', e => {
    if (state.view3d) e.target.classList.toggle('on', state.view3d.toggleCutaway());
  });
  $('#btn-labels').addEventListener('click', () => state.view3d?.toggleLabels());
  $('#btn-rerun').addEventListener('click', () => runCurrent(true));
  $('#cfg-soc').addEventListener('input', e => { $('#cfg-soc-val').textContent = `${e.target.value}%`; });
  $('#exp-tele').addEventListener('click', () => exportTelemetry());
  $('#exp-events').addEventListener('click', () => exportEvents());
  $('#exp-summary').addEventListener('click', () =>
    download(`${state.scenario.name}.summary.json`, JSON.stringify(state.result.summary, null, 2), 'application/json'));
  $('#exp-config').addEventListener('click', () =>
    download(`${state.scenario.name}.scenario.json`, JSON.stringify(state.scenario, null, 2), 'application/json'));
}

function selectScenario(s) {
  state.scenario = s;
  document.querySelectorAll('#scenario-list button').forEach(b =>
    b.classList.toggle('on', b.dataset.name === s.name));
  $('#scenario-desc').textContent = s.description;
  // config defaults from scenario
  $('#cfg-soc').value = Math.round((s.initial_soc ?? 0.9) * 100);
  $('#cfg-soc-val').textContent = `${Math.round((s.initial_soc ?? 0.9) * 100)}%`;
  $('#cfg-sched').value = s.scheduler;
  runCurrent(false);
}

function runCurrent(withOverrides) {
  const btn = $('#btn-rerun');
  btn.disabled = true; btn.textContent = 'Running…';
  setTimeout(() => {
    const s = structuredClone(state.scenario);
    if (withOverrides) {
      s.initial_soc = Number($('#cfg-soc').value) / 100;
      if (!s.util_profile && !s.util_cap_override) s.scheduler = $('#cfg-sched').value;
      $('#cfg-soc-val').textContent = `${$('#cfg-soc').value}%`;
    }
    state.result = runSimulation(s, state.params);
    state.cursorS = 0;
    state.playing = false;
    $('#btn-play').textContent = '▶';
    $('#scrub-end').textContent = fmt.hms(s.duration_s);
    for (const ch of Object.values(state.charts)) ch.setData(state.result.telemetry);
    buildEvents();
    buildCompare();
    syncCursor();
    btn.disabled = false; btn.textContent = 'Run simulation';
    reportSize();
  }, 30);
}

function rowAt(tS) {
  const tel = state.result.telemetry;
  const dt = tel[1] ? tel[1].t_s - tel[0].t_s : 10;
  const i = Math.min(tel.length - 1, Math.max(0, Math.round(tS / dt)));
  return tel[i];
}

function syncCursor() {
  const row = rowAt(state.cursorS);
  const sum = state.result.summary;
  $('#sim-clock').textContent = fmt.utc(state.scenario.epoch_utc_s + state.cursorS);
  $('#sim-day').textContent = `${fmt.hms(state.cursorS)} / ${fmt.hms(sum.duration_s)} elapsed`;
  $('#scrub').value = Math.round(state.cursorS / sum.duration_s * 1000);
  $('#scrub-t').textContent = fmt.hms(state.cursorS);

  // LEDs
  setLed('#led-protection', row.protection_state !== 'normal', true);
  setLed('#led-throttle', !!row.thermal_throttle, false);
  setLed('#led-brownout', !!row.brownout, true);
  setLed('#led-fault', !!row.fault_active, false);

  // metrics
  const m = [
    ['SoC', fmt.pct(row.soc), row.soc <= 0.2 ? 'red' : row.soc <= 0.4 ? 'amber' : 'mint'],
    ['Battery', fmt.wh(row.battery_energy_wh), ''],
    ['Reserve margin', fmt.wh(row.reserve_margin_wh), row.reserve_margin_wh < 0 ? 'red' : ''],
    ['PV power', fmt.w(row.pv_power_w), ''],
    ['Device load', fmt.w(row.device_power_w), ''],
    ['Node 0 temp', fmt.c(row.t_node0_c), row.t_node0_c >= 75 ? 'red' : row.t_node0_c >= 60 ? 'amber' : ''],
    ['Strip temp', fmt.c(row.t_plate_c), ''],
    ['Ambient', fmt.c(row.t_amb_c), ''],
    ['Work done', fmt.cu(row.completed_cu), ''],
    ['Queue', `${row.queued_jobs} jobs`, row.queued_jobs > 6 ? 'amber' : ''],
    ['Util cap', row.util_cap.toFixed(2), ''],
    ['Scheduler', row.scheduler_mode, ''],
  ];
  $('#metrics').innerHTML = m.map(([k, v, c]) =>
    `<div class="metric"><div class="k">${k}</div><div class="v ${c}">${v}</div></div>`).join('');

  state.view3d?.setState(row);
  for (const ch of Object.values(state.charts)) ch.setCursor(state.cursorS);
  markPastEvents();
}

function setLed(sel, on, bad) {
  const el = $(sel);
  el.classList.toggle('on', on);
  el.classList.toggle('bad', on && bad);
}

function drawCharts() { for (const ch of Object.values(state.charts)) ch.draw(); }

function buildEvents() {
  const box = $('#events');
  const ev = state.result.events;
  const MAX = 1500;
  const shown = ev.length > MAX ? ev.filter(e => e.type !== 'control') : ev;
  box.innerHTML = shown.slice(0, MAX).map(e =>
    `<div class="ev ty-${e.type}" data-t="${e.t_s}"><span class="t">${fmt.hms(e.t_s)}</span>${e.detail}</div>`).join('')
    + (ev.length > MAX ? `<div class="ev">… ${ev.length - MAX} more in events.csv export</div>` : '');
  box.querySelectorAll('.ev[data-t]').forEach(el =>
    el.addEventListener('click', () => {
      state.cursorS = Number(el.dataset.t);
      state.playing = false; $('#btn-play').textContent = '▶';
      syncCursor();
    }));
}

function markPastEvents() {
  const els = $('#events').children;
  // cheap pass: mark events at/before cursor
  for (const el of els) {
    if (el.dataset.t == null) continue;
    el.classList.toggle('past', Number(el.dataset.t) <= state.cursorS);
  }
}

// One-line reading of the paired result, derived from the two summaries
// (never a fixed sentence: the outcome changes with the parameters).
function compareVerdict(a, b) {
  const shed = (s) => s.reserve_violations > 0;
  const dark = (s) => s.brownout_s > 0;
  if (dark(a) && dark(b)) {
    return 'Both schedulers hit the reserve and both brown out: in this winter week the harvest does not cover the load on the overcast days, whichever policy admits the work.';
  }
  if (shed(a) && shed(b)) return 'Both schedulers cross the reserve at least once; neither browns out.';
  if (!shed(a) && !shed(b)) return 'Neither scheduler crosses the reserve in this week.';
  const held = shed(a) ? b : a;
  return `Only the ${held.scheduler} scheduler holds the reserve in this week.`;
}

function buildCompare() {
  const panel = $('#compare');
  const name = state.scenario.name;
  if (!name.startsWith('S4-week-paired')) {
    panel.innerHTML = '<p class="hint">Select an S4 paired scenario to compare schedulers on identical traces.</p>';
    state.compareResult = null;
    state.charts.batt.setCompare(null);
    return;
  }
  const otherName = name.endsWith('static') ? 'S4-week-paired-soc-aware' : 'S4-week-paired-static';
  const other = SCENARIOS.find(s => s.name === otherName);
  const r2 = runSimulation(structuredClone(other), state.params);
  state.compareResult = r2;
  state.charts.batt.setCompare(r2.telemetry);
  const a = state.result.summary, b = r2.summary;
  const row = (k, fa, fb) => `<div class="row"><span class="h">${k}</span><span class="a">${fa}</span><span class="b">${fb}</span></div>`;
  panel.innerHTML =
    `<div class="row"><span class="h"></span><span class="a">${a.scheduler}</span><span class="b">${b.scheduler}</span></div>`
    + row('work done', fmt.cu(a.completed_cu), fmt.cu(b.completed_cu))
    + row('jobs done', a.completed_jobs, b.completed_jobs)
    + row('final SoC', fmt.pct(a.final_soc), fmt.pct(b.final_soc))
    + row('brownout', `${(a.brownout_s / 3600).toFixed(1)} h`, `${(b.brownout_s / 3600).toFixed(1)} h`)
    + row('reserve sheds', a.reserve_violations, b.reserve_violations)
    + `<p class="hint">${compareVerdict(a, b)}</p>`;
}

function exportTelemetry() {
  const rows = state.result.telemetry;
  download(`${state.scenario.name}.telemetry.csv`, toCSV(rows, Object.keys(rows[0])), 'text/csv');
}
function exportEvents() {
  download(`${state.scenario.name}.events.csv`, toCSV(state.result.events, ['t_s', 'type', 'detail']), 'text/csv');
}

function togglePlay() {
  state.playing = !state.playing;
  $('#btn-play').textContent = state.playing ? '⏸' : '▶';
}

let lastT = 0;
function tick(now) {
  const dtReal = Math.min(0.1, (now - lastT) / 1000 || 0.016);
  lastT = now;
  if (state.playing && state.result) {
    state.cursorS += dtReal * state.speed;
    if (state.cursorS >= state.result.summary.duration_s) {
      state.cursorS = state.result.summary.duration_s;
      state.playing = false;
      $('#btn-play').textContent = '▶';
    }
    syncCursor();
  }
  state.view3d?.render(dtReal);
  requestAnimationFrame(tick);
}

boot();
