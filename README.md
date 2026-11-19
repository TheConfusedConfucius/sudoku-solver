# sudoku-solver
A small local sudoku solver webpage. The logic is all in the frontend (mostly just Backtracking +Constrained Propagation aka ever).

## How it works
The solver has two main strategies used combined.
###     Constrained Propagation:
    In this, each cell has a list of all numbers from 1 to 9, with each number getting eliminated based on the numbers in its row/column/box. The cell whose list has only a single number will be filled with that number, and the other cell's lists would be updated accordingly
###     Backtracking:
    In CP (the above one), there's an issue when every cell has more than one possible values. In such a case, Backtracking is done, which is basically trial-and-error. A cell's values are checked one by one, ensuring the board gets solved. If it isn't solved, then that number is excluded and the next numbers are tried.


## How to Run the Sudoku Solver


### Method 1: (Codespaces)
Open a codespace, then in the terminal, type bash run.sh

### Method 2a: (Linux/Mac)
Download the file, then on your Linux/Mac Terminal, type bash run.sh

### Method 2b: (Windows)
Download the file, then click on the runw.bat file.

### Method 2c: (TempleOS)
I doubt if this game even fits in a screen of 640 x 480. Figure out a way to run it yourself, techboy. 