import { WORDS } from "../data/words.js";
import { getCycle, setCycle } from "./state.js";

function hashWords(words) {
  let hash = 5381;
  const joined = words.length + ":" + words.join(",");
  for (let i = 0; i < joined.length; i++) {
    hash = (hash * 33) ^ joined.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

const SIGNATURE = hashWords(WORDS);

function loadCycle() {
  const stored = getCycle();
  if (!stored || stored.signature !== SIGNATURE) {
    const fresh = { signature: SIGNATURE, usedWords: [], cycleNumber: 1 };
    setCycle(fresh);
    return fresh;
  }
  return stored;
}

export function pickNextWord() {
  const cycle = loadCycle();
  const used = new Set(cycle.usedWords);
  let available = WORDS.filter((w) => !used.has(w));

  if (available.length === 0) {
    cycle.usedWords = [];
    cycle.cycleNumber += 1;
    available = WORDS;
  }

  const word = available[Math.floor(Math.random() * available.length)];
  cycle.usedWords.push(word);
  setCycle(cycle);
  return word;
}

export function isValidWord(word) {
  return WORDS.includes(word.toUpperCase());
}
