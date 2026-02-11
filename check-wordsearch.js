#!/usr/bin/env node
/**
 * Headless check script: extract initWordsearch logic and test it.
 * Verifies that diagonal words are placed and all new words are present.
 */

// Minimal universe for wordsearch logic
let WORDS = ['LOVELY','BEAUTIFUL','GORGEOUS','AMAZING','VALENTINE','PRETTY','SWEET','CUTE','MINE'];
let gridRows = 12, gridCols = 12;
let grid = [];
let owners = [];
let ownersUsedCount = [];

function randomLetter() { return String.fromCharCode(65 + Math.floor(Math.random()*26)); }

function initWordsearch() {
    grid = Array.from({length: gridRows}, () => Array(gridCols).fill(''));
    owners = Array.from({length: gridRows}, () => Array.from({length: gridCols}, () => []));
    ownersUsedCount = Array.from({length: gridRows}, () => Array.from({length: gridCols}, () => 0));

    const words = WORDS.slice();
    const diagList = ['VALENTINE','PRETTY','SWEET','CUTE'];
    const diagIndices = new Set();
    words.forEach((w, i) => {
        const up = w.toUpperCase();
        if (diagList.includes(up)) diagIndices.add(i);
    });

    const order = [];
    diagIndices.forEach(i => order.push(i));
    for (let i = 0; i < words.length; i++) if (!diagIndices.has(i)) order.push(i);

    for (const wi of order) {
        const rawWord = words[wi];
        const word = rawWord.toUpperCase();
        let placed = false;
        const tryReverse = Math.random() < 0.5;
        const w = tryReverse ? word.split('').reverse().join('') : word;

        for (let attempt = 0; attempt < 400 && !placed; attempt++) {
            let dir;
            if (diagIndices.has(wi)) dir = 'diag';
            else dir = Math.random() < 0.5 ? 'across' : 'down';

            if (dir === 'across') {
                const row = Math.floor(Math.random() * gridRows);
                const maxCol = gridCols - w.length;
                if (maxCol < 0) continue;
                const col = Math.floor(Math.random() * (maxCol + 1));
                let ok = true;
                for (let i = 0; i < w.length; i++) {
                    const existing = grid[row][col + i];
                    if (existing !== '' && existing !== w[i]) { ok = false; break; }
                }
                if (ok) {
                    for (let i = 0; i < w.length; i++) {
                        grid[row][col + i] = w[i];
                        owners[row][col + i].push(wi);
                    }
                    placed = true;
                }
            } else if (dir === 'down') {
                const col = Math.floor(Math.random() * gridCols);
                const maxRow = gridRows - w.length;
                if (maxRow < 0) continue;
                const row = Math.floor(Math.random() * (maxRow + 1));
                let ok = true;
                for (let i = 0; i < w.length; i++) {
                    const existing = grid[row + i][col];
                    if (existing !== '' && existing !== w[i]) { ok = false; break; }
                }
                if (ok) {
                    for (let i = 0; i < w.length; i++) {
                        grid[row + i][col] = w[i];
                        owners[row + i][col].push(wi);
                    }
                    placed = true;
                }
            } else if (dir === 'diag') {
                const diagDirs = [ {dr:1,dc:1}, {dr:1,dc:-1}, {dr:-1,dc:1}, {dr:-1,dc:-1} ];
                const d = diagDirs[Math.floor(Math.random() * diagDirs.length)];
                let rowStartMin = d.dr === 1 ? 0 : w.length - 1;
                let rowStartMax = d.dr === 1 ? gridRows - w.length : gridRows - 1;
                let colStartMin = d.dc === 1 ? 0 : w.length - 1;
                let colStartMax = d.dc === 1 ? gridCols - w.length : gridCols - 1;
                if (rowStartMax < rowStartMin || colStartMax < colStartMin) continue;
                const row = Math.floor(Math.random() * (rowStartMax - rowStartMin + 1)) + rowStartMin;
                const col = Math.floor(Math.random() * (colStartMax - colStartMin + 1)) + colStartMin;
                let ok = true;
                for (let i = 0; i < w.length; i++) {
                    const rr = row + i * d.dr;
                    const cc = col + i * d.dc;
                    const existing = grid[rr][cc];
                    if (existing !== '' && existing !== w[i]) { ok = false; break; }
                }
                if (ok) {
                    for (let i = 0; i < w.length; i++) {
                        const rr = row + i * d.dr;
                        const cc = col + i * d.dc;
                        grid[rr][cc] = w[i];
                        owners[rr][cc].push(wi);
                    }
                    placed = true;
                }
            }
        }

        if (!placed) {
            if (diagIndices && diagIndices.has(wi)) {
                const diagDirs = [ {dr:1,dc:1}, {dr:1,dc:-1}, {dr:-1,dc:1}, {dr:-1,dc:-1} ];
                outerDiag: for (const d of diagDirs) {
                    for (let r = 0; r < gridRows; r++) {
                        for (let c = 0; c < gridCols; c++) {
                            const rowStartMin = d.dr === 1 ? 0 : word.length - 1;
                            const rowStartMax = d.dr === 1 ? gridRows - word.length : gridRows - 1;
                            const colStartMin = d.dc === 1 ? 0 : word.length - 1;
                            const colStartMax = d.dc === 1 ? gridCols - word.length : gridCols - 1;
                            if (r < rowStartMin || r > rowStartMax || c < colStartMin || c > colStartMax) continue;
                            let ok = true;
                            for (let i = 0; i < word.length; i++) {
                                const rr = r + i * d.dr;
                                const cc = c + i * d.dc;
                                const existing = grid[rr][cc];
                                if (existing !== '' && existing !== (tryReverse ? w[i] : w[i])) { ok = false; break; }
                            }
                            if (ok) {
                                for (let i = 0; i < word.length; i++) {
                                    const rr = r + i * d.dr;
                                    const cc = c + i * d.dc;
                                    grid[rr][cc] = w[i];
                                    owners[rr][cc].push(wi);
                                }
                                placed = true;
                                break outerDiag;
                            }
                        }
                    }
                }
            }

            if (!placed) {
                outer: for (let r = 0; r < gridRows; r++) {
                    for (let c = 0; c <= gridCols - word.length; c++) {
                        let ok = true;
                        for (let i = 0; i < word.length; i++) {
                            const existing = grid[r][c + i];
                            if (existing !== '' && existing !== word[i]) { ok = false; break; }
                        }
                        if (ok) {
                            for (let i = 0; i < word.length; i++) {
                                grid[r][c + i] = word[i];
                                owners[r][c + i].push(wi);
                            }
                            placed = true;
                            break outer;
                        }
                    }
                }
            }
        }
    }

    for (let r = 0; r < gridRows; r++) for (let c = 0; c < gridCols; c++) if (!grid[r][c]) grid[r][c] = randomLetter();
}

