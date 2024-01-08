/**************************************
 * navigation.js
 * 
 * Describes and generates the navigation grid for the maze.
 * The actual pathfinding is implemented in pathfinding.js
 **************************************/

class NavigationPoint {
  constructor(idx, row, col, rowOffset, colOffset) {
    this.idx = idx;
    this.row = row;
    this.col = col;
    this.position = new Vector2(col + rowOffset, row + colOffset).scale(CONFIG.mazeCellSize);

    this.neighbors = [];
    this.visited = false;
    this.distanceToPlayer = 0;
    this.prev = null;
  }
}

function generateNavigationGraph(cells) {
  cells.forEach((row, rowIdx) => row.forEach((cell, colIdx) => {
    if(!cell.E) {
      cell.neighbors.push(cells[rowIdx][colIdx + 1]);
      cells[rowIdx][colIdx + 1].neighbors.push(cell);
    }
    if(!cell.S) {
      cell.neighbors.push(cells[rowIdx + 1][colIdx]);
      cells[rowIdx + 1][colIdx].neighbors.push(cell);
    }
  }));
}
