// The descent: a cross-section of the ground that the pickaxe digs through.
// Every correct answer breaks blocks straight down; rarer answers dig deeper.

const Dig = (() => {
  const W = 11, H = 90, S = 48, CX = 5, VIEW_ROWS = 9;
  const LAVA_Y = 72;

  const TEX_NAMES = [
    "grass_side", "dirt", "stone", "gravel", "obsidian", "lava_source_animated", "crack",
    "mineral_coal", "mineral_iron", "mineral_copper", "mineral_tin", "mineral_gold",
    "mineral_diamond", "mineral_mese",
    "tool_woodpick", "tool_stonepick", "tool_steelpick", "tool_mesepick", "tool_diamondpick",
  ];
  const tex = {};
  // particle colours for each block type
  const avg = { grass_side: "#5f8f3a", dirt: "#7a5232", stone: "#8a8a8a", gravel: "#857a72", obsidian: "#1c1830" };
  const ready = Promise.all(TEX_NAMES.map(n => new Promise(res => {
    const img = new Image();
    img.onload = () => { tex[n] = img; res(); };
    img.onerror = res;
    img.src = `textures/${n}.png`;
  })));

  const ORE_NAMES = {
    coal: "Coal", iron: "Iron", copper: "Copper", tin: "Tin", gold: "Gold", diamond: "Diamond", mese: "Mese crystal",
  };

  // Layers from the surface down. `ores` = chance per block for each ore.
  const LAYERS = [
    { from: 0,  name: "Surface",        ores: {} },
    { from: 4,  name: "Coal layer",     ores: { coal: .14 } },
    { from: 11, name: "Iron layer",     ores: { coal: .07, iron: .09, copper: .05, tin: .04 } },
    { from: 23, name: "Gold layer",     ores: { coal: .03, iron: .06, copper: .03, gold: .08 } },
    { from: 39, name: "Diamond layer",  ores: { iron: .03, gold: .05, diamond: .08 } },
    { from: 56, name: "Obsidian depths", ores: { diamond: .07, mese: .08 } },
    { from: LAVA_Y, name: "Lava lake",  ores: {} },
  ];
  const layerAt = y => { let l = LAYERS[0]; for (const L of LAYERS) if (y >= L.from) l = L; return l; };

  let canvas, ctx, rnd;
  let grid, playerY, camY, particles, popups, crack, swing, found, busy;
  let shakeT = 0, generation = 0;

  function mulberry(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function generate(seed) {
    rnd = mulberry(seed);
    grid = [];
    for (let y = 0; y < H; y++) {
      const row = [];
      for (let x = 0; x < W; x++) {
        let base;
        if (y === 0) base = "grass_side";
        else if (y < 4) base = (y === 3 && rnd() < .5) ? "stone" : "dirt";
        else if (y >= LAVA_Y) base = "lava";
        else if (y >= 60) base = rnd() < .75 ? "obsidian" : "stone";
        else if (y >= 56) base = rnd() < (y - 54) / 8 ? "obsidian" : "stone";
        else base = rnd() < .06 ? (y < 20 ? "dirt" : "gravel") : "stone";
        let ore = null;
        if (base === "stone" || base === "obsidian") {
          const L = layerAt(y);
          const boost = x === CX ? 1.6 : 1; // the shaft is a bit luckier
          let r = rnd();
          for (const [name, p] of Object.entries(L.ores)) {
            if (r < p * boost) { ore = name; break; }
            r -= p * boost;
          }
        }
        row.push({ base, ore, air: false });
      }
      grid.push(row);
    }
    // lava pockets just above the lava lake
    for (let y = 66; y < LAVA_Y; y++)
      for (let x = 0; x < W; x++)
        if (x !== CX && Math.abs(x - CX) > 1 && rnd() < (y - 64) / 14) grid[y][x] = { base: "lava", ore: null, air: false };
  }

  function reset(seed) {
    generation++;
    generate(seed);
    playerY = -1;
    camY = playerY - 2.5;
    particles = []; popups = []; crack = null; swing = 0; found = {}; busy = false;
  }

  function init(el) {
    canvas = el;
    canvas.width = W * S; canvas.height = VIEW_ROWS * S;
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    reset(1);
    ready.then(() => requestAnimationFrame(loop));
  }

  // ---------- digging ----------
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function dig(n) {
    busy = true;
    const myGen = generation;
    const stageMs = n > 6 ? 45 : 70;
    for (let i = 0; i < n; i++) {
      const ty = playerY + 1;
      if (ty >= LAVA_Y) break;
      const cell = grid[ty][CX];
      for (let s = 0; s < 5; s++) {
        crack = { y: ty, stage: s };
        swing = 1;
        Sound.hit(cell.base);
        await sleep(stageMs);
        if (myGen !== generation) return;
      }
      crack = null;
      burst(CX, ty, cell);
      Sound.brk(cell.base);
      if (cell.ore) {
        found[cell.ore] = (found[cell.ore] || 0) + 1;
        popups.push({ text: "+1 " + ORE_NAMES[cell.ore], x: CX, y: ty, t: 0, color: oreColor(cell.ore) });
        Sound.ore(cell.ore);
      }
      cell.air = true;
      // fall into the hole
      const from = playerY, start = performance.now();
      while (true) {
        const k = Math.min(1, (performance.now() - start) / 110);
        playerY = from + k;
        if (k >= 1) break;
        await sleep(16);
        if (myGen !== generation) return;
      }
      playerY = ty;
    }
    busy = false;
  }

  function clink() { shakeT = 1; Sound.clink(); }

  function oreColor(o) {
    return { coal: "#3a3a3a", iron: "#e2c0a0", copper: "#e0803a", tin: "#c8d0d8", gold: "#f5d742", diamond: "#5ef0ff", mese: "#fff04a" }[o];
  }

  function burst(x, y, cell) {
    const cols = [avg[texFor(cell.base)] || "#777"];
    if (cell.ore) cols.push(oreColor(cell.ore), oreColor(cell.ore));
    for (let i = 0; i < 18; i++) {
      particles.push({
        x: (x + .2 + Math.random() * .6) * S, y: (y + .2 + Math.random() * .6) * S,
        vx: (Math.random() - .5) * 5, vy: -Math.random() * 4 - 1,
        life: 40 + Math.random() * 20, size: 4 + Math.random() * 5,
        color: cols[i % cols.length],
      });
    }
  }

  // ---------- rendering ----------
  function texFor(base) { return base === "lava" ? "lava_source_animated" : base; }

  function pickFor(y) {
    if (y >= 39) return "tool_diamondpick";
    if (y >= 23) return "tool_mesepick";
    if (y >= 11) return "tool_steelpick";
    if (y >= 4) return "tool_stonepick";
    return "tool_woodpick";
  }

  let frame = 0;
  function loop() {
    frame++;
    const target = playerY - 2.5;
    camY += (target - camY) * 0.15;
    draw();
    requestAnimationFrame(loop);
  }

  function draw() {
    const shakeX = shakeT > 0 ? Math.sin(frame * 2) * 4 * shakeT : 0;
    shakeT = Math.max(0, shakeT - 0.08);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, shakeX, -camY * S);

    // sky
    const top = camY, bottom = camY + VIEW_ROWS;
    if (top < 0) {
      const g = ctx.createLinearGradient(0, top * S, 0, 0);
      g.addColorStop(0, "#4f8fe0"); g.addColorStop(1, "#a9d4ff");
      ctx.fillStyle = g;
      ctx.fillRect(-10, top * S - 2, W * S + 20, -top * S + 2);
      // a few square clouds
      ctx.fillStyle = "#ffffffcc";
      for (const [cx, cy, w] of [[1, -3.2, 3], [6.5, -2.6, 2.5], [9, -3.6, 1.5]]) ctx.fillRect(cx * S, cy * S, w * S, S * .35);
    }

    const y0 = Math.max(0, Math.floor(top)), y1 = Math.min(H - 1, Math.ceil(bottom));
    const lavaFrame = Math.floor(frame / 8) % 8;
    for (let y = y0; y <= y1; y++) {
      for (let x = 0; x < W; x++) {
        const c = grid[y][x];
        const px = x * S, py = y * S;
        if (c.base === "lava") {
          ctx.drawImage(tex.lava_source_animated, 0, lavaFrame * 16, 16, 16, px, py, S, S);
          continue;
        }
        if (c.base === "grass_side" && tex.dirt) ctx.drawImage(tex.dirt, px, py, S, S);
        const t = tex[texFor(c.base)];
        if (t) ctx.drawImage(t, px, py, S, S);
        if (c.ore && tex["mineral_" + c.ore]) ctx.drawImage(tex["mineral_" + c.ore], px, py, S, S);
        if (c.air) { // dug tunnel: dark back wall
          ctx.fillStyle = "rgba(10,6,4,.72)";
          ctx.fillRect(px, py, S, S);
        }
      }
    }

    // crack overlay on the block being mined
    if (crack && tex.crack) ctx.drawImage(tex.crack, 0, crack.stage * 16, 16, 16, CX * S, crack.y * S, S, S);

    // lighting: darker the deeper, with light around the pickaxe (lava glows)
    const depth = Math.max(0, playerY);
    const dark = Math.min(0.82, depth / 45);
    if (dark > 0.02) {
      const lx = (CX + .5) * S, ly = (playerY + 1) * S;
      const g = ctx.createRadialGradient(lx, ly, S * .8, lx, ly, S * 5.2);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(0,0,0,${dark})`);
      ctx.fillStyle = g;
      ctx.fillRect(-10, top * S, W * S + 20, VIEW_ROWS * S + S);
      // re-light lava
      if (bottom > LAVA_Y - 2) {
        const lg = ctx.createLinearGradient(0, (LAVA_Y - 3) * S, 0, LAVA_Y * S);
        lg.addColorStop(0, "rgba(255,120,20,0)"); lg.addColorStop(1, "rgba(255,120,20,.35)");
        ctx.fillStyle = lg;
        ctx.fillRect(0, (LAVA_Y - 3) * S, W * S, 3 * S);
      }
    }

    // pickaxe
    const pick = tex[pickFor(Math.max(0, playerY + 1))];
    if (pick) {
      swing = Math.max(0, swing - 0.12);
      const px = (CX + .5) * S, py = (playerY + .55) * S;
      ctx.save();
      ctx.translate(px - S * .35, py + S * .25);
      ctx.rotate(-0.2 + swing * 0.9 - (busy ? 0 : Math.sin(frame / 25) * 0.05));
      ctx.drawImage(pick, -S * .1, -S * .95, S * 1.05, S * 1.05);
      ctx.restore();
    }

    // particles
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.life--;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    particles = particles.filter(p => p.life > 0);

    // popups
    ctx.font = "bold 20px 'Courier New', monospace";
    ctx.textAlign = "center";
    for (const p of popups) {
      p.t++;
      const a = Math.max(0, 1 - p.t / 70);
      ctx.fillStyle = `rgba(0,0,0,${a})`;
      ctx.fillText(p.text, (p.x + .5) * S + 2, (p.y - p.t / 40) * S + 2);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, (p.x + .5) * S, (p.y - p.t / 40) * S);
      ctx.globalAlpha = 1;
    }
    popups = popups.filter(p => p.t < 70);
    ctx.restore();

    // HUD
    const d = Math.max(0, Math.round(playerY + 1));
    const label = `Depth ${d} · ${layerAt(d).name}`;
    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(0,0,0,.6)";
    ctx.fillRect(8, 8, ctx.measureText(label).width + 20, 34);
    ctx.fillStyle = "#fff";
    ctx.fillText(label, 18, 31);

    // depth bar on the right
    const bh = canvas.height - 40, bx = canvas.width - 22;
    ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.fillRect(bx - 4, 16, 16, bh + 8);
    for (const L of LAYERS) {
      const yy = 20 + (L.from / LAVA_Y) * bh;
      if (L.from >= LAVA_Y) break;
      ctx.fillStyle = { Surface: "#6b4", "Coal layer": "#555", "Iron layer": "#c9a58a", "Gold layer": "#f5d742", "Diamond layer": "#5ef0ff", "Obsidian depths": "#7a3cff" }[L.name];
      const next = LAYERS[LAYERS.indexOf(L) + 1].from;
      ctx.fillRect(bx, yy, 8, ((next - L.from) / LAVA_Y) * bh);
    }
    ctx.fillStyle = "#fff";
    ctx.fillRect(bx - 6, 20 + Math.min(1, d / LAVA_Y) * bh - 2, 20, 4);
  }

  return {
    init, reset, dig, clink,
    get busy() { return busy; },
    get depth() { return Math.max(0, playerY + 1); },
    get layer() { return layerAt(Math.max(0, playerY + 1)).name; },
    get found() { return { ...found }; },
    ORE_NAMES,
  };
})();

// ---------- synthesized sounds (no audio files) ----------
const Sound = (() => {
  let ac = null, muted = localStorage.getItem("rareore.muted") === "1";
  function ctx() {
    if (muted) return null;
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
    if (ac.state === "suspended") ac.resume();
    return ac;
  }
  function noise(dur, freq, vol) {
    const a = ctx(); if (!a) return;
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = 1.2;
    const g = a.createGain(); g.gain.value = vol;
    src.connect(f).connect(g).connect(a.destination);
    src.start();
  }
  function tone(freq, when, dur, type = "square", vol = .06) {
    const a = ctx(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, a.currentTime + when);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + when + dur);
    o.connect(g).connect(a.destination);
    o.start(a.currentTime + when); o.stop(a.currentTime + when + dur);
  }
  const soft = b => b === "dirt" || b === "grass_side" || b === "gravel";
  return {
    hit: b => noise(.06, soft(b) ? 500 : 1800, .25),
    brk: b => noise(.18, soft(b) ? 300 : 900, .45),
    clink: () => { tone(1400, 0, .08, "triangle", .08); tone(900, .05, .1, "triangle", .06); },
    ore: o => {
      const base = { coal: 330, iron: 392, copper: 370, tin: 415, gold: 523, diamond: 659, mese: 784 }[o] || 440;
      tone(base, 0, .12); tone(base * 1.25, .08, .12); tone(base * 1.5, .16, .2);
    },
    get muted() { return muted; },
    toggle() { muted = !muted; localStorage.setItem("rareore.muted", muted ? "1" : "0"); return muted; },
  };
})();
