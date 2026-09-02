// Build Your Team — host-controlled auction draft
// Single host screen: reveal an item, teams call out bids out loud,
// host taps the leading team + bumps the bid, then confirms "SOLD!".

const TEAM_COLORS = ["#1f7a4d", "#b8792a", "#2f6fb0", "#a13f7a", "#b8432f", "#4f7a1f"];
const MAX_LOG_ENTRIES = 5;

const els = {}; // filled in on DOMContentLoaded
let state = null;

function $(id) { return document.getElementById(id); }

// ---------------------------------------------------------------
// Top nav (Home / Back) + view switching
//
// Setup / Draft / Results are treated as real browser history entries
// (via pushState), so the actual browser/OS Back button moves between
// them too, not just our in-app buttons.
// ---------------------------------------------------------------

let currentView = "setup";

// Pure DOM update — does not touch history. Used both for forward
// navigation (after a pushState) and when popstate fires from the
// browser's own Back/Forward buttons.
function showView(name) {
  currentView = name;
  $("setup-view").classList.toggle("hidden", name !== "setup");
  $("draft-view").classList.toggle("hidden", name !== "draft");
  $("results-view").classList.toggle("hidden", name !== "results");

  const navHome = $("nav-home");
  const navBack = $("nav-back");
  navHome.classList.toggle("nav-btn-hidden", name === "setup");
  navBack.classList.toggle("nav-btn-hidden", name !== "results");

  if (name === "draft" && state) renderDraft();
}

// Forward navigation: push a new history entry so the browser's Back
// button can return to whatever we're leaving.
function pushView(name) {
  if (name === currentView) return;
  const depth = (history.state?.depth || 0) + 1;
  history.pushState({ view: name, depth }, "", "#" + name);
  showView(name);
}

function draftHasProgress() {
  return !!state && (state.history.length > 0 || state.poolIndex > 0);
}

// Jump straight back to Setup, no matter how many entries deep we are.
function goToSetupRoot() {
  const depth = history.state?.depth || 0;
  if (depth > 0) history.go(-depth);
  else showView("setup");
}

function goHome() {
  if (draftHasProgress() && !confirm("Start over? This will discard the current draft.")) return;
  goToSetupRoot();
}

function initNav() {
  if (!history.state) {
    history.replaceState({ view: "setup", depth: 0 }, "", location.pathname + location.search);
  }
  window.addEventListener("popstate", (e) => {
    showView(e.state?.view || "setup");
  });

  $("nav-home").addEventListener("click", goHome);
  $("nav-back").addEventListener("click", () => history.back());
}

// ---------------------------------------------------------------
// Setup view
// ---------------------------------------------------------------

