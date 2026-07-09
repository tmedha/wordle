const KEY_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
];

export function buildKeyboard(container, onKey) {
  container.innerHTML = "";
  for (const row of KEY_ROWS) {
    const rowEl = document.createElement("div");
    rowEl.className = "keyboard-row";
    for (const key of row) {
      const btn = document.createElement("button");
      btn.className = "key";
      btn.dataset.key = key;
      btn.textContent = key === "backspace" ? "⌫" : key === "enter" ? "Enter" : key;
      rowEl.appendChild(btn);
    }
    container.appendChild(rowEl);
  }

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-key]");
    if (!btn) return;
    onKey(btn.dataset.key);
  });
}

export function attachPhysicalKeyboard(onKey) {
  const handler = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (key === "enter" || key === "backspace") {
      onKey(key);
    } else if (/^[a-z]$/.test(key)) {
      onKey(key);
    }
  };
  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}

export function updateKeyboardStatuses(container, statuses) {
  const buttons = container.querySelectorAll("button[data-key]");
  for (const btn of buttons) {
    const status = statuses[btn.dataset.key.toUpperCase()];
    if (status) {
      btn.dataset.status = status;
    } else {
      delete btn.dataset.status;
    }
  }
}
