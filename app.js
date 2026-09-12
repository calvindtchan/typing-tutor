"use strict";

/* ============================================================
   Typing Tutor '92 — an original retro typing tutor for the web
   ============================================================ */

const $ = (sel) => document.querySelector(sel);
const scenes = ["boot", "menu", "lessons", "drill", "results", "game", "progress"];
let state = "boot";
let resultsReturn = "menu"; // where Enter on the results screen goes

function show(scene) {
  scenes.forEach((s) => $("#" + s).classList.toggle("hidden", s !== scene));
  state = scene;
}

/* ---------------- persistence ---------------- */

const STORE_KEY = "tt92.progress.v1";

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch {
    return {};
  }
}
function saveStore(data) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch {
    /* private mode: play without saving */
  }
}
let store = loadStore();
store.lessons = store.lessons || {};

/* ---------------- lesson data (original drills) ---------------- */

const LESSONS = [
  { id: "a", name: "Home Row: F and J", lines: [
    "fff jjj fff jjj fjf jfj ffj jjf",
    "fj jf fjj jff fjfj jfjf fj fj",
    "jjf ffj fjf jfj fj jf fj jf ff",
  ]},
  { id: "b", name: "Home Row: D and K", lines: [
    "ddd kkk ddd kkk dkd kdk dkk kdd",
    "dk kd fd jk dfk jkd fdk kjd kd",
    "fdk jkd dkf kdj fjdk jfkd dk kd",
  ]},
  { id: "c", name: "Home Row: S and L", lines: [
    "sss lll sss lll sls lsl ssl lls",
    "sl ls sd lk sf lj slf lsd fls",
    "sdfk jkls fdsl jkls slsl lsls",
  ]},
  { id: "d", name: "Home Row: A and ;", lines: [
    "aaa ;;; aaa ;;; a;a ;a; aa; ;;a",
    "asdf jkl; asdf jkl; fdsa ;lkj",
    "a;sl dkfj fjdk sla; asdf jkl;",
  ]},
  { id: "e", name: "Home Row Words", lines: [
    "as ask lad sad dad fad fall lass",
    "all salad flask alas dads falls",
    "a lad asks; a sad lass falls;",
  ]},
  { id: "f", name: "Reach Up: E and I", lines: [
    "ded kik ded kik ede iki dei ike",
    "see die lie fee did side life",
    "a fine idea; sail said seaside;",
  ]},
  { id: "g", name: "Reach Up: R and U", lines: [
    "frf juj frf juj rfr uju fru jur",
    "rug fur run sure rude lure user",
    "a rare russet; four rural rules;",
  ]},
  { id: "h", name: "Reach Up: T, Y, W, O", lines: [
    "ftf jyj sws lol tfy ywo wot toy",
    "two tow yet wet owl slow world",
    "we owe you two toys; try it out;",
  ]},
  { id: "i", name: "Reach Down: C, V, M, N", lines: [
    "dcd fvf jmj jnj cvm nvc mcn vnm",
    "can van man nice mice cave move",
    "seven canvas vans move in a line",
  ]},
  { id: "j", name: "Full Alphabet", lines: [
    "the quick brown fox jumps over a",
    "lazy dog while jovial bakers mix",
    "sixty fudge cakes with real zest",
  ]},
  { id: "k", name: "Capitals and Shift", lines: [
    "Ask Dan and Kate to sail to Rio.",
    "Jill and Frank liked Lake Huron.",
    "The Kids Typed Fast All Morning.",
  ]},
  { id: "l", name: "Numbers and Symbols", lines: [
    "12 34 56 78 90 10 29 38 47 56",
    "add 12 + 34; take 90 - 56 = 34",
    "call (555) 123-4567 by 10:30!",
  ]},
];

/* one-minute speed test text (original) */
const TEST_TEXT = [
  "learning to type well is a gift that keeps on giving.",
  "your hands rest on the home row and your eyes stay on",
  "the screen, never on the keys. speed comes later; the",
  "secret at the start is accuracy, calm and steady. each",
  "mistake you avoid is faster than any burst of hurry.",
  "practice a little every day and the letters will soon",
  "feel like old friends under your fingertips. before",
  "long you will write as quickly as you think, and the",
  "keyboard will simply disappear beneath your hands.",
];

