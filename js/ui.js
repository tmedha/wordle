import { MAX_GUESSES, WORD_LENGTH, evaluateGuess } from "./game.js";
import { formatTime } from "./timer.js";

export function renderBoard(boardEl, { guesses, currentGuess, answer }) {
  boardEl.innerHTML = "";
  for (let r = 0; r < MAX_GUESSES; r++) {
    const rowEl = document.createElement("div");
    rowEl.className = "board-row";
    const guess = guesses[r];
    const isCurrentRow = r === guesses.length;
    const letters = guess ? guess.split("") : isCurrentRow ? currentGuess.split("") : [];
    const feedback = guess ? evaluateGuess(guess, answer) : null;

    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      const letter = letters[c] || "";
      tile.textContent = letter;
      if (letter) tile.dataset.filled = "true";
      if (feedback) tile.dataset.status = feedback[c];
      rowEl.appendChild(tile);
    }
    boardEl.appendChild(rowEl);
  }
}

export function shakeRow(boardEl, rowIndex) {
  const rowEl = boardEl.children[rowIndex];
  if (!rowEl) return;
  for (const tile of rowEl.children) {
    tile.classList.add("shake");
    tile.addEventListener("animationend", () => tile.classList.remove("shake"), { once: true });
  }
}

export function renderTimer(timerEl, remainingMs) {
  timerEl.textContent = formatTime(remainingMs);
  timerEl.classList.toggle("low-time", remainingMs <= 30000);
}

function statFragment(label, value) {
  return `<div class="stat"><dt>${value}</dt><dd>${label}</dd></div>`;
}

export function renderStatsSummary(el, stats, mode) {
  const winPct = stats.gamesPlayed ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  let html =
    statFragment("Played", stats.gamesPlayed) +
    statFragment("Win %", winPct) +
    statFragment("Streak", stats.currentStreak) +
    statFragment("Max Streak", stats.maxStreak);
  if (mode === "timed") {
    html += statFragment("Best Time", stats.bestTimeMs != null ? formatTime(stats.bestTimeMs) : "-");
  }
  el.innerHTML = html;
}

export function renderModeSelectStats(el, statsUntimed, statsTimed) {
  function block(label, stats, mode) {
    const winPct = stats.gamesPlayed ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
    let html =
      statFragment("Played", stats.gamesPlayed) +
      statFragment("Win %", winPct) +
      statFragment("Streak", stats.currentStreak) +
      statFragment("Max Streak", stats.maxStreak);
    if (mode === "timed") {
      html += statFragment("Best Time", stats.bestTimeMs != null ? formatTime(stats.bestTimeMs) : "-");
    }
    return `<h3 class="stats-block-title">${label}</h3><dl class="stats-summary">${html}</dl>`;
  }
  el.innerHTML = block("Untimed", statsUntimed, "untimed") + block("Timed", statsTimed, "timed");
}

export function showToast(toastEl, message, duration = 1500) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toastEl.hidden = true;
  }, duration);
}

export function showEndOverlay(overlayEl, { won, answer, elements }) {
  elements.title.textContent = won ? "You won!" : "Out of guesses";
  elements.word.textContent = won ? "" : `The word was ${answer}`;
  overlayEl.hidden = false;
}

export function hideEndOverlay(overlayEl) {
  overlayEl.hidden = true;
}
