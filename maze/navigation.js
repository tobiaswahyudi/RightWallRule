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
    this.x = (col + rowOffset) * CONFIG.mazeCellSize;
    this.y = (row + colOffset) * CONFIG.mazeCellSize;

    this.neighbors = [];
    this.visited = false;
    this.distanceToPlayer = 0;
    this.prev = null;
  }
}

function generateNavigationGraph(cells) {
  const gridPoints = [];

  cells.forEach((row, rowIdx) => row.forEach((cell, colIdx) => {
    cell.points = [];
    if(!cell.E) {
      const eastPoint = new NavigationPoint(gridPoints.length, cell.row, cell.col, 1, 0.5);
      gridPoints.push(eastPoint);
      cell.eastPoint = eastPoint;
    } else cell.eastPoint = null;
    if(!cell.S) {
      const southPoint = new NavigationPoint(gridPoints.length, cell.row, cell.col, 0.5, 1);
      gridPoints.push(southPoint);
      cell.southPoint = southPoint;
    } else cell.southPoint = null;
    if(!cell.S && !cell.E) {
      cell.southPoint.neighbors.push(cell.eastPoint);
      cell.eastPoint.neighbors.push(cell.southPoint);
    }
    if(rowIdx != 0 && !cells[rowIdx-1][colIdx].S) {
      cell.northPoint = cells[rowIdx-1][colIdx].southPoint;
      if(!cell.S) {
        cell.northPoint.neighbors.push(cell.southPoint);
        cell.southPoint.neighbors.push(cell.northPoint);
      }
      if(!cell.E) {
        cell.northPoint.neighbors.push(cell.eastPoint);
        cell.eastPoint.neighbors.push(cell.northPoint);
      }
    } else cell.northPoint = null;
    if(colIdx != 0 && !cells[rowIdx][colIdx-1].E) {
      cell.westPoint = cells[rowIdx][colIdx-1].eastPoint;
      if(!cell.S) {
        cell.westPoint.neighbors.push(cell.southPoint);
        cell.southPoint.neighbors.push(cell.westPoint);
      }
      if(!cell.E) {
        cell.westPoint.neighbors.push(cell.eastPoint);
        cell.eastPoint.neighbors.push(cell.westPoint);
      }
      if(!cell.N) {
        cell.westPoint.neighbors.push(cell.northPoint);
        cell.northPoint.neighbors.push(cell.westPoint);
      }
    } else cell.westPoint = null;
  }));
  
  return gridPoints;
}