/* ---------------- boot screen ---------------- */

const BOOT_LINES = [
  "TT-BIOS (C) 1992 RETROSOFT SYSTEMS",
  "640K RAM ................ OK",
  "Keyboard ................ DETECTED",
  "Loading TYPETUT.EXE ..........",
  "",
  "  ████████╗ TYPING TUTOR '92",
  "  Ready.",
];

let bootDone = false;
function runBoot() {
  const el = $("#boot-text");
  el.textContent = "";
  let i = 0;
  bootDone = false;
  const tick = setInterval(() => {
    if (i >= BOOT_LINES.length) {
      clearInterval(tick);
      $("#boot-prompt").classList.remove("hidden");
      bootDone = true;
      return;
    }
    el.textContent += BOOT_LINES[i] + "\n";
    i++;
  }, 300);
}

/* ---------------- menu ---------------- */

function enterMenu() {
  show("menu");
  const best = [];
  if (store.testBestWpm) best.push(`Best test: ${store.testBestWpm} WPM`);
  if (store.gameHigh) best.push(`Letter Storm high score: ${store.gameHigh}`);
  $("#menu-best").textContent = best.join("   •   ");
}

document.querySelectorAll(".menu-item").forEach((el) => {
  el.addEventListener("click", () => handleMenuChoice(el.dataset.key));
});

function handleMenuChoice(key) {
  if (key === "1") enterLessonSelect();
  else if (key === "2") startDrill(null);
  else if (key === "3") startGame();
  else if (key === "4") enterProgress();
}

/* ---------------- lesson select ---------------- */

function enterLessonSelect() {
  const list = $("#lesson-list");
  list.innerHTML = "";
  LESSONS.forEach((les) => {
    const div = document.createElement("div");
    div.className = "lesson-item";
    const rec = store.lessons[les.id];
    div.innerHTML =
      `<span class="hotkey">${les.id.toUpperCase()}</span>${les.name}` +
      (rec ? `<span class="best">★ ${rec.bestWpm} wpm</span>` : "");
    div.addEventListener("click", () => startDrill(les));
    list.appendChild(div);
  });
  show("lessons");
}

/* ---------------- on-screen keyboard ---------------- */

const KBD_ROWS = [
  ["`","1","2","3","4","5","6","7","8","9","0","-","="],
  ["q","w","e","r","t","y","u","i","o","p","[","]"],
  ["a","s","d","f","g","h","j","k","l",";","'"],
  ["z","x","c","v","b","n","m",",",".","/"],
  ["SPACE"],
];
const HOME_KEYS = new Set(["a","s","d","f","j","k","l",";"]);
const SHIFT_MAP = {
  "!":"1","@":"2","#":"3","$":"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",
  "_":"-","+":"=","{":"[","}":"]",":":";","\"":"'","<":",",">":".","?":"/","~":"`",
};

function buildKeyboard() {
  const kbd = $("#kbd");
  kbd.innerHTML = "";
  KBD_ROWS.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "kbd-row";
    row.forEach((k) => {
      const keyEl = document.createElement("div");
      keyEl.className = "key" + (k === "SPACE" ? " space" : "") + (HOME_KEYS.has(k) ? " homekey" : "");
      keyEl.dataset.key = k;
      keyEl.textContent = k === "SPACE" ? "" : k.toUpperCase();
      rowEl.appendChild(keyEl);
    });
    kbd.appendChild(rowEl);
  });
}

function highlightKey(ch) {
  document.querySelectorAll("#kbd .key.next").forEach((el) => el.classList.remove("next"));
  if (ch == null) return;
  let k = ch === " " ? "SPACE" : ch.toLowerCase();
  if (SHIFT_MAP[ch]) k = SHIFT_MAP[ch];
  const el = document.querySelector(`#kbd .key[data-key="${CSS.escape(k)}"]`);
  if (el) el.classList.add("next");
}

/* ---------------- drill engine ---------------- */

const drill = {
  lesson: null,      // null = speed test
  lines: [],
  lineIdx: 0,
  charIdx: 0,
  keystrokes: 0,
  errors: 0,
  correct: 0,
  started: null,
  timer: null,
  timeLimit: 0,      // seconds; 0 = untimed
  wrongFlash: false,
};

