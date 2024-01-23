import { MinHeap } from "../utils/priorityQueue.js";
import { Vector2 } from "../utils/vector2.js";

/**************************************
 * pathfinding.js
 * 
 * Pathfinds.
 **************************************/

const DIRECTIONS = ["E", "N", "W", "S"];

export function dirIndex(dir) {
  return DIRECTIONS.indexOf(dir);
}

function nextCCWDir(dir, gap = 1) {
  return DIRECTIONS[(dirIndex(dir) + gap) % 4];
}

export function dirIndexGap(inDir, outDir) {
  return (dirIndex(inDir) - dirIndex(outDir) + 3) % 4;
}

export const INDEX_GAP = {
  LeftTurn: 0,
  TurnBack: 1,
  RightTurn: 2,
  Ahead: 3
};

export function makeElbow(fromPoint, toPoint, inDir, outDir) {
  // Just wanna know whether in line or not
  if(dirIndexGap(inDir, outDir) == INDEX_GAP.Ahead) return [toPoint];
  // If not in line, it's easy:
  let inAxis = (inDir == 'N' || inDir == 'S') ? 'x' : 'y';
  let outAxis = (inAxis == 'x') ? 'y' : 'x';

  const corner = new Vector2(0, 0);
  corner[inAxis] = fromPoint[inAxis];
  corner[outAxis] = toPoint[outAxis];

  return [corner, toPoint];
}

// me.neighbors[i] = [nbor,dir] means that nbor[dir] = me.
export function generateNavigationGraph(cells) {
  cells.forEach((row, rowIdx) => row.forEach((cell, colIdx) => {
    if(!cell.E) {
      cell.neighbors.push([cells[rowIdx][colIdx + 1], "W"]);
      cells[rowIdx][colIdx + 1].neighbors.push([cell, "E"]);
    }
    if(!cell.S) {
      cell.neighbors.push([cells[rowIdx + 1][colIdx], "N"]);
      cells[rowIdx + 1][colIdx].neighbors.push([cell, "S"]);
    }
  }));
}

export function computeNavDistancesToPlayer(grid, player, playerGridCell) {
  const pq = new MinHeap();
  grid.forEach(row => row.forEach(cell => {
    cell.visited = false;
    cell.distanceToPlayer = 0;
    cell.nextCell = null;
    cell.nextCellDir = null;
    cell.pathTarget = null;

    cell.chestPaths = [];
    cell.chestPathsByDir = [[], [], []];
  }));

  playerGridCell.visited = true;
  playerGridCell.distanceToPlayer = 0;
  playerGridCell.pathTarget = player.position;

  playerGridCell.neighbors.forEach(([nbor, dir]) => {
    pq.push({key: 0, cell: nbor, nextCell: null, nextCellDir: dir, pathTarget: player.position});
  })

  while(!pq.empty()) {
    const {key, cell, nextCell, nextCellDir, pathTarget} = pq.pop();
    if(cell.visited) continue;
    cell.visited = true;
    cell.distanceToPlayer = key;
    cell.nextCell = nextCell;
    cell.nextCellDir = nextCellDir;
    cell.pathTarget = pathTarget;

    cell.neighbors.forEach(([nbor, dir]) => {
      if(nbor.visited) return;
      pq.push({key: key + cell.center.delta(nbor.center).magnitude, cell: nbor, nextCell: cell, nextCellDir: dir, pathTarget: cell.center.copy.add(nbor.center).scale(0.5)});
    })
  }
}

export function computeChestToPlayerPaths(chests) {
  for(const chest of chests) {
    let accumulator = [chest];
    let inDir = nextCCWDir(chest.cell.nextCellDir, 2);
    let curCell = chest.cell.nextCell;

    while(curCell) {
      curCell.chestPathsByDir[dirIndexGap(inDir, curCell.nextCellDir)] = accumulator;
      curCell.chestPaths = curCell.chestPathsByDir.flat();
      accumulator = curCell.chestPaths;
      inDir = nextCCWDir(curCell.nextCellDir, 2);
      curCell = curCell.nextCell;
    }
  }
}