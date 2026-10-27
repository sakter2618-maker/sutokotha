// Generates the product artwork as SVG. Every piece is drawn from its own thread colours
// and a seed taken from the SKU, so each product looks different but stays in the same family.
// Kantha is a running stitch, so most lines are drawn as dashes.

function rng(seedStr) {
  let h = 2166136261;
  for (const c of seedStr) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}
function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const COTTON = '#EEECE3';
const INDIGO = '#22306A';
const stitch = (c, w = 3, d = '9 6') => `fill="none" stroke="${c}" stroke-width="${w}" stroke-dasharray="${d}" stroke-linecap="round"`;

function wave(y, amp, len, x0, x1, phase) {
  let d = `M${x0} ${y}`;
  for (let x = x0; x <= x1; x += 10) d += ` L${x} ${(y + Math.sin((x / len) * Math.PI * 2 + phase) * amp).toFixed(1)}`;
  return d;
}
function lotus(cx, cy, r, c1, c2, petals = 8) {
  let s = '';
  for (let i = 0; i < petals; i++) {
    const a = (360 / petals) * i;
    s += `<ellipse cx="${cx}" cy="${cy - r * 0.55}" rx="${r * 0.22}" ry="${r * 0.5}" transform="rotate(${a} ${cx} ${cy})" ${stitch(c1, 3, '7 5')}/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.2}" ${stitch(c2, 3, '6 5')}/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 1.12}" ${stitch(c2, 2.5, '5 7')}/>`;
  return s;
}
function star(cx, cy, r, c) {
  cx = Number(cx); cy = Number(cy);
  let d = '';
  for (let i = 0; i < 4; i++) { const a = (Math.PI / 4) * i; d += `M${(cx - Math.cos(a) * r).toFixed(1)} ${(cy - Math.sin(a) * r).toFixed(1)} L${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)} `; }
  return `<path d="${d}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>`;
}
function diamond(cx, cy, r, c) {
  return `<path d="M${cx} ${cy - r} L${cx + r} ${cy} L${cx} ${cy + r} L${cx - r} ${cy} Z" fill="${c}"/>`;
}

function throwArt(p, R) {
  const [a, b, c] = p.threads;
  const ground = lum(a) > 0.35 ? INDIGO : COTTON;
  let s = `<rect width="800" height="800" fill="${ground}"/>`;
  s += `<rect x="40" y="40" width="720" height="720" ${stitch(c, 4, '12 7')}/><rect x="64" y="64" width="672" height="672" ${stitch(b, 3)}/>`;
  if (/jonaki/.test(p.slug)) {
    for (let i = 0; i < 70; i++) { const x = 100 + R() * 600, y = 100 + R() * 600; s += star(x.toFixed(0), y.toFixed(0), 6 + R() * 8, a); s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="2.6" fill="${c}"/>`; }
  } else {
    const phase = R() * 6, amp = 8 + R() * 14, len = 120 + R() * 120;
    for (let y = 104, i = 0; y < 700; y += 22, i++) s += `<path d="${wave(y, amp, len, 92, 708, phase + i * 0.35)}" ${stitch(i % 3 === 2 ? b : a, 3)}/>`;
    if (/mati/.test(p.slug)) for (let i = 0; i < 40; i++) { const x = 110 + R() * 580, y = 110 + R() * 580; s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="5" ry="10" transform="rotate(${(R() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" fill="${c}"/>`; }
  }
  s += `<circle cx="400" cy="400" r="112" fill="${ground}"/>` + lotus(400, 400, 92, /shapla/.test(p.slug) ? a : c, b, /shapla/.test(p.slug) ? 12 : 8);
  return s;
}
function scarfArt(p, R) {
  const [a, b, c] = p.threads;
  let s = `<rect width="800" height="800" fill="#E4E6EC"/>`;
  s += `<g transform="rotate(-8 400 400)"><rect x="210" y="40" width="380" height="720" fill="${a}"/>`;
  const step = 34 + Math.floor(R() * 10);
  for (let y = 120; y < 690; y += step) for (let x = 236; x < 580; x += step) {
    const off = (Math.floor((y - 120) / step) % 2) * step / 2;
    if (/golap/.test(p.slug)) s += `<circle cx="${x + off}" cy="${y}" r="6" fill="${b}"/><circle cx="${x + off}" cy="${y}" r="2" fill="${c}"/>`;
    else if (/tara/.test(p.slug)) s += star(x + off, y, 8, b);
    else if (/dhaka/.test(p.slug)) { s += `<path d="M${x} 80 V720" stroke="${b}" stroke-width="1.5" opacity=".7"/><path d="M210 ${y} H590" stroke="${b}" stroke-width="1.5" opacity=".7"/>`; }
    else s += diamond(x + off, y, 7, b);
  }
  s += `<rect x="210" y="40" width="380" height="54" fill="${c}"/><rect x="210" y="706" width="380" height="54" fill="${c}"/>`;
  for (let x = 216; x < 590; x += 12) s += `<path d="M${x} 760 v26" stroke="${a}" stroke-width="3"/><path d="M${x} 40 v-26" stroke="${a}" stroke-width="3"/>`;
  return s + '</g>';
}
function cushionArt(p, R) {
  const [a, b, c] = p.threads;
  const ground = lum(a) > 0.35 ? INDIGO : COTTON;
  const lumbar = /lumbar/.test(p.slug);
  const w = lumbar ? 640 : 560, h = lumbar ? 380 : 560, x = (800 - w) / 2, y = (800 - h) / 2;
  let s = `<rect width="800" height="800" fill="#DDE1E8"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="${ground}"/>`;
  for (let i = 0; i < 4; i++) s += `<rect x="${x + 26 + i * 22}" y="${y + 26 + i * 22}" width="${w - 52 - i * 44}" height="${h - 52 - i * 44}" rx="8" ${stitch(i % 2 ? b : a, 3)}/>`;
  if (/jonaki/.test(p.slug)) for (let i = 0; i < 26; i++) s += star((x + 140 + R() * (w - 280)).toFixed(0), (y + 140 + R() * (h - 280)).toFixed(0), 8, a);
  else s += lotus(400, 400, lumbar ? 64 : 92, c, b, /shapla/.test(p.slug) ? 12 : 8);
  return s;
}
function runnerArt(p, R) {
  const [a, b, c] = p.threads;
  let s = `<rect width="800" height="800" fill="#C9B79C"/>`;
  for (let y = 0; y < 800; y += 40) s += `<path d="M0 ${y + R() * 6} H800" stroke="#B8A486" stroke-width="2"/>`;
  if (/napkins|placemats/.test(p.slug)) {
    const pm = /placemats/.test(p.slug);
    [[110, 110], [430, 110], [110, 430], [430, 430]].slice(0, pm ? 2 : 4).forEach(([x, y], i) => {
      const W = pm ? 580 : 260, H = pm ? 260 : 260; const yy = pm ? 120 + i * 300 : y;
      const xx = pm ? 110 : x; const col = p.threads[i % 3];
      s += `<rect x="${xx}" y="${yy}" width="${W}" height="${H}" fill="${pm ? a : COTTON}"/>`;
      if (pm) { for (let gx = xx + 20; gx < xx + W; gx += 30) s += `<path d="M${gx} ${yy} v${H}" stroke="${b}" stroke-width="1.5" opacity=".7"/>`; for (let gy = yy + 20; gy < yy + H; gy += 30) s += `<path d="M${xx} ${gy} h${W}" stroke="${b}" stroke-width="1.5" opacity=".7"/>`; }
      else { s += `<rect x="${xx + 14}" y="${yy + 14}" width="${W - 28}" height="${H - 28}" ${stitch(col, 2.5)}/>` + lotus(xx + 60, yy + 60, 30, col, INDIGO, 6); }
    });
    return s;
  }
  s += `<rect x="40" y="250" width="720" height="300" fill="${COTTON}"/>`;
  if (/leaf/.test(p.slug)) {
    s += `<path d="${wave(400, 40, 220, 70, 730, 0)}" ${stitch(a, 3)}/>`;
    for (let x = 100; x < 720; x += 46) { const yy = 400 + Math.sin((x / 220) * Math.PI * 2) * 40; const up = (x / 46) % 2 > 1 ? -1 : 1; s += `<ellipse cx="${x}" cy="${(yy + up * 26).toFixed(0)}" rx="10" ry="22" transform="rotate(${up * 35} ${x} ${(yy + up * 26).toFixed(0)})" ${stitch(a, 2.5, '5 4')}/>`; }
  }
  for (const x0 of [60, 640]) for (let i = 0; i < 6; i++) s += `<path d="M${x0 + i * 18} 268 V532" ${stitch(p.threads[i % 3], 3, '8 5')}/>`;
  s += `<rect x="52" y="262" width="696" height="276" ${stitch(b, 2.5)}/>`;
  return s;
}
function toteArt(p, R) {
  const [a, b, c] = p.threads;
  const pouch = /pouch/.test(p.slug);
  let s = `<rect width="800" height="800" fill="#E6E2D8"/>`;
  const x = pouch ? 190 : 170, y = pouch ? 260 : 250, w = pouch ? 420 : 460, h = pouch ? 300 : 440;
  if (!pouch) s += `<path d="M${x + 110} ${y} C${x + 110} ${y - 190}, ${x + w - 110} ${y - 190}, ${x + w - 110} ${y}" fill="none" stroke="${INDIGO}" stroke-width="22"/>`;
  s += `<clipPath id="bag"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/></clipPath><g clip-path="url(#bag)">`;
  if (/patchwork|pouch/.test(p.slug)) {
    for (let yy = y; yy < y + h; yy += 92) for (let xx = x; xx < x + w; xx += 92) {
      const col = [a, b, c, INDIGO, COTTON][Math.floor(R() * 5)];
      s += `<rect x="${xx}" y="${yy}" width="92" height="92" fill="${col}"/>`;
      for (let k = 12; k < 92; k += 16) s += `<path d="M${xx + 6} ${yy + k} H${xx + 86}" ${stitch(lum(col) > 0.4 ? INDIGO : COTTON, 2, '6 5')}/>`;
    }
  } else {
    const ground = lum(a) > 0.35 ? INDIGO : a;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ground}"/>`;
    if (/jonaki/.test(p.slug)) for (let i = 0; i < 30; i++) s += star((x + 30 + R() * (w - 60)).toFixed(0), (y + 30 + R() * (h - 60)).toFixed(0), 8, p.threads[0]);
    else for (let yy = y + 20; yy < y + h; yy += 20) s += `<path d="M${x} ${yy} H${x + w}" ${stitch(b, 2.5)}/>`;
  }
  s += `</g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="${INDIGO}" stroke-width="6"/>`;
  if (pouch) s += `<path d="M${x} ${y + 18} H${x + w}" stroke="${INDIGO}" stroke-width="8"/><circle cx="${x + w - 30}" cy="${y + 18}" r="10" fill="${c}"/>`;
  return s;
}
const ART = { throw: throwArt, scarf: scarfArt, cushion: cushionArt, runner: runnerArt, tote: toteArt };

function productSvg(p, artType) {
  const R = rng(p.sku);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img" aria-label="${p.name}">${ART[artType](p, R)}</svg>`;
}
function heroSvg() {
  const p = { sku: 'HERO', slug: 'hero-nodi', threads: ['#22306A', '#3C7A57', '#DFA422'] };
  const R = rng('HERO');
  let s = `<rect width="800" height="800" fill="${COTTON}"/>`;
  const rowsCols = ['#22306A', '#22306A', '#3C7A57', '#22306A', '#C4426B', '#22306A', '#3C7A57'];
  for (let y = 60, i = 0; y < 760; y += 20, i++) s += `<path d="${wave(y, 14, 260, 40, 760, i * 0.3)}" ${stitch(rowsCols[i % rowsCols.length], 3)}/>`;
  s += `<circle cx="520" cy="300" r="150" fill="${COTTON}"/>` + lotus(520, 300, 120, '#C4426B', '#DFA422', 12);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">${s}</svg>`;
}
module.exports = { productSvg, heroSvg };
