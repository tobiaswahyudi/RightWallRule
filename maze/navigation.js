/**************************************
 * navigation.js
 * 
 * Describes and generates the navigation grid for the maze.
 * The actual pathfinding is implemented in pathfinding.js
 **************************************/

export function generateNavigationGraph(cells) {
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

export default {
  generateNavigationGraph,
};