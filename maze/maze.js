import { SIZES, CONFIG } from "../config.js";
import { Vector2 } from "../utils/vector2.js";
import { UnionFind } from "../utils/unionFind.js";
import { coinFlip, randomChoice } from "../utils/random.js";
import { generateNavigationGraph } from "./navigation.js";


export function indexifyRowCol(row, col) {
  return row * CONFIG.mazeGridSize + col;
}

export function deindexifyRowCol(idx) {
  const row = Math.trunc(idx / CONFIG.mazeGridSize);
  const col = idx % CONFIG.mazeGridSize;

  return [row,col];
}

export class GridCell {
  constructor(row, col) {
    this.N = false;
    this.E = false;
    this.W = false;
    this.S = false;
    this.row = row;
    this.col = col;

    this.center = new Vector2(col + 0.5, row + 0.5).scale(SIZES.mazeCell);

    this.wallCount = 0;

    this.neighbors = [];
  }
}

export class Maze {
  constructor(wallProbability) {
    this.grid = Array(CONFIG.mazeGridSize).fill(0).map((v, rowIdx) => Array(CONFIG.mazeGridSize).fill(0).map((v, colIdx) => new GridCell(rowIdx, colIdx)));

    this.unionFind = new UnionFind(CONFIG.mazeGridSize * CONFIG.mazeGridSize);
    this.deadEnds = []

    this.generate(wallProbability);
  }

  generate(wallProbability) {
    for(let row = 0; row < CONFIG.mazeGridSize; row++) {
      for(let col = 0; col < CONFIG.mazeGridSize; col++) {
        if(col == CONFIG.mazeGridSize - 1) {
          this.grid[row][col].E = true;
        } else {
          const wall = coinFlip(wallProbability)
          this.grid[row][col].E = wall;
          if(!wall) this.unionFind.unite((row * CONFIG.mazeGridSize + col), (row * CONFIG.mazeGridSize + col + 1));
        }
        if(row == CONFIG.mazeGridSize - 1) {
          this.grid[row][col].S = true;
        } else {
          const wall = coinFlip(wallProbability)
          this.grid[row][col].S = wall;
          if(!wall) this.unionFind.unite((row * CONFIG.mazeGridSize + col), (row * CONFIG.mazeGridSize + col + CONFIG.mazeGridSize));
        }
      }
    }

    const componentSet = new Set();

    for(let idx = 0; idx < CONFIG.mazeGridSize * CONFIG.mazeGridSize; idx++) {
      if(this.unionFind.findPar(idx) == idx) componentSet.add(idx);
    }

    while(componentSet.size > 1) {
      const component = randomChoice(componentSet, componentSet.size);
      const elements = []
      for(let idx = 0; idx < CONFIG.mazeGridSize * CONFIG.mazeGridSize; idx++) {
        if(this.unionFind.findPar(idx) == component) elements.push(idx);
      }
      const walls = []
      elements.forEach(idx => {
        const row = Math.trunc(idx / CONFIG.mazeGridSize);
        const col = idx % CONFIG.mazeGridSize;

        if(!this.grid[row][col].E && !this.grid[row][col].S) return;
        if(this.grid[row][col].E && col != CONFIG.mazeGridSize - 1 && this.unionFind.findPar(idx) != this.unionFind.findPar(idx + 1)) {
          walls.push([idx, 'E']);
        }
        if(this.grid[row][col].S && row != CONFIG.mazeGridSize - 1 && this.unionFind.findPar(idx) != this.unionFind.findPar(idx + CONFIG.mazeGridSize)) {
          walls.push([idx, 'S']);
        }
      })

      // Pick another component?
      // This happens if component is bottom-right
      if(walls.length == 0) continue;

      const [idx, direction] = randomChoice(walls, walls.length);

      const [row,col] = deindexifyRowCol(idx);

      const adjacentCellOffset = direction == 'E' ? 1 : CONFIG.mazeGridSize;

      this.grid[row][col][direction] = false;
      const yieldingParent = this.unionFind.yieldingParent(idx, idx + adjacentCellOffset);
      componentSet.delete(yieldingParent);
      this.unionFind.unite(idx, idx + adjacentCellOffset);
    }

    for(let row = 0; row < CONFIG.mazeGridSize; row++) {
      this.grid[row][0].W = true;
      this.grid[row][0].wallCount++;
      this.grid[row][CONFIG.mazeGridSize - 1].wallCount++;    }
    for(let col = 0; col < CONFIG.mazeGridSize; col++) {
      this.grid[0][col].N = true;
      this.grid[0][col].wallCount++;
      this.grid[CONFIG.mazeGridSize - 1][col].wallCount++;
    }
    for(let row = 0; row < CONFIG.mazeGridSize; row++) {
      for(let col = 0; col < CONFIG.mazeGridSize; col++) {
        if(this.grid[row][col].S && row != CONFIG.mazeGridSize - 1) {
          this.grid[row][col].wallCount += 1;
          this.grid[row+1][col].wallCount += 1;
          this.grid[row+1][col].N = true;
        }
        if(this.grid[row][col].E && col != CONFIG.mazeGridSize - 1) {
          this.grid[row][col].wallCount += 1;
          this.grid[row][col+1].wallCount += 1;
          this.grid[row][col+1].W = true;
        }
        if(this.grid[row][col].wallCount == 3) this.deadEnds.push(this.grid[row][col]); 
      }
    }
    generateNavigationGraph(this.grid);
  }

  generateWalls() {
    const walls = [
      [0, CONFIG.mazeGridSize, 0, 0],
      [CONFIG.mazeGridSize, CONFIG.mazeGridSize, 0, CONFIG.mazeGridSize],
      [0, CONFIG.mazeGridSize, CONFIG.mazeGridSize, CONFIG.mazeGridSize],
      [0, 0, 0, CONFIG.mazeGridSize]
    ]

    let wallStart = null;
    for(let row = 0; row < CONFIG.mazeGridSize - 1; row++) {
      for(let col = 0; col < CONFIG.mazeGridSize; col++) {
        if(this.grid[row][col].S) {
          if(wallStart == null) wallStart = col;
        } else if(wallStart != null) {
          walls.push([wallStart, col, row + 1, row + 1]);
          wallStart = null;
        }
      }
      if(wallStart != null) {
        walls.push([wallStart, CONFIG.mazeGridSize, row + 1, row + 1]);
        wallStart = null;
      }
    }

    for(let col = 0; col < CONFIG.mazeGridSize - 1; col++) {
      for(let row = 0; row < CONFIG.mazeGridSize; row++) {
        if(this.grid[row][col].E) {
          if(wallStart == null) wallStart = row;
        } else if(wallStart != null) {
          walls.push([col+1, col+1, wallStart, row]);
          wallStart = null;
        }
      }
      if(wallStart != null) {
        walls.push([col+1, col+1, wallStart, CONFIG.mazeGridSize]);
        wallStart = null;
      }
    }

    return walls;
  }
}