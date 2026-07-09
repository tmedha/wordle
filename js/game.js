export const MAX_GUESSES = 6;
export const WORD_LENGTH = 5;

/**
 * Two-pass evaluation so duplicate letters in the guess are only credited
 * as "present" as many times as they actually remain in the answer.
 */
export function evaluateGuess(guess, answer) {
  const result = new Array(WORD_LENGTH).fill("absent");
  const answerLetters = answer.split("");
  const guessLetters = guess.split("");
  const consumed = new Array(WORD_LENGTH).fill(false);

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      result[i] = "correct";
      consumed[i] = true;
      guessLetters[i] = null;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] === null) continue;
    const idx = answerLetters.findIndex((ch, j) => ch === guessLetters[i] && !consumed[j]);
    if (idx !== -1) {
      result[i] = "present";
      consumed[idx] = true;
    }
  }

  return result;
}

const STATUS_RANK = { absent: 0, present: 1, correct: 2 };

export function computeKeyboardStatuses(guesses, answer) {
  const statuses = {};
  for (const guess of guesses) {
    const feedback = evaluateGuess(guess, answer);
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = guess[i];
      const status = feedback[i];
      if (!statuses[letter] || STATUS_RANK[status] > STATUS_RANK[statuses[letter]]) {
        statuses[letter] = status;
      }
    }
  }
  return statuses;
}

export function createGameState(mode, answer) {
  return {
    mode,
    answer,
    guesses: [],
    currentGuess: "",
    status: "playing",
    startedAt: Date.now(),
    durationMs: mode === "timed" ? 180000 : null,
  };
}