function startDrill(lesson) {
  drill.lesson = lesson;
  drill.lines = lesson ? lesson.lines.slice() : TEST_TEXT.slice();
  drill.lineIdx = 0;
  drill.charIdx = 0;
  drill.keystrokes = 0;
  drill.errors = 0;
  drill.correct = 0;
  drill.started = null;
  drill.timeLimit = lesson ? 0 : 60;
  drill.wrongFlash = false;
  clearInterval(drill.timer);

  $("#drill-title").textContent = lesson ? "LESSON — " + lesson.name.toUpperCase() : "ONE-MINUTE SPEED TEST";
  $("#st-time-wrap").classList.toggle("hidden", !drill.timeLimit);
  $("#st-time").textContent = drill.timeLimit;
  buildKeyboard();
  renderDrill();
  show("drill");
}

function drillElapsedMin() {
  if (!drill.started) return 0;
  return (Date.now() - drill.started) / 60000;
}

function drillWpm() {
  const min = drillElapsedMin();
  if (min <= 0) return 0;
  return Math.round((drill.correct / 5) / min);
}

function drillAcc() {
  if (!drill.keystrokes) return 100;
  return Math.max(0, Math.round((1 - drill.errors / drill.keystrokes) * 100));
}

function renderDrill() {
  const line = drill.lines[drill.lineIdx] ?? "";
  const cur = $("#line-current");
  cur.innerHTML = "";
  for (let i = 0; i < line.length; i++) {
    const span = document.createElement("span");
    span.textContent = line[i];
    if (i < drill.charIdx) span.className = "done";
    else if (i === drill.charIdx) span.className = drill.wrongFlash ? "wrong" : "cursor";
    else span.className = "todo";
    cur.appendChild(span);
  }
  $("#line-next").textContent = drill.lines[drill.lineIdx + 1] ?? "";
  $("#line-next2").textContent = drill.lines[drill.lineIdx + 2] ?? "";
  $("#st-wpm").textContent = drillWpm();
  $("#st-acc").textContent = drillAcc() + "%";
  $("#st-err").textContent = drill.errors;
  $("#st-line").textContent = (drill.lineIdx + 1) + "/" + drill.lines.length;
  highlightKey(line[drill.charIdx]);
}

function startDrillClock() {
  drill.started = Date.now();
  drill.timer = setInterval(() => {
    $("#st-wpm").textContent = drillWpm();
    if (drill.timeLimit) {
      const left = Math.max(0, drill.timeLimit - Math.floor((Date.now() - drill.started) / 1000));
      $("#st-time").textContent = left;
      if (left <= 0) finishDrill();
    }
  }, 250);
}

function drillKey(ch) {
  const line = drill.lines[drill.lineIdx];
  if (line == null) return;
  if (!drill.started) startDrillClock();

  drill.keystrokes++;
  if (ch === line[drill.charIdx]) {
    drill.correct++;
    drill.charIdx++;
    drill.wrongFlash = false;
    if (drill.charIdx >= line.length) {
      drill.lineIdx++;
      drill.charIdx = 0;
      // space between lines counts as a free correct char for wpm fairness
      drill.correct++;
      if (drill.lineIdx >= drill.lines.length) {
        if (drill.timeLimit) {
          // looping text for the timed test
          drill.lineIdx = 0;
        } else {
          finishDrill();
          return;
        }
      }
    }
  } else {
    drill.errors++;
    drill.wrongFlash = true;
  }
  renderDrill();
}

