import { MAX_GUESSES, WORD_LENGTH, evaluateGuess, computeKeyboardStatuses, createGameState } from "./game.js";
import { pickNextWord, isValidWord } from "./wordbank.js";
import { getStats, setStats, getActiveGame, setActiveGame, clearActiveGame } from "./state.js";
import { GameTimer } from "./timer.js";
import { buildKeyboard, attachKeyboardClicks, attachPhysicalKeyboard, updateKeyboardStatuses } from "./keyboard.js";
import {
  renderBoard,
  shakeRow,
  renderTimer,
  renderModeSelectStats,
  renderStatsSummary,
  showToast,
  showEndOverlay,
  hideEndOverlay,
} from "./ui.js";

const el = {
  modeSelect: document.getElementById("mode-select"),
  gameScreen: document.getElementById("game-screen"),
  modeUntimedBtn: document.getElementById("mode-untimed-btn"),
  modeTimedBtn: document.getElementById("mode-timed-btn"),
  statsSummary: document.getElementById("stats-summary"),
  board: document.getElementById("board"),
  keyboard: document.getElementById("keyboard"),
  timerDisplay: document.getElementById("timer-display"),
  newGameBtn: document.getElementById("new-game-btn"),
  endOverlay: document.getElementById("end-overlay"),
  endTitle: document.getElementById("end-title"),
  endWord: document.getElementById("end-word"),
  endWordLink: document.getElementById("end-word-link"),
  endStats: document.getElementById("end-stats"),
  playAgainSameBtn: document.getElementById("play-again-same-btn"),
  playAgainSwitchBtn: document.getElementById("play-again-switch-btn"),
  toast: document.getElementById("toast"),
};

let game = null;
let timer = null;

function otherMode(mode) {
  return mode === "timed" ? "untimed" : "timed";
}

function stopTimer() {
  if (timer) {
    timer.stop();
    timer = null;
  }
}

function showModeSelect() {
  stopTimer();
  el.gameScreen.hidden = true;
  el.endOverlay.hidden = true;
  el.modeSelect.hidden = false;
  el.timerDisplay.hidden = true;
  renderModeSelectStats(el.statsSummary, getStats("untimed"), getStats("timed"));
}

function showGameScreen() {
  el.modeSelect.hidden = true;
  el.endOverlay.hidden = true;
  el.gameScreen.hidden = false;
}

function persist() {
  setActiveGame(game);
}

function render() {
  renderBoard(el.board, game);
  updateKeyboardStatuses(el.keyboard, computeKeyboardStatuses(game.guesses, game.answer));
}

function startNewGame(mode) {
  stopTimer();
  const answer = pickNextWord();
  game = createGameState(mode, answer);
  persist();
  showGameScreen();
  buildKeyboard(el.keyboard);
  render();

  if (mode === "timed") {
    el.timerDisplay.hidden = false;
    startTimer();
  } else {
    el.timerDisplay.hidden = true;
  }
}

function startTimer() {
  timer = new GameTimer({
    startedAt: game.startedAt,
    durationMs: game.durationMs,
    onTick: (remaining) => renderTimer(el.timerDisplay, remaining),
    onExpire: () => endGame(false),
  });
  timer.start();
}

function resumeGame(active) {
  game = active;
  showGameScreen();
  buildKeyboard(el.keyboard);
  render();

  if (game.mode === "timed") {
    el.timerDisplay.hidden = false;
    const remaining = game.durationMs - (Date.now() - game.startedAt);
    if (remaining <= 0) {
      renderTimer(el.timerDisplay, 0);
      endGame(false);
      return;
    }
    startTimer();
  } else {
    el.timerDisplay.hidden = true;
  }
}

function updateStatsForResult(won) {
  const stats = getStats(game.mode);
  stats.gamesPlayed += 1;
  if (won) {
    stats.wins += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.guessDistribution[game.guesses.length - 1] += 1;
    if (game.mode === "timed") {
      const elapsed = Date.now() - game.startedAt;
      if (stats.bestTimeMs == null || elapsed < stats.bestTimeMs) {
        stats.bestTimeMs = elapsed;
      }
    }
  } else {
    stats.losses += 1;
    stats.currentStreak = 0;
  }
  setStats(game.mode, stats);
}

function endGame(won) {
  stopTimer();
  game.status = won ? "won" : "lost";
  persist();
  updateStatsForResult(won);
  render();

  el.endTitle.textContent = won ? "You won!" : "Out of guesses";
  el.endWord.textContent = `The word was ${game.answer}`;
  el.endWordLink.textContent = "See definition";
  el.endWordLink.href = `https://en.wiktionary.org/wiki/${game.answer.toLowerCase()}`;
  renderStatsSummary(el.endStats, getStats(game.mode), game.mode);

  el.playAgainSameBtn.innerHTML = `<span class="mode-btn-title">Play Again</span><span class="mode-btn-sub">${
    game.mode === "timed" ? "Timed (3 min)" : "Untimed"
  }</span>`;
  const other = otherMode(game.mode);
  el.playAgainSwitchBtn.innerHTML = `<span class="mode-btn-title">Switch Mode</span><span class="mode-btn-sub">${
    other === "timed" ? "Timed (3 min)" : "Untimed"
  }</span>`;

  el.endOverlay.hidden = false;
}

function handleKey(key) {
  if (!game || game.status !== "playing") return;

  if (key === "enter") {
    submitGuess();
  } else if (key === "backspace") {
    game.currentGuess = game.currentGuess.slice(0, -1);
    render();
  } else if (/^[a-z]$/.test(key)) {
    if (game.currentGuess.length < WORD_LENGTH) {
      game.currentGuess += key.toUpperCase();
      render();
    }
  }
}

function submitGuess() {
  const guess = game.currentGuess;
  if (guess.length !== WORD_LENGTH) {
    shakeRow(el.board, game.guesses.length);
    showToast(el.toast, "Not enough letters");
    return;
  }
  if (!isValidWord(guess)) {
    shakeRow(el.board, game.guesses.length);
    showToast(el.toast, "Not in word list");
    return;
  }

  game.guesses.push(guess);
  game.currentGuess = "";
  persist();
  render();

  const feedback = evaluateGuess(guess, game.answer);
  const won = feedback.every((s) => s === "correct");

  if (won) {
    endGame(true);
  } else if (game.guesses.length >= MAX_GUESSES) {
    endGame(false);
  }
}

el.modeUntimedBtn.addEventListener("click", () => startNewGame("untimed"));
el.modeTimedBtn.addEventListener("click", () => startNewGame("timed"));
el.newGameBtn.addEventListener("click", () => {
  clearActiveGame();
  showModeSelect();
});
el.playAgainSameBtn.addEventListener("click", () => startNewGame(game.mode));
el.playAgainSwitchBtn.addEventListener("click", () => startNewGame(otherMode(game.mode)));
el.endOverlay.addEventListener("click", (e) => {
  if (e.target === el.endOverlay) {
    el.endOverlay.hidden = true;
  }
});

attachKeyboardClicks(el.keyboard, handleKey);
attachPhysicalKeyboard(handleKey);

const active = getActiveGame();
if (active && active.status === "playing") {
  resumeGame(active);
} else {
  clearActiveGame();
  showModeSelect();
}
