// CSV / JSON export helpers — simulated data only, downloaded locally.
export function toCSV(rows, keys) {
  const esc = v => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = keys.join(',');
  const body = rows.map(r => keys.map(k => esc(r[k])).join(',')).join('\n');
  return head + '\n' + body + '\n';
}

export function download(filename, text, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
