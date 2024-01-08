import { SIZES, CONFIG } from "../config.js";
import { Vector2 } from "../utils/vector2.js";
import { UnionFind } from "../utils/unionFind.js";
import { coinFlip, randomChoice } from "../utils/random.js";
import { generateNavigationGraph } from "./navigation.js";

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
  constructor(size, wallProbability) {
    this.size = size;
    this.grid = Array(size).fill(0).map((v, rowIdx) => Array(size).fill(0).map((v, colIdx) => new GridCell(rowIdx, colIdx)));

    this.unionFind = new UnionFind(size * size);
    this.deadEnds = []

    this.generate(wallProbability);
  }

  generate(wallProbability) {
    for(let row = 0; row < this.size; row++) {
      for(let col = 0; col < this.size; col++) {
        if(col == this.size - 1) {
          this.grid[row][col].E = true;
        } else {
          const wall = coinFlip(wallProbability)
          this.grid[row][col].E = wall;
          if(!wall) this.unionFind.unite((row * this.size + col), (row * this.size + col + 1));
        }
        if(row == this.size - 1) {
          this.grid[row][col].S = true;
        } else {
          const wall = coinFlip(wallProbability)
          this.grid[row][col].S = wall;
          if(!wall) this.unionFind.unite((row * this.size + col), (row * this.size + col + this.size));
        }
      }
    }

    const componentSet = new Set();

    for(let idx = 0; idx < this.size * this.size; idx++) {
      if(this.unionFind.findPar(idx) == idx) componentSet.add(idx);
    }

    while(componentSet.size > 1) {
      const component = randomChoice(componentSet, componentSet.size);
      const elements = []
      for(let idx = 0; idx < this.size * this.size; idx++) {
        if(this.unionFind.findPar(idx) == component) elements.push(idx);
      }
      const walls = []
      elements.forEach(idx => {
        const row = Math.trunc(idx / this.size);
        const col = idx % this.size;

        if(!this.grid[row][col].E && !this.grid[row][col].S) return;
        if(this.grid[row][col].E && col != this.size - 1 && this.unionFind.findPar(idx) != this.unionFind.findPar(idx + 1)) {
          walls.push([idx, 'E']);
        }
        if(this.grid[row][col].S && row != this.size - 1 && this.unionFind.findPar(idx) != this.unionFind.findPar(idx + CONFIG.mazeGridSize)) {
          walls.push([idx, 'S']);
        }
      })

      // Pick another component?
      // This happens if component is bottom-right
      if(walls.length == 0) continue;

      const [idx, direction] = randomChoice(walls, walls.length);

      const row = Math.trunc(idx / this.size);
      const col = idx % this.size;

      const adjacentCellOffset = direction == 'E' ? 1 : CONFIG.mazeGridSize;

      this.grid[row][col][direction] = false;
      const yieldingParent = this.unionFind.yieldingParent(idx, idx + adjacentCellOffset);
      componentSet.delete(yieldingParent);
      this.unionFind.unite(idx, idx + adjacentCellOffset);
    }

    for(let row = 0; row < this.size; row++) {
      this.grid[row][0].W = true;
      this.grid[row][0].wallCount++;
      this.grid[row][this.size - 1].wallCount++;    }
    for(let col = 0; col < this.size; col++) {
      this.grid[0][col].N = true;
      this.grid[0][col].wallCount++;
      this.grid[this.size - 1][col].wallCount++;
    }
    for(let row = 0; row < this.size; row++) {
      for(let col = 0; col < this.size; col++) {
        if(this.grid[row][col].S && row != this.size - 1) {
          this.grid[row][col].wallCount += 1;
          this.grid[row+1][col].wallCount += 1;
          this.grid[row+1][col].N = true;
        }
        if(this.grid[row][col].E && col != this.size - 1) {
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
      [0, this.size, 0, 0],
      [this.size, this.size, 0, this.size],
      [0, this.size, this.size, this.size],
      [0, 0, 0, this.size]
    ]

    let wallStart = null;
    for(let row = 0; row < this.size - 1; row++) {
      for(let col = 0; col < this.size; col++) {
        if(this.grid[row][col].S) {
          if(wallStart == null) wallStart = col;
        } else if(wallStart != null) {
          walls.push([wallStart, col, row + 1, row + 1]);
          wallStart = null;
        }
      }
      if(wallStart != null) {
        walls.push([wallStart, this.size, row + 1, row + 1]);
        wallStart = null;
      }
    }

    for(let col = 0; col < this.size - 1; col++) {
      for(let row = 0; row < this.size; row++) {
        if(this.grid[row][col].E) {
          if(wallStart == null) wallStart = row;
        } else if(wallStart != null) {
          walls.push([col+1, col+1, wallStart, row]);
          wallStart = null;
        }
      }
      if(wallStart != null) {
        walls.push([col+1, col+1, wallStart, this.size]);
        wallStart = null;
      }
    }

    return walls;
  }
}