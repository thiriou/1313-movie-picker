/* ══════════════════════════════════════════════════════════════
   1313 SHRINE — script.js
   Vanilla JS only. No frameworks.
   Films: exact 14 from gothshawty's Letterboxd list "1313"
   OMDb API key: replace with your free key from omdbapi.com
══════════════════════════════════════════════════════════════ */

// ── CONFIG ────────────────────────────────────────────────────
const OMDB_KEY   = "trilogy";          // get a free key at omdbapi.com/apikey.aspx
const OMDB_BASE  = "https://www.omdbapi.com/";
const MAX_HIST   = 5;

// ── COMPLETE 1313 FILM LIST ───────────────────────────────────
// Exact 14 films from letterboxd.com/gothshawty/list/13-13/
// In series order (2011 first, then 2012)
const FILMS = [
  // 2011 entries
  { title: "1313: Nightmare Mansion",  subtitle: "Nightmare Mansion",  year: "2011", omdb: "1313: Nightmare Mansion" },
  { title: "1313: Giant Killer Bees!", subtitle: "Giant Killer Bees!", year: "2011", omdb: "1313: Giant Killer Bees!" },
  { title: "1313: Haunted Frat",       subtitle: "Haunted Frat",       year: "2011", omdb: "1313: Haunted Frat" },
  { title: "1313: Actor Slash Model",  subtitle: "Actor Slash Model",  year: "2011", omdb: "1313: Actor Slash Model" },
  { title: "1313: Boy Crazies",        subtitle: "Boy Crazies",        year: "2011", omdb: "1313: Boy Crazies" },
  { title: "1313: Wicked Stepbrother", subtitle: "Wicked Stepbrother", year: "2011", omdb: "1313: Wicked Stepbrother" },
  // 2012 entries
  { title: "1313: Frankenqueen",       subtitle: "Frankenqueen",       year: "2012", omdb: "1313: Frankenqueen" },
  { title: "1313: Night of the Widow", subtitle: "Night of the Widow", year: "2012", omdb: "1313: Night of the Widow" },
  { title: "1313: Hercules Unbound!",  subtitle: "Hercules Unbound!",  year: "2012", omdb: "1313: Hercules Unbound!", poster: "https://a.ltrbxd.com/resized/film-poster/9/1/1/8/1/91181-1313-hercules-unbound-0-2000-0-3000-crop.jpg?v=5cbe9e4c5c" },
  { title: "1313: Billy the Kid",      subtitle: "Billy the Kid",      year: "2012", omdb: "1313: Billy the Kid",      poster: "https://a.ltrbxd.com/resized/film-poster/8/7/9/5/2/87952-1313-billy-the-kid-0-2000-0-3000-crop.jpg?v=a73443260b" },
  { title: "1313: Bermuda Triangle",   subtitle: "Bermuda Triangle",   year: "2012", omdb: "1313: Bermuda Triangle" },
  { title: "1313: UFO Invasion",       subtitle: "UFO Invasion",       year: "2012", omdb: "1313: UFO Invasion" },
  { title: "1313: Cougar Cult",        subtitle: "Cougar Cult",        year: "2012", omdb: "1313: Cougar Cult" },
  { title: "1313: Bigfoot Island",     subtitle: "Bigfoot Island",     year: "2012", omdb: "1313: Bigfoot Island" },
];

// ── STATE ─────────────────────────────────────────────────────
let lastIndex  = -1;
let currentIdx = -1;

// ── DOM REFS ──────────────────────────────────────────────────
const pickBtn          = document.getElementById("pickBtn");
const againBtn         = document.getElementById("againBtn");
const statePlaceholder = document.getElementById("statePlaceholder");
const stateLoading     = document.getElementById("stateLoading");
const stateResult      = document.getElementById("stateResult");
const cardZone         = document.getElementById("cardZone");
const poster           = document.getElementById("poster");
const noPoster         = document.getElementById("noPoster");
const resPrefix        = document.getElementById("resPrefix");
const resTitle         = document.getElementById("resTitle");
const resYear          = document.getElementById("resYear");
const resGenre         = document.getElementById("resGenre");
const resRating        = document.getElementById("resRating");
const resPlot          = document.getElementById("resPlot");
const allList          = document.getElementById("allList");
const loadFill         = document.getElementById("loadFill");

// ── INIT ─────────────────────────────────────────────────────
populateAllFilmsList();

// ── PICK LOGIC ────────────────────────────────────────────────

/** Entry point — pick a random film, fetch OMDb, render */
async function pickMovie() {
  // Pick index, avoiding repeat
  let idx;
  do {
    idx = Math.floor(Math.random() * FILMS.length);
  } while (idx === lastIndex && FILMS.length > 1);

  lastIndex  = idx;
  currentIdx = idx;

  const film = FILMS[idx];

  showLoading();
  animateLoadBar();

  const data = await fetchOMDb(film.omdb, film.year);

  renderResult(film, data);
  highlightCurrentInList(idx);
}