function finishDrill() {
  clearInterval(drill.timer);
  const wpm = drillWpm();
  const acc = drillAcc();
  const secs = drill.started ? Math.round((Date.now() - drill.started) / 1000) : 0;

  let title, extra = "";
  if (drill.lesson) {
    title = drill.lesson.name;
    const rec = store.lessons[drill.lesson.id] || { bestWpm: 0, bestAcc: 0 };
    if (wpm > rec.bestWpm) { rec.bestWpm = wpm; extra += "\n  ★ NEW PERSONAL BEST SPEED!"; }
    if (acc > rec.bestAcc) rec.bestAcc = acc;
    store.lessons[drill.lesson.id] = rec;
  } else {
    title = "One-Minute Speed Test";
    if (wpm > (store.testBestWpm || 0)) { store.testBestWpm = wpm; extra += "\n  ★ NEW PERSONAL BEST SPEED!"; }
  }
  saveStore(store);

  let grade;
  if (acc >= 98 && wpm >= 30) grade = "A  — outstanding!";
  else if (acc >= 95 && wpm >= 20) grade = "B  — very good";
  else if (acc >= 90) grade = "C  — keep practicing";
  else grade = "D  — slow down, aim for accuracy";

  $("#results-body").textContent =
    `  ${title}\n` +
    `  ${"─".repeat(40)}\n` +
    `  Speed ............ ${wpm} words per minute\n` +
    `  Accuracy ......... ${acc}%\n` +
    `  Errors ........... ${drill.errors}\n` +
    `  Time ............. ${secs} seconds\n` +
    `  Grade ............ ${grade}` +
    extra;
  resultsReturn = drill.lesson ? "lessons" : "menu";
  show("results");
}

/* ---------------- Letter Storm (original arcade mode) ---------------- */

const GAME_WORDS = [
  "cat","dog","sun","map","run","top","red","box","jam","kit",
  "frog","star","ship","moon","cake","wind","jump","play","fish","gold",
  "storm","cloud","piano","grape","tiger","robot","comet","maple","quilt","zebra",
];

const game = {
  running: false,
  items: [],        // {text, typed, x, y, speed}
  score: 0,
  level: 1,
  lives: 3,
  cleared: 0,
  spawnTimer: 0,
  lastTime: 0,
  target: null,
  raf: null,
};

function startGame() {
  const c = $("#g-canvas");
  game.running = true;
  game.items = [];
  game.score = 0;
  game.level = 1;
  game.lives = 3;
  game.cleared = 0;
  game.spawnTimer = 0;
  game.lastTime = performance.now();
  game.target = null;
  $("#g-high").textContent = store.gameHigh || 0;
  updateGameHud();
  show("game");
  cancelAnimationFrame(game.raf);
  game.raf = requestAnimationFrame(gameLoop);
}

function updateGameHud() {
  $("#g-score").textContent = game.score;
  $("#g-level").textContent = game.level;
  $("#g-lives").textContent = "♥".repeat(game.lives) || "—";
}

function spawnItem(canvas) {
  const useWord = game.level >= 2 && Math.random() < Math.min(0.7, 0.25 + game.level * 0.1);
  let text;
  if (useWord) {
    const pool = GAME_WORDS.filter((w) => w.length <= 2 + game.level);
    text = pool[Math.floor(Math.random() * pool.length)];
  } else {
    text = "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  }
  const margin = 40;
  game.items.push({
    text,
    typed: 0,
    x: margin + Math.random() * (canvas.width - margin * 2 - text.length * 14),
    y: -10,
    speed: 18 + game.level * 7 + Math.random() * 10, // px per second
  });
}

function gameLoop(now) {
  if (!game.running) return;
  const canvas = $("#g-canvas");
  const ctx = canvas.getContext("2d");
  const dt = Math.min(0.05, (now - game.lastTime) / 1000);
  game.lastTime = now;

  // spawn cadence speeds up with level
  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0) {
    spawnItem(canvas);
    game.spawnTimer = Math.max(0.7, 2.4 - game.level * 0.18);
  }

  const floor = canvas.height - 24;
  for (const it of game.items) it.y += it.speed * dt;

  // landed items cost a life
  const landed = game.items.filter((it) => it.y >= floor);
  if (landed.length) {
    game.items = game.items.filter((it) => it.y < floor);
    if (landed.includes(game.target)) game.target = null;
    game.lives -= landed.length;
    if (game.lives <= 0) {
      game.lives = 0;
      updateGameHud();
      endGame();
      return;
    }
    updateGameHud();
  }

  // draw
  ctx.fillStyle = "#000033";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#5555ff";
  ctx.fillRect(0, floor + 12, canvas.width, 4);
  ctx.font = "26px 'VT323', monospace";
  for (const it of game.items) {
    const done = it.text.slice(0, it.typed);
    const rest = it.text.slice(it.typed);
    ctx.fillStyle = it === game.target ? "#ffff55" : "#55ff55";
    ctx.fillText(done, it.x, it.y);
    ctx.fillStyle = it === game.target ? "#ffffff" : "#aaaaaa";
    ctx.fillText(rest, it.x + ctx.measureText(done).width, it.y);
  }

  game.raf = requestAnimationFrame(gameLoop);
}

