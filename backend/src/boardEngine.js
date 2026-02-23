'use strict';

/**
 * Generate a fresh Minesweeper board.
 * Returns a 2-D array [row][col] of cell objects.
 */
function generateBoard(rows = 16, cols = 16, mineCount = 40) {
    // Build blank grid
    const board = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({
            mine: false,
            revealed: false,
            flagged: false,
            adjacentMines: 0,
        }))
    );

    // Place mines randomly
    let placed = 0;
    while (placed < mineCount) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if (!board[r][c].mine) {
            board[r][c].mine = true;
            placed++;
        }
    }

    // Compute adjacentMines for every cell
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c].mine) continue;
            board[r][c].adjacentMines = getNeighbours(board, r, c, rows, cols).filter(
                ([nr, nc]) => board[nr][nc].mine
            ).length;
        }
    }

    return board;
}

/**
 * Return all valid neighbour coordinates for (r, c).
 */
function getNeighbours(board, r, c, rows, cols) {
    const neighbours = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                neighbours.push([nr, nc]);
            }
        }
    }
    return neighbours;
}

/**
 * Reveal a cell at (row, col).
 * - If it's a mine, sets it to revealed and returns { board, hit: true }.
 * - If adjacentMines === 0, cascade-reveals all connected empty cells.
 * Returns a deep copy of the board to avoid mutation surprises.
 */
function revealCell(board, row, col) {
    const rows = board.length;
    const cols = board[0].length;

    // Deep copy
    const b = board.map((r) => r.map((cell) => ({ ...cell })));

    const cell = b[row][col];

    // Already revealed or flagged — no-op
    if (cell.revealed || cell.flagged) return { board: b, hit: false };

    cell.revealed = true;

    if (cell.mine) return { board: b, hit: true };

    // BFS cascade for empty cells
    if (cell.adjacentMines === 0) {
        const queue = [[row, col]];
        while (queue.length > 0) {
            const [r, c] = queue.shift();
            for (const [nr, nc] of getNeighbours(b, r, c, rows, cols)) {
                const n = b[nr][nc];
                if (!n.revealed && !n.flagged && !n.mine) {
                    n.revealed = true;
                    if (n.adjacentMines === 0) queue.push([nr, nc]);
                }
            }
        }
    }

    return { board: b, hit: false };
}

/**
 * Toggle a flag on a cell. Cannot flag revealed cells.
 * Returns a deep copy of the board.
 */
function toggleFlag(board, row, col) {
    const b = board.map((r) => r.map((cell) => ({ ...cell })));
    const cell = b[row][col];
    if (!cell.revealed) {
        cell.flagged = !cell.flagged;
    }
    return b;
}

/**
 * Check if the game is won: every non-mine cell must be revealed.
 */
function checkWin(board) {
    return board.every((row) =>
        row.every((cell) => cell.mine || cell.revealed)
    );
}

/**
 * Produce a safe client view by stripping `mine` from unrevealed cells.
 * Revealed mine cells keep mine=true so clients can show the explosion.
 */
function maskBoard(board) {
    return board.map((row) =>
        row.map(({ mine, revealed, flagged, adjacentMines }) => ({
            revealed,
            flagged,
            adjacentMines: revealed ? adjacentMines : 0,
            // Only expose mine=true if already revealed (game over situation)
            ...(revealed && mine ? { mine: true } : {}),
        }))
    );
}

module.exports = { generateBoard, revealCell, toggleFlag, checkWin, maskBoard };