/** Fetch from OMDb, return data or null on failure */
async function fetchOMDb(title, year) {
  try {
    const params = new URLSearchParams({
      apikey: OMDB_KEY,
      t:      title,
      y:      year,
      type:   "movie",
    });
    const res  = await fetch(`${OMDB_BASE}?${params}`);
    if (!res.ok) throw new Error("network");
    const data = await res.json();
    return data.Response === "True" ? data : null;
  } catch (e) {
    console.warn("OMDb failed:", e);
    return null;
  }
}

/** Fake loading bar animation */
function animateLoadBar() {
  loadFill.style.width = "0%";
  let pct = 0;
  const iv = setInterval(() => {
    pct += Math.random() * 25 + 5;
    if (pct >= 95) { pct = 95; clearInterval(iv); }
    loadFill.style.width = pct + "%";
  }, 120);
  // Stored so renderResult can finish it
  window._loadInterval = iv;
}

// ── RENDER ────────────────────────────────────────────────────

/** Populate the result card with film + OMDb data */
function renderResult(film, omdb) {
  // Finish load bar
  clearInterval(window._loadInterval);
  loadFill.style.width = "100%";

  // Merge data
  const title  = omdb?.Title  || film.title;
  const year   = omdb?.Year   || film.year;
  const genre  = omdb?.Genre  || "Horror";
  const rating = omdb?.imdbRating;
  const plot   = omdb?.Plot;
  const img    = film.poster || omdb?.Poster;

  // ── Poster ──
  if (img && img !== "N/A") {
    poster.src = img;
    poster.style.display = "block";
    noPoster.classList.add("hidden");
    poster.onerror = () => {
      poster.style.display = "none";
      noPoster.classList.remove("hidden");
    };
  } else {
    poster.style.display = "none";
    noPoster.classList.remove("hidden");
  }

  // ── Text fields ──
  resPrefix.textContent = "1313:";
  resTitle.textContent  = film.subtitle.toUpperCase();
  resYear.textContent   = year;
  resGenre.textContent  = genre;
  resRating.textContent = rating && rating !== "N/A"
    ? rating + " / 10"
    : "N/A";
  resPlot.textContent   = plot && plot !== "N/A" ? plot : "";

  // ── Show result, hide loading ──
  setState("result");

  // ── Glitch-in animation ──
  stateResult.classList.remove("glitch-in");
  void stateResult.offsetWidth;           // reflow to replay animation
  stateResult.classList.add("glitch-in");

  // Glow on card zone
  cardZone.classList.add("has-result");

  // Show "pick again" button
  pickBtn.classList.add("hidden");
  againBtn.classList.remove("hidden");
}

/** Show a named UI state: placeholder | loading | result */
function showLoading() {
  setState("loading");
  cardZone.classList.remove("has-result");
}

function setState(which) {
  statePlaceholder.classList.add("hidden");
  stateLoading.classList.add("hidden");
  stateResult.classList.add("hidden");

  if (which === "placeholder") statePlaceholder.classList.remove("hidden");
  if (which === "loading")     stateLoading.classList.remove("hidden");
  if (which === "result")      stateResult.classList.remove("hidden");
}

// ── ALL FILMS SIDEBAR LIST ────────────────────────────────────

function populateAllFilmsList() {
  FILMS.forEach((film, i) => {
    const li = document.createElement("li");
    li.id = `film-item-${i}`;
    li.textContent = film.subtitle;
    allList.appendChild(li);
  });
}

/** Highlight the currently selected film in the all-films list */
function highlightCurrentInList(idx) {
  // Remove old highlight
  allList.querySelectorAll("li").forEach(el => el.classList.remove("current"));
  const el = document.getElementById(`film-item-${idx}`);
  if (el) {
    el.classList.add("current");
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// ── STAR FIELD ────────────────────────────────────────────────
(function buildStars() {
  const container = document.getElementById("stars");
  const count = 80;
  for (let i = 0; i < count; i++) {
    const s   = document.createElement("span");
    const sz  = Math.random() * 2 + 0.5;
    const dur = (Math.random() * 4 + 2).toFixed(1) + "s";
    const dl  = (Math.random() * 5).toFixed(1) + "s";
    s.className = "star";
    s.style.cssText = `
      width: ${sz}px;
      height: ${sz}px;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      --d: ${dur};
      --dl: ${dl};
    `;
    container.appendChild(s);
  }
})();

// ── EVENT LISTENERS ───────────────────────────────────────────

pickBtn.addEventListener("click",  pickMovie);
againBtn.addEventListener("click", pickMovie);

// Spacebar shortcut
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && e.target === document.body) {
    e.preventDefault();
    pickMovie();
  }
});