function gameKey(ch) {
  if (!game.running) return;
  // lock onto a target, or pick the lowest item starting with this letter
  if (!game.target || !game.items.includes(game.target)) {
    game.target = null;
    let best = null;
    for (const it of game.items) {
      if (it.text[0] === ch && (!best || it.y > best.y)) best = it;
    }
    if (!best) return;
    game.target = best;
  }
  const t = game.target;
  if (t.text[t.typed] === ch) {
    t.typed++;
    if (t.typed >= t.text.length) {
      game.items = game.items.filter((it) => it !== t);
      game.target = null;
      game.score += t.text.length * 10;
      game.cleared++;
      if (game.cleared % 10 === 0) game.level++;
      updateGameHud();
    }
  } else {
    // typo: drop the lock and lose a few points
    t.typed = 0;
    game.target = null;
    game.score = Math.max(0, game.score - 5);
    updateGameHud();
  }
}

function endGame() {
  game.running = false;
  cancelAnimationFrame(game.raf);
  let extra = "";
  if (game.score > (store.gameHigh || 0)) {
    store.gameHigh = game.score;
    saveStore(store);
    extra = "\n  ★ NEW HIGH SCORE!";
  }
  $("#results-body").textContent =
    `  Letter Storm — Game Over\n` +
    `  ${"─".repeat(40)}\n` +
    `  Final score ...... ${game.score}\n` +
    `  Level reached .... ${game.level}\n` +
    `  Words cleared .... ${game.cleared}` +
    extra;
  resultsReturn = "menu";
  show("results");
}

/* ---------------- progress report ---------------- */

function enterProgress() {
  let out = "";
  out += `  LESSON${" ".repeat(30)}BEST WPM   BEST ACC\n`;
  out += `  ${"─".repeat(54)}\n`;
  LESSONS.forEach((les) => {
    const rec = store.lessons[les.id];
    const name = (les.id.toUpperCase() + ". " + les.name).padEnd(36);
    if (rec) out += `  ${name}${String(rec.bestWpm).padEnd(11)}${rec.bestAcc}%\n`;
    else out += `  ${name}—          —\n`;
  });
  out += `\n  One-minute test best ........ ${store.testBestWpm ? store.testBestWpm + " WPM" : "—"}\n`;
  out += `  Letter Storm high score ..... ${store.gameHigh || "—"}\n`;
  $("#progress-body").textContent = out;
  show("progress");
}

/* ---------------- global key routing ---------------- */

document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  if (e.key === "Escape") {
    e.preventDefault();
    if (state === "drill") clearInterval(drill.timer);
    if (state === "game") { game.running = false; cancelAnimationFrame(game.raf); }
    if (state !== "boot") enterMenu();
    return;
  }

  switch (state) {
    case "boot":
      if (bootDone) enterMenu();
      break;

    case "menu":
      handleMenuChoice(e.key);
      break;

    case "lessons": {
      const les = LESSONS.find((l) => l.id === e.key.toLowerCase());
      if (les) startDrill(les);
      break;
    }

    case "drill":
      if (e.key.length === 1) {
        e.preventDefault();
        drillKey(e.key);
      }
      break;

    case "results":
      if (e.key === "Enter") {
        if (resultsReturn === "lessons") enterLessonSelect();
        else enterMenu();
      }
      break;

    case "game":
      if (e.key.length === 1) {
        e.preventDefault();
        gameKey(e.key.toLowerCase());
      }
      break;

    case "progress":
      if (e.key.toLowerCase() === "x") {
        store = { lessons: {} };
        saveStore(store);
        enterProgress();
      }
      break;
  }
});

/* ---------------- start ---------------- */

buildKeyboard();
runBoot();
