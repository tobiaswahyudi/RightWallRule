import { MinHeap } from "../utils/priorityQueue.js";

/**************************************
 * pathfinding.js
 * 
 * Pathfinds.
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

export function computeNavDistancesToPlayer(grid, player, playerGridCell) {
  const pq = new MinHeap();
  grid.forEach(row => row.forEach(cell => {
    cell.visited = false;
    cell.distanceToPlayer = 0;
    cell.nextCell = null;
    cell.pathTarget = null;
  }));

  playerGridCell.visited = true;
  playerGridCell.distanceToPlayer = 0;
  playerGridCell.pathTarget = player.position;

  playerGridCell.neighbors.forEach(nbor => {
    pq.push({key: 0, cell: nbor, nextCell: null, pathTarget: player.position});
  })

  while(!pq.empty()) {
    const {key, cell, nextCell, pathTarget} = pq.pop();
    if(cell.visited) continue;
    cell.visited = true;
    cell.distanceToPlayer = key;
    cell.nextCell = nextCell;
    cell.pathTarget = pathTarget;

    cell.neighbors.forEach(nbor => {
      if(nbor.visited) return;
      pq.push({key: key + cell.center.delta(nbor.center).magnitude, cell: nbor, nextCell: cell, pathTarget: cell.center.copy.add(nbor.center).scale(0.5)});
    })
  }
}

export function computeChestToPlayerPaths(grid, chests) {
  for(const chest in chests) {

  }
}