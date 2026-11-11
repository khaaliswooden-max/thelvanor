// Minimal canvas time-series charts for the twin's telemetry.
// Deterministic, no dependencies; redrawn on demand with a playback cursor.

const INK = { grid: '#2e3137', label: '#a9adb4', cursor: 'rgba(242,242,240,0.55)',
  band: 'rgba(229,83,75,0.10)', bandLine: 'rgba(229,83,75,0.55)' };
const FONT = '10px "IBM Plex Mono",ui-monospace,monospace';

export class Chart {
  constructor(canvas, opts) {
    this.cv = canvas;
    this.opts = opts; // { series: [{key,label,color}], yMin?, yMax?, band?: number }
    this.rows = [];
    this.cursorS = 0;
    this.compare = null; // optional second dataset drawn faint
  }
  setData(rows) { this.rows = rows; this.draw(); }
  setCursor(tS) { this.cursorS = tS; this.draw(); }
  setCompare(rows) { this.compare = rows; this.draw(); }

  draw() {
    const cv = this.cv, ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== w * dpr || cv.height !== h * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const rows = this.rows;
    if (!rows || rows.length < 2) return;

    const o = this.opts;
    const t0 = rows[0].t_s, t1 = rows[rows.length - 1].t_s;
    const padL = 44, padR = 6, padT = 6, padB = 18;
    const iw = w - padL - padR, ih = h - padT - padB;

    // y range
    let yMin = o.yMin ?? Infinity, yMax = o.yMax ?? -Infinity;
    if (o.yMin == null || o.yMax == null) {
      for (const r of rows) for (const s of o.series) {
        const v = r[s.key]; if (v == null) continue;
        if (o.yMin == null && v < yMin) yMin = v;
        if (o.yMax == null && v > yMax) yMax = v;
      }
      if (this.compare) for (const r of this.compare) for (const s of o.series) {
        const v = r[s.key]; if (v == null) continue;
        if (o.yMin == null && v < yMin) yMin = v;
        if (o.yMax == null && v > yMax) yMax = v;
      }
    }
    if (!(yMax > yMin)) { yMax = yMin + 1; }
    const pad = (yMax - yMin) * 0.08; yMax += pad; if (o.yMin == null) yMin -= pad;

    const X = t => padL + (t - t0) / (t1 - t0) * iw;
    const Y = v => padT + (1 - (v - yMin) / (yMax - yMin)) * ih;

    // grid + y labels
    ctx.font = FONT;
    ctx.strokeStyle = INK.grid; ctx.fillStyle = INK.label; ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const v = yMin + (yMax - yMin) * i / 3, y = Y(v);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillText(fmtTick(v), 4, y + 3);
    }
    // x labels: elapsed hours
    const spanH = (t1 - t0) / 3600;
    const stepH = spanH <= 16 ? 2 : spanH <= 50 ? 6 : 24;
    // centred on the tick; the last one sits flush right; skip any that would collide
    let lastRight = -Infinity;
    for (let hh = 0; hh <= spanH + 1e-6; hh += stepH) {
      const txt = `+${hh}h`, tw = ctx.measureText(txt).width;
      const left = Math.min(Math.max(X(t0 + hh * 3600) - tw / 2, padL - 6), w - padR - tw);
      if (left < lastRight + 6) continue;
      ctx.fillText(txt, left, h - 4);
      lastRight = left + tw;
    }

    // reserve band (battery chart)
    if (o.band != null) {
      ctx.fillStyle = INK.band;
      ctx.fillRect(padL, Y(o.band), iw, Y(0) - Y(o.band));
      ctx.strokeStyle = INK.bandLine;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(padL, Y(o.band)); ctx.lineTo(w - padR, Y(o.band)); ctx.stroke();
      ctx.setLineDash([]);
    }

    // compare overlay (faint)
    if (this.compare && this.compare.length > 1) {
      const c = this.compare, ct0 = c[0].t_s;
      ctx.globalAlpha = 0.4;
      for (const s of o.series.slice(0, 1)) {
        ctx.strokeStyle = s.color; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < c.length; i++) {
          const x = X(c[i].t_s - ct0 + t0), y = Y(c[i][s.key]);
          if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // series
    for (const s of o.series) {
      ctx.strokeStyle = s.color; ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      for (const r of rows) {
        const v = r[s.key]; if (v == null) { started = false; continue; }
        const x = X(r.t_s), y = Y(v);
        if (started) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        started = true;
      }
      ctx.stroke();
    }

    // cursor
    if (this.cursorS >= t0 && this.cursorS <= t1) {
      const x = X(this.cursorS);
      ctx.strokeStyle = INK.cursor; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, h - padB); ctx.stroke();
    }
  }
}

function fmtTick(v) {
  const a = Math.abs(v);
  if (a >= 1000) return (v / 1000).toFixed(1) + 'k';
  if (a >= 10) return v.toFixed(0);
  return v.toFixed(1);
}
