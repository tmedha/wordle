export class GameTimer {
  constructor({ startedAt, durationMs, onTick, onExpire }) {
    this.startedAt = startedAt;
    this.durationMs = durationMs;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.intervalId = null;
  }

  remainingMs() {
    return Math.max(0, this.durationMs - (Date.now() - this.startedAt));
  }

  start() {
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 250);
  }

  tick() {
    const remaining = this.remainingMs();
    this.onTick(remaining);
    if (remaining <= 0) {
      this.stop();
      this.onExpire();
    }
  }

  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
