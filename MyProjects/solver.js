document.addEventListener('DOMContentLoaded', function() {
    const gridSizeSelector = document.getElementById('grid-size');
    const sudokuGrid = document.getElementById('sudoku-grid');
    const solveBtn = document.getElementById('solve-btn');
    const clearBtn = document.getElementById('clear-btn');
    const exampleBtn = document.getElementById('example-btn');
    const statusDiv = document.getElementById('status');
    
    // Dashboard elements
    const difficultyLevel = document.getElementById('difficulty-level');
    const emptyCells = document.getElementById('empty-cells');
    const filledCells = document.getElementById('filled-cells');
    const solvingTime = document.getElementById('solving-time');
    const validityStatus = document.getElementById('validity-status');
    const numberStats = document.getElementById('number-stats');
    
    let currentSize = parseInt(gridSizeSelector.value);
    let lastSolveTime = 0;
    
    // Initialize the grid
    createGrid(currentSize);
    
    // Event listeners
    gridSizeSelector.addEventListener('change', function() {
        currentSize = parseInt(this.value);
        createGrid(currentSize);
        updateDashboard();
    });
    
    solveBtn.addEventListener('click', function() {
        solve();
    });
    
    clearBtn.addEventListener('click', function() {
        clearGrid();
    });
    
    exampleBtn.addEventListener('click', function() {
        loadExample();
        updateDashboard();
    });
    
    // Create the Sudoku grid
    function createGrid(size) {
        // Clear existing grid
        sudokuGrid.innerHTML = '';
        
        // Update grid class
        sudokuGrid.className = `sudoku-grid size-${size}`;
        
        // Set grid layout
        let cellSize = size === 4 ? '70px' : size === 6 ? '60px' : '50px';
        sudokuGrid.style.gridTemplateColumns = `repeat(${size}, ${cellSize})`;
        sudokuGrid.style.gridTemplateRows = `repeat(${size}, ${cellSize})`;
        
        // Create cells
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.setAttribute('data-row', Math.floor(i / size));
            input.setAttribute('data-col', i % size);
            
            // Only allow valid inputs
            input.addEventListener('input', function(e) {
                const maxValue = size;
                const regex = new RegExp(`^[1-${maxValue}]$`);
                
                if (!regex.test(e.target.value)) {
                    e.target.value = '';
                }
                
                updateDashboard();
            });
            
            cell.appendChild(input);
            sudokuGrid.appendChild(cell);
        }
    }
    
    // Get the current puzzle state
    function getPuzzle() {
        const puzzle = [];
        const inputs = sudokuGrid.querySelectorAll('input');
        
        for (let i = 0; i < currentSize * currentSize; i++) {
            const value = inputs[i].value;
            puzzle.push(value === '' ? 0 : parseInt(value));
        }
        
        return puzzle;
    }
    
    // Set the puzzle state
    function setPuzzle(puzzle) {
        const inputs = sudokuGrid.querySelectorAll('input');
        
        inputs.forEach((input, index) => {
            input.value = puzzle[index] === 0 ? '' : puzzle[index];
            
            if (puzzle[index] !== 0) {
                input.classList.add('original-value');
            } else {
                input.classList.remove('original-value');
            }
            
            input.classList.remove('solved-value');
        });
    }
    
    // Set solved values
    function setSolved(puzzle, original) {
        const inputs = sudokuGrid.querySelectorAll('input');
        
        inputs.forEach((input, index) => {
            if (original[index] === 0 && puzzle[index] !== 0) {
                input.value = puzzle[index];
                input.classList.add('solved-value');
            }
        });
    }
    
    // Clear the grid
    function clearGrid() {
        const inputs = sudokuGrid.querySelectorAll('input');
        
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('original-value');
            input.classList.remove('solved-value');
        });
        
        statusDiv.textContent = '';
        lastSolveTime = 0;
        updateDashboard();
    }
    
    // Load example puzzles based on grid size
    function loadExample() {
        clearGrid();
        
        if (currentSize === 4) {
            // 4x4 example
            const example4x4 = [
                0, 0, 0, 4,
                0, 0, 0, 0,
                2, 0, 0, 3,
                4, 0, 1, 2
            ];
            setPuzzle(example4x4);
        } else if (currentSize === 6) {
            // 6x6 example
            const example6x6 = [
                0, 0, 0, 5, 0, 1,
                0, 0, 0, 0, 2, 0,
                0, 5, 6, 0, 0, 0,
                0, 0, 0, 2, 6, 0,
                0, 4, 0, 0, 0, 0,
                1, 0, 5, 0, 0, 0
            ];
            setPuzzle(example6x6);
        } else {
            // 9x9 example
            const example9x9 = [
                5, 3, 0, 0, 7, 0, 0, 0, 0,
                6, 0, 0, 1, 9, 5, 0, 0, 0,
                0, 9, 8, 0, 0, 0, 0, 6, 0,
                8, 0, 0, 0, 6, 0, 0, 0, 3,
                4, 0, 0, 8, 0, 3, 0, 0, 1,
                7, 0, 0, 0, 2, 0, 0, 0, 6,
                0, 6, 0, 0, 0, 0, 2, 8, 0,
                0, 0, 0, 4, 1, 9, 0, 0, 5,
                0, 0, 0, 0, 8, 0, 0, 7, 9
            ];
            setPuzzle(example9x9);
        }
    }
    
    // Solve the puzzle
    function solve() {
        const originalPuzzle = getPuzzle();
        
        // Check if the puzzle is valid
        const isValid = isValidPuzzle(originalPuzzle);
        validityStatus.textContent = isValid ? "Valid" : "Invalid";
        
        if (!isValid) {
            statusDiv.textContent = 'Invalid puzzle! Please check your inputs.';
            return;
        }
        
        // Make a copy of the puzzle to solve
        const puzzleCopy = [...originalPuzzle];
        
        const startTime = performance.now();
        const success = solveSudoku(puzzleCopy);
        const endTime = performance.now();
        
        lastSolveTime = (endTime - startTime) / 1000;
        
        if (success) {
            setSolved(puzzleCopy, originalPuzzle);
            statusDiv.textContent = `Solved in ${lastSolveTime.toFixed(3)} seconds`;
        } else {
            statusDiv.textContent = 'No solution exists for this puzzle!';
        }
        
        updateDashboard();
    }
    
    // Sudoku solver using backtracking
    function solveSudoku(puzzle) {
        const emptyCell = findEmptyCell(puzzle);
        
        // If no empty cell found, puzzle is solved
        if (!emptyCell) {
            return true;
        }
        
        const [row, col] = emptyCell;
        const index = row * currentSize + col;
        
        // Try each possible value
        for (let num = 1; num <= currentSize; num++) {
            if (isValidPlacement(puzzle, row, col, num)) {
                // Place the number
                puzzle[index] = num;
                
                // Recursively try to solve the rest
                if (solveSudoku(puzzle)) {
                    return true;
                }
                
                // If placing the number didn't lead to a solution, backtrack
                puzzle[index] = 0;
            }
        }
        
        // No solution found with current configuration
        return false;
    }
    
    // Find an empty cell in the puzzle
    function findEmptyCell(puzzle) {
        for (let row = 0; row < currentSize; row++) {
            for (let col = 0; col < currentSize; col++) {
                const index = row * currentSize + col;
                if (puzzle[index] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }
    
    // Check if a number placement is valid
    function isValidPlacement(puzzle, row, col, num) {
        const index = row * currentSize + col;
        
        // Check row
        for (let j = 0; j < currentSize; j++) {
            const rowIndex = row * currentSize + j;
            if (puzzle[rowIndex] === num) {
                return false;
            }
        }
        
        // Check column
        for (let i = 0; i < currentSize; i++) {
            const colIndex = i * currentSize + col;
            if (puzzle[colIndex] === num) {
                return false;
            }
        }
        
        // Check box
        // For 6x6, the box size is 2x3 (or 3x2)
        let boxSize, boxRows, boxCols;
        
        if (currentSize === 4) {
            boxSize = 2;
            boxRows = 2;
            boxCols = 2;
        } else if (currentSize === 6) {
            boxSize = 6;
            boxRows = 2;
            boxCols = 3;
        } else {
            boxSize = 9;
            boxRows = 3;
            boxCols = 3;
        }
        
        const boxRowStart = Math.floor(row / boxRows) * boxRows;
        const boxColStart = Math.floor(col / boxCols) * boxCols;
        
        for (let i = 0; i < boxRows; i++) {
            for (let j = 0; j < boxCols; j++) {
                const boxIndex = (boxRowStart + i) * currentSize + (boxColStart + j);
                if (puzzle[boxIndex] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Check if the initial puzzle is valid
    function isValidPuzzle(puzzle) {
        for (let row = 0; row < currentSize; row++) {
            for (let col = 0; col < currentSize; col++) {
                const index = row * currentSize + col;
                const value = puzzle[index];
                
                if (value !== 0) {
                    // Temporarily set to 0 to check if this position is valid
                    puzzle[index] = 0;
                    const valid = isValidPlacement(puzzle, row, col, value);
                    puzzle[index] = value; // Restore value
                    
                    if (!valid) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    // Calculate difficulty level based on number of filled cells and their positions
    function calculateDifficulty(puzzle) {
        const totalCells = currentSize * currentSize;
        const filledCount = puzzle.filter(cell => cell !== 0).length;
        const emptyCount = totalCells - filledCount;
        const filledRatio = filledCount / totalCells;
        
        if (emptyCount === 0) return "N/A";
        
        // Simple difficulty heuristic based on filled ratio
        if (filledRatio >= 0.6) return "Easy";
        if (filledRatio >= 0.4) return "Medium";
        if (filledRatio >= 0.25) return "Hard";
        return "Expert";
    }
    
    // Count number occurrences in the puzzle
    function countNumbers(puzzle) {
        const counts = Array(currentSize + 1).fill(0); // +1 for 0 (empty cells)
        
        for (let i = 0; i < puzzle.length; i++) {
            counts[puzzle[i]]++;
        }
        
        return counts;
    }
    
    // Update dashboard with current puzzle info
    function updateDashboard() {
        const puzzle = getPuzzle();
        const totalCells = currentSize * currentSize;
        const filledCount = puzzle.filter(cell => cell !== 0).length;
        const emptyCount = totalCells - filledCount;
        
        // Update stats
        difficultyLevel.textContent = calculateDifficulty(puzzle);
        emptyCells.textContent = emptyCount;
        filledCells.textContent = filledCount;
        solvingTime.textContent = lastSolveTime > 0 ? `${lastSolveTime.toFixed(3)} sec` : "N/A";
        
        // Check validity only if there are filled cells
        if (filledCount > 0) {
            validityStatus.textContent = isValidPuzzle(puzzle) ? "Valid" : "Invalid";
        } else {
            validityStatus.textContent = "Not checked";
        }
        
        // Update number distribution
        updateNumberDistribution(puzzle);
    }
    
    // Update number distribution stats
    function updateNumberDistribution(puzzle) {
        const counts = countNumbers(puzzle);
        numberStats.innerHTML = '';
        
        for (let i = 1; i <= currentSize; i++) {
            const numberStat = document.createElement('div');
            numberStat.className = 'number-stat';
            
            const digit = document.createElement('div');
            digit.className = 'number-stat-digit';
            digit.textContent = i;
            
            const count = document.createElement('div');
            count.className = 'number-stat-count';
            count.textContent = counts[i];
            
            numberStat.appendChild(digit);
            numberStat.appendChild(count);
            numberStats.appendChild(numberStat);
        }
    }
    
    // Initialize dashboard
    updateDashboard();
  });