const PREFIX = "wordle:";

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

function remove(key) {
  localStorage.removeItem(PREFIX + key);
}

export function getCycle() {
  return read("cycle", null);
}

export function setCycle(cycle) {
  write("cycle", cycle);
}

const EMPTY_STATS = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
};

export function getStats(mode) {
  const stats = read(`stats:${mode}`, { ...EMPTY_STATS, guessDistribution: [...EMPTY_STATS.guessDistribution] });
  if (mode === "timed" && stats.bestTimeMs === undefined) stats.bestTimeMs = null;
  return stats;
}

export function setStats(mode, stats) {
  write(`stats:${mode}`, stats);
}

export function getActiveGame() {
  return read("activeGame", null);
}

export function setActiveGame(game) {
  write("activeGame", game);
}

export function clearActiveGame() {
  remove("activeGame");
}