function initSetup() {
  initNav();
  els.themePicker = $("theme-picker");
  els.modePicker = $("mode-picker");
  els.modeHint = $("mode-hint");
  els.teamCount = $("team-count");
  els.budget = $("budget");
  els.slots = $("slots");
  els.teamNames = $("team-names");
  els.editPoolBtn = $("edit-pool-btn");
  els.poolSummary = $("pool-summary");
  els.poolEditor = $("pool-editor");
  els.poolTextarea = $("pool-textarea");
  els.startBtn = $("start-btn");

  let currentTheme = "nba";
  let mustDraft = false;
  let poolDirty = false; // has the user hand-edited the pool textarea?

  const MODE_HINTS = {
    open: "Any item can go unsold if nobody bids on it.",
    must: "Every item must go to someone. Turns rotate through teams — the team on turn gets it for free unless another team outbids them.",
  };

  function applyThemeDefaults(themeKey) {
    const preset = PRESETS[themeKey];
    els.slots.value = preset.defaultSlots;
    els.budget.value = preset.defaultBudget;
    if (!poolDirty) {
      els.poolTextarea.value = poolToText(preset.items);
    }
    updatePoolSummary();
    updateHeroPhotos(preset);
  }

  function updateHeroPhotos(preset) {
    const photos = preset.items.filter((it) => it.photo).map((it) => it.photo);
    const imgs = document.querySelectorAll("#hero-photos img");
    imgs.forEach((img, i) => {
      if (photos[i]) img.src = photos[i];
    });
  }

  function poolToText(items) {
    return items
      .map((it) => {
        const parts = [it.name, it.category, it.value != null ? it.value : "", it.photo || ""];
        while (parts.length && parts[parts.length - 1] === "") parts.pop();
        return parts.join(" | ");
      })
      .join("\n");
  }

  function updatePoolSummary() {
    const items = parsePoolText(els.poolTextarea.value);
    els.poolSummary.textContent = items.length
      ? `${items.length} items in the pool.`
      : `No items yet — click "Edit pool" to add some.`;
  }

  els.themePicker.addEventListener("click", (e) => {
    const btn = e.target.closest(".theme-tile");
    if (!btn) return;
    [...els.themePicker.children].forEach((b) => b.classList.toggle("active", b === btn));
    currentTheme = btn.dataset.theme;
    poolDirty = false;
    applyThemeDefaults(currentTheme);
  });

  els.modePicker.addEventListener("click", (e) => {
    const btn = e.target.closest(".mode-btn");
    if (!btn) return;
    [...els.modePicker.children].forEach((b) => b.classList.toggle("active", b === btn));
    mustDraft = btn.dataset.mode === "must";
    els.modeHint.textContent = MODE_HINTS[btn.dataset.mode];
  });

  els.editPoolBtn.addEventListener("click", () => {
    els.poolEditor.classList.toggle("hidden");
  });

  els.poolTextarea.addEventListener("input", () => {
    poolDirty = true;
    updatePoolSummary();
  });

  els.teamCount.addEventListener("input", renderTeamNameInputs);

  function renderTeamNameInputs() {
    let count = parseInt(els.teamCount.value, 10);
    if (!Number.isFinite(count)) count = 2;
    count = Math.max(2, Math.min(6, count));
    els.teamCount.value = count;

    const existing = [...els.teamNames.querySelectorAll("input")].map((i) => i.value);
    els.teamNames.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const row = document.createElement("div");
      row.className = "team-name-row";
      const swatch = document.createElement("div");
      swatch.className = "team-swatch";
      swatch.style.background = TEAM_COLORS[i % TEAM_COLORS.length];
      const input = document.createElement("input");
      input.type = "text";
      input.id = `team-name-${i}`;
      input.placeholder = `Team ${i + 1}`;
      input.setAttribute("aria-label", `Team ${i + 1} name`);
      input.value = existing[i] || "";
      input.dataset.teamIndex = i;
      row.append(swatch, input);
      els.teamNames.appendChild(row);
    }
  }

  els.startBtn.addEventListener("click", () => startDraft(mustDraft));

  renderTeamNameInputs();
  applyThemeDefaults(currentTheme);
}

function parsePoolText(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      const value = parts[2] !== undefined && parts[2] !== "" ? Number(parts[2]) : null;
      return {
        name: parts[0] || "Untitled",
        category: parts[1] || "Item",
        value: Number.isFinite(value) ? value : null,
        photo: parts[3] || null,
      };
    });
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startDraft(mustDraft) {
  const budget = Math.max(0, Number(els.budget.value) || 0);
  const slotLabels = els.slots.value.split(",").map((s) => s.trim()).filter(Boolean);
  const nameInputs = [...els.teamNames.querySelectorAll("input")];
  const pool = parsePoolText(els.poolTextarea.value);

  if (slotLabels.length === 0) {
    alert("Add at least one roster slot.");
    return;
  }
  if (pool.length === 0) {
    alert("Add at least one item to the pool.");
    return;
  }

  const teams = nameInputs.map((input, i) => ({
    id: i,
    name: input.value.trim() || `Team ${i + 1}`,
    color: TEAM_COLORS[i % TEAM_COLORS.length],
    budget,
    startingBudget: budget,
    slots: slotLabels.map((label) => ({ label, item: null })),
  }));

  state = {
    teams,
    pool: shuffle(pool),
    poolIndex: 0,
    currentBid: 0,
    leaderId: null,
    mustDraft: !!mustDraft,
    turnIndex: 0,
    autoDraftCursor: 0,
    log: [],
    history: [],
  };

  initDraftViewOnce();
  beginItem();
  pushView("draft");
}

// ---------------------------------------------------------------
// Draft view
// ---------------------------------------------------------------

let draftWired = false;