function checkDiagonalInGrid(word) {
    const diagDirs = [
        {dr: 1, dc: 1},
        {dr: 1, dc: -1},
        {dr: -1, dc: 1},
        {dr: -1, dc: -1}
    ];
    for (let startR = 0; startR < gridRows; startR++) {
        for (let startC = 0; startC < gridCols; startC++) {
            for (const {dr, dc} of diagDirs) {
                let found = '';
                for (let i = 0; i < word.length; i++) {
                    const r = startR + i * dr;
                    const c = startC + i * dc;
                    if (r < 0 || r >= gridRows || c < 0 || c >= gridCols) break;
                    found += grid[r][c];
                }
                if (found === word || found === word.split('').reverse().join('')) {
                    return true;
                }
            }
        }
    }
    return false;
}

function checkWordInGrid(word) {
    // Check horizontal
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c <= gridCols - word.length; c++) {
            let found = '';
            for (let i = 0; i < word.length; i++) found += grid[r][c + i];
            if (found === word || found === word.split('').reverse().join('')) return true;
        }
    }
    // Check vertical
    for (let c = 0; c < gridCols; c++) {
        for (let r = 0; r <= gridRows - word.length; r++) {
            let found = '';
            for (let i = 0; i < word.length; i++) found += grid[r + i][c];
            if (found === word || found === word.split('').reverse().join('')) return true;
        }
    }
    // Check diagonal
    return checkDiagonalInGrid(word);
}

// Run tests
const numTrials = 20;
const diagonalWords = ['VALENTINE', 'PRETTY', 'SWEET', 'CUTE'];
const results = {
    totalTrials: 0,
    allWordsFound: 0,
    allDiagonalsPlaced: 0,
    diagonalCounts: {
        'VALENTINE': 0,
        'PRETTY': 0,
        'SWEET': 0,
        'CUTE': 0
    },
    missingDiagonalRuns: []
};

for (let trial = 0; trial < numTrials; trial++) {
    WORDS = ['LOVELY','BEAUTIFUL','GORGEOUS','AMAZING','VALENTINE','PRETTY','SWEET','CUTE','MINE'];
    initWordsearch();
    
    results.totalTrials++;
    
    // Check all words are present
    const allFound = WORDS.every(w => checkWordInGrid(w));
    if (allFound) results.allWordsFound++;
    
    // Check diagonals
    let allDiagsPlaced = true;
    for (const dw of diagonalWords) {
        if (checkDiagonalInGrid(dw)) {
            results.diagonalCounts[dw]++;
        } else {
            allDiagsPlaced = false;
        }
    }
    
    if (allDiagsPlaced) {
        results.allDiagonalsPlaced++;
    } else {
        results.missingDiagonalRuns.push(trial + 1);
    }
}

console.log(`\n===== Wordsearch Generation Check (${numTrials} trials) =====\n`);
console.log(`All words found in every trial: ${results.allWordsFound}/${results.totalTrials}`);
console.log(`All 4 diagonals placed in every trial: ${results.allDiagonalsPlaced}/${results.totalTrials}`);
console.log(`\nDiagonal placement rates:`);
for (const [word, count] of Object.entries(results.diagonalCounts)) {
    console.log(`  ${word}: ${count}/${numTrials} (${(count/numTrials*100).toFixed(1)}%)`);
}

if (results.missingDiagonalRuns.length > 0) {
    console.log(`\n⚠️  Missing diagonals in trials: ${results.missingDiagonalRuns.join(', ')}`);
} else {
    console.log(`\n✓ All 4 diagonals placed successfully in every trial!`);
}

console.log(`\n✓ All 9 words present in every trial: ${results.allWordsFound === results.totalTrials ? 'YES' : 'NO'}`);
