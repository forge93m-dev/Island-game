// Rare Ore — a Minecraft rarity trivia game.
// Give a correct answer to each prompt; the rarer the answer, the more points.

const ROUND_LEN = 7;
const TIME_PER_Q = 25;

const $ = id => document.getElementById(id);

// ---------- answer parsing & matching ----------
function norm(s) {
  return s.toLowerCase()
    .replace(/^minecraft:/, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
function variants(s) {
  const n = norm(s);
  const out = new Set([n]);
  const strip = n.replace(/^block of /, "").replace(/ block$/, "");
  out.add(strip);
  for (const v of [...out]) {
    if (v.endsWith("es")) out.add(v.slice(0, -2));
    if (v.endsWith("s")) out.add(v.slice(0, -1));
    out.add(v.replace(/ /g, ""));
  }
  return [...out].filter(Boolean);
}
function parseAnswers(list) {
  const seen = new Map();
  for (const e of list) {
    const [name, r, alias] = e.split("|");
    const key = norm(name);
    if (seen.has(key)) continue; // first entry wins
    const keys = new Set();
    for (const a of [name, ...(alias ? alias.split(",") : [])]) variants(a).forEach(v => keys.add(v));
    seen.set(key, { name, rarity: Number(r), keys });
  }
  return [...seen.values()];
}
function lev(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function match(input, answers) {
  const inVars = variants(input);
  for (const a of answers) if (inVars.some(v => a.keys.has(v))) return a;
  // forgive one typo on longer words
  const n = norm(input);
  if (n.length >= 5) {
    for (const a of answers)
      for (const k of a.keys) if (k.length >= 5 && lev(n, k) <= 1) return a;
  }
  return null;
}

// ---------- seeded random for daily mode ----------
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function shuffle(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- state ----------
let state = null;
let timerId = null;

function show(screen) {
  for (const s of document.querySelectorAll(".screen")) s.hidden = s.id !== screen;
}

function startRound(daily) {
  const rnd = daily ? mulberry32([...todayKey()].reduce((h, c) => h * 31 + c.charCodeAt(0), 7)) : Math.random;
  // Always include at least two "new blocks" prompts so recent updates show up.
  const newer = shuffle(PROMPTS.filter(p => p.tag === "New blocks"), rnd).slice(0, 2);
  const rest = shuffle(PROMPTS.filter(p => !newer.includes(p)), rnd).slice(0, ROUND_LEN - 2);
  const prompts = shuffle([...newer, ...rest], rnd).map(p => ({ ...p, parsed: parseAnswers(p.answers) }));
  state = { daily, prompts, i: 0, score: 0, results: [] };
  show("play");
  nextPrompt();
}

function nextPrompt() {
  const p = state.prompts[state.i];
  $("qnum").textContent = `${state.i + 1} / ${ROUND_LEN}`;
  $("qtag").textContent = p.tag;
  $("question").textContent = p.q;
  $("score").textContent = state.score;
  $("answer").value = "";
  $("answer").disabled = false;
  $("feedback").innerHTML = "";
  $("reveal").hidden = true;
  $("inputRow").hidden = false;
  $("answer").focus();
  state.left = TIME_PER_Q;
  updateTimer();
  clearInterval(timerId);
  timerId = setInterval(() => {
    state.left--;
    updateTimer();
    if (state.left <= 0) finishPrompt(null, true);
  }, 1000);
}

function updateTimer() {
  $("timer").textContent = state.left;
  $("timebar").style.width = `${(state.left / TIME_PER_Q) * 100}%`;
  $("timebar").classList.toggle("low", state.left <= 5);
}

function submit() {
  const val = $("answer").value.trim();
  if (!val) return;
  const p = state.prompts[state.i];
  const hit = match(val, p.parsed);
  if (!hit) {
    // wrong answers cost time, not the question
    $("feedback").innerHTML = `<span class="bad">“${escapeHtml(val)}” doesn’t count. Try again!</span>`;
    $("answer").value = "";
    state.left = Math.max(1, state.left - 3);
    updateTimer();
    shake();
    return;
  }
  finishPrompt(hit, false);
}

function finishPrompt(hit, timedOut) {
  clearInterval(timerId);
  const p = state.prompts[state.i];
  const tier = hit ? TIERS[hit.rarity] : null;
  const pts = tier ? tier.pts : 0;
  state.score += pts;
  state.results.push({ q: p.q, answer: hit ? hit.name : null, rarity: hit ? hit.rarity : 0, pts });
  $("score").textContent = state.score;
  $("answer").disabled = true;
  $("inputRow").hidden = true;

  let html = "";
  if (hit) {
    html += `<div class="tier" style="--c:${tier.color}"><div class="ore" style="--c:${tier.color}"></div>
      <div><div class="tname">${tier.name} tier</div><div class="tans">${escapeHtml(hit.name)}</div></div>
      <div class="tpts">+${pts}</div></div>`;
  } else {
    html += `<div class="tier miss"><div><div class="tname">${timedOut ? "Time’s up!" : "Skipped"}</div>
      <div class="tans">No points this time</div></div><div class="tpts">+0</div></div>`;
  }
  const common = p.parsed.filter(a => a.rarity <= 2).slice(0, 5).map(a => a.name);
  const rare = shuffle(p.parsed.filter(a => a.rarity >= 5), Math.random).slice(0, 5).map(a => a.name);
  html += `<div class="examples">
    ${common.length ? `<p><b>Everyone says:</b> ${common.map(escapeHtml).join(", ")}</p>` : ""}
    ${rare.length ? `<p><b>Deep cuts:</b> ${rare.map(escapeHtml).join(", ")}</p>` : ""}
    <p class="muted">${p.parsed.length} valid answers in total</p></div>`;
  $("reveal").innerHTML = html + `<button id="nextBtn" class="btn">${state.i + 1 < ROUND_LEN ? "Next ▶" : "See results"}</button>`;
  $("reveal").hidden = false;
  $("nextBtn").onclick = advance;
  $("nextBtn").focus();
}

function advance() {
  state.i++;
  if (state.i < ROUND_LEN) nextPrompt();
  else endRound();
}

function rankFor(score) {
  const max = ROUND_LEN * 100;
  const r = score / max;
  if (r >= 0.85) return "Ancient Debris Hunter";
  if (r >= 0.7) return "Diamond Miner";
  if (r >= 0.5) return "Gold Prospector";
  if (r >= 0.3) return "Iron Digger";
  if (r > 0) return "Cobble Collector";
  return "Lost in the Caves";
}

function endRound() {
  show("results");
  const key = state.daily ? "rareore.best.daily" : "rareore.best";
  const best = Math.max(state.score, Number(localStorage.getItem(key) || 0));
  localStorage.setItem(key, best);
  if (state.daily) localStorage.setItem("rareore.daily." + todayKey(), state.score);
  $("final").textContent = state.score;
  $("rank").textContent = rankFor(state.score);
  $("best").textContent = `Best ${state.daily ? "daily " : ""}score: ${best} / ${ROUND_LEN * 100}`;
  $("summary").innerHTML = state.results.map(r => {
    const t = TIERS[r.rarity];
    return `<li><span class="sq" style="background:${t ? t.color : "#333"}"></span>
      <span class="sq-q">${escapeHtml(r.q)}</span>
      <span class="sq-a">${r.answer ? escapeHtml(r.answer) : "—"}</span>
      <span class="sq-p">${r.pts}</span></li>`;
  }).join("");
}

function shareText() {
  const squares = state.results.map(r => ["⬛", "🟫", "⬜", "🩶", "🟨", "🟦", "🟪"][r.rarity]).join("");
  return `Rare Ore ${state.daily ? todayKey() : ""}\n${squares}\n${state.score}/${ROUND_LEN * 100} — ${rankFor(state.score)}`;
}

function shake() {
  const el = $("answer");
  el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake");
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- new blocks guide ----------
function buildGuide() {
  $("guideList").innerHTML = UPDATES.slice().reverse().map(u => `
    <section class="upd">
      <h3>${u.name} <small>${u.version} · ${u.year}${u.status !== "released" ? ` · <em>${u.status}</em>` : ""}</small></h3>
      <div class="chips">${u.blocks.map(b => `<span class="chip">${escapeHtml(b.split("|")[0])}</span>`).join("")}</div>
    </section>`).join("");
}

// ---------- wiring ----------
$("playBtn").onclick = () => startRound(false);
$("dailyBtn").onclick = () => startRound(true);
$("guideBtn").onclick = () => show("guide");
$("howBtn").onclick = () => show("how");
for (const b of document.querySelectorAll("[data-home]")) b.onclick = () => { clearInterval(timerId); show("menu"); refreshMenu(); };
$("againBtn").onclick = () => startRound(state.daily);
$("shareBtn").onclick = async () => {
  try { await navigator.clipboard.writeText(shareText()); $("shareBtn").textContent = "Copied!"; }
  catch { prompt("Copy your result:", shareText()); }
  setTimeout(() => ($("shareBtn").textContent = "Copy result"), 1500);
};
$("submitBtn").onclick = submit;
$("skipBtn").onclick = () => finishPrompt(null, false);
$("answer").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); submit(); } });

function refreshMenu() {
  const d = localStorage.getItem("rareore.daily." + todayKey());
  $("dailyBtn").textContent = d !== null ? `Daily dig (today: ${d})` : "Daily dig";
  $("menuBest").textContent = `Best: ${localStorage.getItem("rareore.best") || 0}`;
}

buildGuide();
refreshMenu();
show("menu");
