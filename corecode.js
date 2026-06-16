// ── 1. Generate Grid ──────────────────────────────────────────────────────
function generateGrid() {
  const container = document.getElementById("grid-container");
  for (let i = 0; i < 81; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 1;
    input.id = `cell-${i}`;

    // Input validation — only 1-9 allowed
    input.addEventListener("keydown", (e) => {
      const allowed = ["1","2","3","4","5","6","7","8","9",
                       "Backspace","Delete","ArrowLeft","ArrowRight",
                       "ArrowUp","ArrowDown","Tab"];
      if (!allowed.includes(e.key)) e.preventDefault();
    });

    // Reset solution on edit
    input.addEventListener("input", () => resetSolution());

    container.appendChild(input);
  }
}

// ── 2. Read Grid ──────────────────────────────────────────────────────────
function readGrid() {
  const board = [];
  for (let r = 0; r < 9; r++) {
    board[r] = [];
    for (let c = 0; c < 9; c++) {
      const val = document.getElementById(`cell-${r * 9 + c}`).value;
      board[r][c] = val ? parseInt(val) : 0;
    }
  }
  return board;
}

// ── 3. Write Grid ─────────────────────────────────────────────────────────
function writeGrid(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.getElementById(`cell-${r * 9 + c}`);
      if (!cell.classList.contains("given") && board[r][c] !== 0) {
        cell.value = board[r][c];
        cell.classList.add("solved");
      }
    }
  }
}

// ── 4. Mark Givens ────────────────────────────────────────────────────────
function markGivens() {
  for (let i = 0; i < 81; i++) {
    const cell = document.getElementById(`cell-${i}`);
    if (cell.value) {
      cell.classList.add("given");
    }
  }
}

// ── 5. Check Conflicts ────────────────────────────────────────────────────
function checkConflicts(board) {
  let hasConflict = false;

  // Clear previous conflict highlights
  for (let i = 0; i < 81; i++) {
    document.getElementById(`cell-${i}`).classList.remove("conflict");
  }

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val === 0) continue;

      // Check row
      for (let cc = 0; cc < 9; cc++) {
        if (cc !== c && board[r][cc] === val) {
          document.getElementById(`cell-${r * 9 + c}`).classList.add("conflict");
          document.getElementById(`cell-${r * 9 + cc}`).classList.add("conflict");
          hasConflict = true;
        }
      }

      // Check column
      for (let rr = 0; rr < 9; rr++) {
        if (rr !== r && board[rr][c] === val) {
          document.getElementById(`cell-${r * 9 + c}`).classList.add("conflict");
          document.getElementById(`cell-${rr * 9 + c}`).classList.add("conflict");
          hasConflict = true;
        }
      }

      // Check 3x3 block
      const blockR = Math.floor(r / 3) * 3;
      const blockC = Math.floor(c / 3) * 3;
      for (let br = blockR; br < blockR + 3; br++) {
        for (let bc = blockC; bc < blockC + 3; bc++) {
          if ((br !== r || bc !== c) && board[br][bc] === val) {
            document.getElementById(`cell-${r * 9 + c}`).classList.add("conflict");
            document.getElementById(`cell-${br * 9 + bc}`).classList.add("conflict");
            hasConflict = true;
          }
        }
      }
    }
  }
  return hasConflict;
}

// ── 6. Get Possibilities for a cell ──────────────────────────────────────
function getPossibilities(board, r, c) {
  if (board[r][c] !== 0) return new Set();
  const used = new Set();

  // Row
  for (let cc = 0; cc < 9; cc++) if (board[r][cc]) used.add(board[r][cc]);
  // Column
  for (let rr = 0; rr < 9; rr++) if (board[rr][c]) used.add(board[rr][c]);
  // 3x3 block
  const blockR = Math.floor(r / 3) * 3;
  const blockC = Math.floor(c / 3) * 3;
  for (let br = blockR; br < blockR + 3; br++)
    for (let bc = blockC; bc < blockC + 3; bc++)
      if (board[br][bc]) used.add(board[br][bc]);

  const possible = new Set();
  for (let n = 1; n <= 9; n++) if (!used.has(n)) possible.add(n);
  return possible;
}

// ── 7. Constraint Propagation ─────────────────────────────────────────────
function propagate(board) {
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== 0) continue;
        const possible = getPossibilities(board, r, c);
        if (possible.size === 0) return false; // contradiction
        if (possible.size === 1) {
          board[r][c] = [...possible][0];
          changed = true;
        }
      }
    }
  }
  return true;
}

// ── 8. Backtracking ───────────────────────────────────────────────────────
function backtrack(board) {
  // First propagate
  if (!propagate(board)) return false;

  // Find empty cell with fewest possibilities (MRV heuristic)
  let minSize = 10, bestR = -1, bestC = -1, bestPossible = null;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;
      const possible = getPossibilities(board, r, c);
      if (possible.size < minSize) {
        minSize = possible.size;
        bestR = r; bestC = c;
        bestPossible = possible;
      }
    }
  }

  // No empty cells → solved!
  if (bestR === -1) return true;

  // Try each possibility
  for (const val of bestPossible) {
    // Deep copy board before guessing
    const copy = board.map(row => [...row]);
    copy[bestR][bestC] = val;
    if (backtrack(copy)) {
      // Copy solution back into original board
      for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
          board[r][c] = copy[r][c];
      return true;
    }
  }
  return false; // no value worked
}

// ── 9. Reset Solution ─────────────────────────────────────────────────────
function resetSolution() {
  for (let i = 0; i < 81; i++) {
    const cell = document.getElementById(`cell-${i}`);
    cell.classList.remove("solved", "conflict");
    if (cell.classList.contains("given") && !cell.value) {
      cell.classList.remove("given");
    }
  }
  document.getElementById("error-msg").textContent = "";
}

// ── 10. Clear Grid ────────────────────────────────────────────────────────
function clearGrid() {
  for (let i = 0; i < 81; i++) {
    const cell = document.getElementById(`cell-${i}`);
    cell.value = "";
    cell.classList.remove("given", "solved", "conflict");
  }
  document.getElementById("error-msg").textContent = "";
}

// ── 11. Main Solve Function ───────────────────────────────────────────────
function solveGrid() {
  const errorMsg = document.getElementById("error-msg");
  errorMsg.textContent = "";

  const board = readGrid();

  // Check for conflicts in given numbers
  if (checkConflicts(board)) {
    errorMsg.textContent = "Conflict detected — duplicate values in row, column, or block.";
    return;
  }

  markGivens();

  // Solve
  if (backtrack(board)) {
    writeGrid(board);
  } else {
    errorMsg.textContent = "No solution exists for this puzzle.";
  }
}

// ── 12. Button listeners + init ───────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  generateGrid();
  document.getElementById("solve-btn").addEventListener("click", solveGrid);
  document.getElementById("clear-btn").addEventListener("click", clearGrid);
});