function initDraftViewOnce() {
  if (draftWired) return;
  draftWired = true;

  els.draftProgress = $("draft-progress");
  els.undoBtn = $("undo-btn");
  els.finishBtn = $("finish-btn");
  els.itemPhoto = $("item-photo");
  els.itemAvatar = $("item-avatar");
  els.itemCategory = $("item-category");
  els.itemName = $("item-name");
  els.bidAmount = $("bid-amount");
  els.bidDisplay = $("bid-display");
  els.leaderBanner = $("leader-banner");
  els.teamsStrip = $("teams-strip");
  els.soldBtn = $("sold-btn");
  els.skipBtn = $("skip-btn");
  els.resetBidBtn = $("reset-bid-btn");
  els.eventLog = $("event-log");

  document.querySelectorAll(".bid-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const amt = Number(btn.dataset.amt);
      state.currentBid = Math.max(0, state.currentBid + amt);
      renderDraft();
      pulseBidDisplay();
    });
  });

  els.resetBidBtn.addEventListener("click", () => {
    state.currentBid = 0;
    state.leaderId = state.mustDraft ? (getOnTurnTeam() || {}).id ?? null : null;
    renderDraft();
  });

  els.teamsStrip.addEventListener("click", (e) => {
    const allInBtn = e.target.closest(".all-in-btn");
    if (allInBtn) {
      goAllIn(Number(allInBtn.dataset.teamId));
      return;
    }
    const tile = e.target.closest(".team-tile");
    if (!tile || tile.classList.contains("disabled")) return;
    const teamId = Number(tile.dataset.teamId);
    state.leaderId = state.leaderId === teamId ? null : teamId;
    renderDraft();
  });

  els.soldBtn.addEventListener("click", confirmSold);
  els.skipBtn.addEventListener("click", skipItem);
  els.undoBtn.addEventListener("click", undo);
  els.finishBtn.addEventListener("click", showResults);
}

// Subtle feedback that a bid tap registered. Transition-based (not
// keyframes) so rapid repeat taps retarget smoothly instead of jumping.
let pulseTimer = null;
function pulseBidDisplay() {
  if (!els.bidDisplay) return;
  clearTimeout(pulseTimer);
  els.bidDisplay.classList.add("pulse");
  pulseTimer = setTimeout(() => els.bidDisplay.classList.remove("pulse"), 140);
}

function currentItem() {
  return state.pool[state.poolIndex] || null;
}

function findSlotForItem(team, item) {
  let idx = team.slots.findIndex((s) => !s.item && s.label.toLowerCase() === item.category.toLowerCase());
  if (idx === -1) idx = team.slots.findIndex((s) => !s.item);
  return idx;
}

function teamHasRoom(team) {
  return team.slots.some((s) => !s.item);
}

function draftIsOver() {
  return state.poolIndex >= state.pool.length || state.teams.every((t) => !teamHasRoom(t));
}

// Who gets an item for free if nobody outbids them (must-draft mode only).
function getOnTurnTeam() {
  const n = state.teams.length;
  for (let i = 0; i < n; i++) {
    const idx = (state.turnIndex + i) % n;
    const t = state.teams[idx];
    if (teamHasRoom(t)) return t;
  }
  return null;
}

function advanceTurn() {
  const onTurn = getOnTurnTeam();
  if (!onTurn) return;
  const idx = state.teams.findIndex((t) => t.id === onTurn.id);
  state.turnIndex = (idx + 1) % state.teams.length;
}

// Reset the bid counter for a freshly-revealed item. In must-draft mode the
// on-turn team is pre-selected as a fallback leader at $0 so nothing can be
// skipped; in open auction mode nobody is selected until a team is tapped.
function beginItem() {
  state.currentBid = 0;
  if (state.mustDraft) {
    const onTurn = getOnTurnTeam();
    state.leaderId = onTurn ? onTurn.id : null;
  } else {
    state.leaderId = null;
  }
}

function goAllIn(teamId) {
  const team = state.teams.find((t) => t.id === teamId);
  if (!team || team.budget <= 0 || !teamHasRoom(team)) return;
  state.currentBid = team.budget;
  state.leaderId = team.id;
  renderDraft();
}

// A team with $0 left can't out-bid anyone, so once an item goes unclaimed
// it's handed to the next broke team (round-robin) that still has room,
// instead of being discarded — nobody gets stuck with empty roster slots.
function findBrokeTeamForAutoDraft(item) {
  const n = state.teams.length;
  for (let i = 0; i < n; i++) {
    const idx = (state.autoDraftCursor + i) % n;
    const t = state.teams[idx];
    if (t.budget === 0 && teamHasRoom(t) && findSlotForItem(t, item) !== -1) {
      state.autoDraftCursor = (idx + 1) % n;
      return t;
    }
  }
  return null;
}

function logEvent(msg) {
  state.log.unshift(msg);
  state.log = state.log.slice(0, MAX_LOG_ENTRIES);
}

