// Build Your Team — host-controlled auction draft
// Single host screen: reveal an item, teams call out bids out loud,
// host taps the leading team + bumps the bid, then confirms "SOLD!".

const TEAM_COLORS = ["#1f7a4d", "#b8792a", "#2f6fb0", "#a13f7a", "#b8432f", "#4f7a1f"];

const els = {}; // filled in on DOMContentLoaded
let state = null;

function $(id) { return document.getElementById(id); }

// ---------------------------------------------------------------
// Setup view
// ---------------------------------------------------------------

function initSetup() {
  els.themePicker = $("theme-picker");
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
  let poolDirty = false; // has the user hand-edited the pool textarea?

  function applyThemeDefaults(themeKey) {
    const preset = PRESETS[themeKey];
    els.slots.value = preset.defaultSlots;
    els.budget.value = preset.defaultBudget;
    if (!poolDirty) {
      els.poolTextarea.value = poolToText(preset.items);
    }
    updatePoolSummary();
  }

  function poolToText(items) {
    return items
      .map((it) => `${it.name} | ${it.category}${it.value != null ? " | " + it.value : ""}`)
      .join("\n");
  }

  function updatePoolSummary() {
    const items = parsePoolText(els.poolTextarea.value);
    els.poolSummary.textContent = items.length
      ? `${items.length} items in the pool.`
      : `No items yet — click "Edit pool" to add some.`;
  }

  els.themePicker.addEventListener("click", (e) => {
    const btn = e.target.closest(".theme-btn");
    if (!btn) return;
    [...els.themePicker.children].forEach((b) => b.classList.toggle("active", b === btn));
    currentTheme = btn.dataset.theme;
    poolDirty = false;
    applyThemeDefaults(currentTheme);
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
      input.placeholder = `Team ${i + 1}`;
      input.value = existing[i] || "";
      input.dataset.teamIndex = i;
      row.append(swatch, input);
      els.teamNames.appendChild(row);
    }
  }

  els.startBtn.addEventListener("click", startDraft);

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

function startDraft() {
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
    history: [],
  };

  $("setup-view").classList.add("hidden");
  $("results-view").classList.add("hidden");
  $("draft-view").classList.remove("hidden");
  initDraftViewOnce();
  renderDraft();
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
  els.itemCategory = $("item-category");
  els.itemName = $("item-name");
  els.bidAmount = $("bid-amount");
  els.leaderBanner = $("leader-banner");
  els.teamsStrip = $("teams-strip");
  els.soldBtn = $("sold-btn");
  els.skipBtn = $("skip-btn");
  els.resetBidBtn = $("reset-bid-btn");

  document.querySelectorAll(".bid-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const amt = Number(btn.dataset.amt);
      state.currentBid = Math.max(0, state.currentBid + amt);
      renderDraft();
    });
  });

  els.resetBidBtn.addEventListener("click", () => {
    state.currentBid = 0;
    state.leaderId = null;
    renderDraft();
  });

  els.teamsStrip.addEventListener("click", (e) => {
    const tile = e.target.closest(".team-tile");
    if (!tile || tile.disabled) return;
    const teamId = Number(tile.dataset.teamId);
    state.leaderId = state.leaderId === teamId ? null : teamId;
    renderDraft();
  });

  els.soldBtn.addEventListener("click", confirmSold);
  els.skipBtn.addEventListener("click", skipItem);
  els.undoBtn.addEventListener("click", undo);
  els.finishBtn.addEventListener("click", showResults);
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

function renderDraft() {
  const item = currentItem();

  if (!item || draftIsOver()) {
    showResults();
    return;
  }

  els.draftProgress.textContent = `Item ${state.poolIndex + 1} of ${state.pool.length}`;
  els.undoBtn.disabled = state.history.length === 0;

  els.itemCategory.textContent = item.category;
  els.itemName.textContent = item.name;
  els.bidAmount.textContent = state.currentBid;

  const leaderTeam = state.teams.find((t) => t.id === state.leaderId) || null;
  els.leaderBanner.textContent = leaderTeam
    ? `${leaderTeam.name} is bidding $${state.currentBid}`
    : "Tap a team below once they're the highest bidder";
  els.leaderBanner.classList.toggle("active", !!leaderTeam);

  els.teamsStrip.innerHTML = "";
  state.teams.forEach((team) => {
    const room = teamHasRoom(team);
    const canAfford = team.budget >= state.currentBid;
    const disabled = !room || !canAfford;

    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "team-tile" + (team.id === state.leaderId ? " leader" : "") + (disabled ? " disabled" : "");
    tile.disabled = disabled;
    tile.dataset.teamId = team.id;
    tile.style.borderColor = team.id === state.leaderId ? "" : "";

    const slotsHtml = team.slots
      .map((s) => `<span class="slot-chip${s.item ? " filled" : ""}">${s.item ? s.item.name : s.label}</span>`)
      .join("");

    tile.innerHTML = `
      <span class="team-tile-name">${escapeHtml(team.name)}</span>
      <span class="team-tile-budget${team.budget < 5 ? " low" : ""}">$${team.budget}</span>
      <span class="team-tile-slots">${slotsHtml}</span>
    `;
    els.teamsStrip.appendChild(tile);
  });

  els.soldBtn.disabled = state.leaderId === null;
}

function snapshot() {
  return JSON.parse(JSON.stringify({
    teams: state.teams,
    poolIndex: state.poolIndex,
    currentBid: state.currentBid,
    leaderId: state.leaderId,
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
  team.budget -= state.currentBid;
  team.slots[slotIdx] = { label: team.slots[slotIdx].label, item: { name: item.name, value: item.value } };

  state.poolIndex += 1;
  state.currentBid = 0;
  state.leaderId = null;
  renderDraft();
}

function skipItem() {
  if (!currentItem()) return;
  pushHistory();
  state.poolIndex += 1;
  state.currentBid = 0;
  state.leaderId = null;
  renderDraft();
}

function undo() {
  const prev = state.history.pop();
  if (!prev) return;
  state.teams = prev.teams;
  state.poolIndex = prev.poolIndex;
  state.currentBid = prev.currentBid;
  state.leaderId = prev.leaderId;
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
  $("draft-view").classList.add("hidden");
  $("results-view").classList.remove("hidden");

  if (!resultsWired) {
    resultsWired = true;
    $("restart-btn").addEventListener("click", () => location.reload());
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
    card.style.borderColor = team.color;

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
        <span class="result-team-name">${escapeHtml(team.name)}</span>
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
    btn.className = "theme-btn";
    btn.textContent = team.name;
    btn.addEventListener("click", () => {
      $("winner-banner").textContent = `🏆 ${team.name} wins!`;
      $("winner-banner").classList.remove("hidden");
      $("winner-banner").classList.add("active");
    });
    winnerButtons.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", initSetup);