function renderDraft() {
  const item = currentItem();

  if (!item || draftIsOver()) {
    showResults();
    return;
  }

  els.draftProgress.textContent = `Item ${state.poolIndex + 1} of ${state.pool.length}`;
  els.undoBtn.disabled = state.history.length === 0;

  renderItemPhoto(item);
  els.itemCategory.textContent = item.category;
  els.itemName.textContent = item.name;
  els.bidAmount.textContent = state.currentBid;

  const leaderTeam = state.teams.find((t) => t.id === state.leaderId) || null;
  const onTurnTeam = state.mustDraft ? getOnTurnTeam() : null;
  const isAllIn = leaderTeam && state.currentBid > 0 && state.currentBid === leaderTeam.budget;
  const isDefaultOnTurn = state.mustDraft && leaderTeam && onTurnTeam && leaderTeam.id === onTurnTeam.id && state.currentBid === 0;

  els.leaderBanner.classList.remove("active", "all-in", "on-turn");
  if (!leaderTeam) {
    els.leaderBanner.textContent = "Tap a team below once they're the highest bidder";
  } else if (isAllIn) {
    els.leaderBanner.textContent = `${leaderTeam.name} is ALL IN for $${state.currentBid} — others can still steal by outbidding!`;
    els.leaderBanner.classList.add("all-in");
  } else if (isDefaultOnTurn) {
    els.leaderBanner.textContent = `${leaderTeam.name}’s turn — they get this for $0 unless outbid`;
    els.leaderBanner.classList.add("on-turn");
  } else {
    els.leaderBanner.textContent = `${leaderTeam.name} is bidding $${state.currentBid}`;
    els.leaderBanner.classList.add("active");
  }

  els.teamsStrip.innerHTML = "";
  state.teams.forEach((team) => {
    const room = teamHasRoom(team);
    const canAfford = team.budget >= state.currentBid;
    const disabled = !room || !canAfford;
    const canAllIn = room && team.budget > 0;

    const tile = document.createElement("div");
    tile.className = "team-tile"
      + (team.id === state.leaderId ? " leader" : "")
      + (team.id === state.leaderId && state.currentBid > 0 && state.currentBid === team.budget ? " all-in" : "")
      + (disabled ? " disabled" : "");
    tile.dataset.teamId = team.id;

    const slotsHtml = team.slots
      .map((s) => `<span class="slot-chip${s.item ? " filled" : ""}">${s.item ? escapeHtml(s.item.name) : escapeHtml(s.label)}</span>`)
      .join("");
    const onTurnBadge = state.mustDraft && onTurnTeam && onTurnTeam.id === team.id
      ? `<span class="slot-chip">On turn</span>` : "";

    tile.innerHTML = `
      <div class="team-tile-top">
        <span class="team-tile-name"><span class="team-tile-dot" style="background:${team.color}"></span>${escapeHtml(team.name)}</span>
        <span class="team-tile-budget${team.budget < 5 ? " low" : ""}">$${team.budget}</span>
      </div>
      <span class="team-tile-slots">${onTurnBadge}${slotsHtml}</span>
      <button type="button" class="all-in-btn" data-team-id="${team.id}" ${canAllIn ? "" : "disabled"}>ALL IN ($${team.budget})</button>
    `;
    els.teamsStrip.appendChild(tile);
  });

  renderEventLog();

  els.soldBtn.disabled = state.leaderId === null;
  els.skipBtn.classList.toggle("hidden", state.mustDraft);
}

function renderItemPhoto(item) {
  if (item.photo) {
    els.itemPhoto.src = item.photo;
    els.itemPhoto.alt = item.name;
    els.itemPhoto.classList.remove("hidden");
    els.itemAvatar.classList.add("hidden");
    els.itemPhoto.onerror = () => showAvatarFallback(item);
  } else {
    showAvatarFallback(item);
  }
}

function showAvatarFallback(item) {
  els.itemPhoto.classList.add("hidden");
  els.itemPhoto.onerror = null;
  els.itemAvatar.classList.remove("hidden");
  els.itemAvatar.textContent = initials(item.name);
  els.itemAvatar.style.background = colorForCategory(item.category);
}

function initials(name) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function colorForCategory(category) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) % 360;
  return `hsl(${hash}, 45%, 42%)`;
}

function renderEventLog() {
  els.eventLog.innerHTML = state.log
    .map((msg) => `<div class="event-log-entry">${escapeHtml(msg)}</div>`)
    .join("");
}

function snapshot() {
  return JSON.parse(JSON.stringify({
    teams: state.teams,
    poolIndex: state.poolIndex,
    currentBid: state.currentBid,
    leaderId: state.leaderId,
    turnIndex: state.turnIndex,
    autoDraftCursor: state.autoDraftCursor,
    log: state.log,
  }));
}

function pushHistory() {
  state.history.push(snapshot());
}

function confirmSold() {
  const item = currentItem();
  const team = state.teams.find((t) => t.id === state.leaderId);
  if (!item || !team) return;

  const slotIdx = findSlotForItem(team, item);
  if (slotIdx === -1) {
    alert(`${team.name} has no open roster slot left.`);
    return;
  }

  pushHistory();
  const bidAmt = state.currentBid;
  team.budget -= bidAmt;
  team.slots[slotIdx] = { label: team.slots[slotIdx].label, item: { name: item.name, value: item.value, photo: item.photo } };
  logEvent(`Sold: ${item.name} to ${team.name} for $${bidAmt}`);

  if (state.mustDraft) advanceTurn();
  state.poolIndex += 1;
  beginItem();
  renderDraft();
}

function skipItem() {
  const item = currentItem();
  if (!item) return;
  pushHistory();

  const brokeTeam = findBrokeTeamForAutoDraft(item);
  if (brokeTeam) {
    const slotIdx = findSlotForItem(brokeTeam, item);
    brokeTeam.slots[slotIdx] = { label: brokeTeam.slots[slotIdx].label, item: { name: item.name, value: item.value, photo: item.photo } };
    logEvent(`Auto-drafted: ${item.name} to ${brokeTeam.name} (out of budget)`);
  } else {
    logEvent(`Skipped: ${item.name} — no takers`);
  }

  state.poolIndex += 1;
  beginItem();
  renderDraft();
}

function undo() {
  const prev = state.history.pop();
  if (!prev) return;
  state.teams = prev.teams;
  state.poolIndex = prev.poolIndex;
  state.currentBid = prev.currentBid;
  state.leaderId = prev.leaderId;
  state.turnIndex = prev.turnIndex;
  state.autoDraftCursor = prev.autoDraftCursor;
  state.log = prev.log;
  renderDraft();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------------------------------
// Results view
// ---------------------------------------------------------------

let resultsWired = false;

function showResults() {
  pushView("results");

  if (!resultsWired) {
    resultsWired = true;
    $("restart-btn").addEventListener("click", goToSetupRoot);
  }

  const grid = $("results-grid");
  grid.innerHTML = "";

  const hasScores = state.teams.some((t) => t.slots.some((s) => s.item && s.item.value != null));
  let bestTeamId = null;
  let bestScore = -Infinity;

  state.teams.forEach((team) => {
    const spent = team.startingBudget - team.budget;
    const score = team.slots.reduce((sum, s) => sum + (s.item && s.item.value != null ? s.item.value : 0), 0);
    if (hasScores && score > bestScore) {
      bestScore = score;
      bestTeamId = team.id;
    }

    const card = document.createElement("div");
    card.className = "result-team";

    const rosterHtml = team.slots
      .map((s) => `
        <div class="result-slot${s.item ? "" : " empty"}">
          <span class="result-slot-label">${escapeHtml(s.label)}</span>
          <span>${s.item ? escapeHtml(s.item.name) : "empty"}</span>
        </div>
      `)
      .join("");

    card.innerHTML = `
      <div class="result-team-header">
        <span class="result-team-name"><span class="team-tile-dot" style="background:${team.color}"></span>${escapeHtml(team.name)}</span>
        <span class="result-team-spent">$${spent} spent · $${team.budget} left</span>
      </div>
      <div class="result-roster">${rosterHtml}</div>
      ${hasScores ? `<div class="result-score">Score: ${score}</div>` : ""}
    `;
    grid.appendChild(card);
  });

  $("auto-score-note").textContent = hasScores
    ? `Items had point values, so "${state.teams.find((t) => t.id === bestTeamId)?.name}" has the highest auto-score — but the crowd (or camera) still gets final say.`
    : `No point values were set, so declare the winner by vote, judge, or however you like.`;

  const winnerButtons = $("winner-buttons");
  winnerButtons.innerHTML = "";
  state.teams.forEach((team) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mode-btn";
    btn.textContent = team.name;
    btn.addEventListener("click", () => {
      const banner = $("winner-banner");
      banner.textContent = `${team.name} wins!`;
      banner.classList.remove("hidden");
      // Force the entrance animation to replay even if a winner was
      // already declared once (re-adding a present class is a no-op).
      banner.classList.remove("active");
      void banner.offsetWidth;
      banner.classList.add("active");
    });
    winnerButtons.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", initSetup);
