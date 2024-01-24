import { SIZES, CONFIG } from "../config.js";
import { Vector2 } from "../utils/vector2.js";
import { UnionFind } from "../utils/unionFind.js";
import { coinFlip, randInt, randomChoice } from "../utils/random.js";
import { generateNavigationGraph } from "./pathfinding.js";
import { ImageSrc, loadImage } from "../utils/image.js";


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

    this.distanceToPlayer = 0;
    this.nextCell = null;
    this.nextCellDir = null;
    this.pathTarget = null;

    this.corners = {
      NW: false,
      NE: false,
      SW: false,
      SE: false
    };
  }
}

export class Maze {
  constructor(wallProbability) {
    this.grid = Array(CONFIG.mazeGridSize).fill(0).map((v, rowIdx) => Array(CONFIG.mazeGridSize).fill(0).map((v, colIdx) => new GridCell(rowIdx, colIdx)));

    this.unionFind = new UnionFind(CONFIG.mazeGridSize * CONFIG.mazeGridSize);
    this.deadEnds = []

    this.generate(wallProbability);

    this.image = document.createElement('canvas');
    this.image.width = CONFIG.mazeGridSize * SIZES.mazeCell + 1000;
    this.image.height = CONFIG.mazeGridSize * SIZES.mazeCell + 1000;
    const context = this.image.getContext('2d');

    const imgs = [
      loadImage(`./img/hedge/intersection_1.png`),
      loadImage(`./img/hedge/intersection_2.png`),
      loadImage(`./img/hedge/straight_1.png`),
      loadImage(`./img/hedge/straight_2.png`),
      loadImage(`./img/hedge/straight_3.png`),
      loadImage(`./img/hedge/straight_4.png`),
      loadImage(`./img/hedge/straight_5.png`),
      loadImage(`./img/hedge/straight_6.png`),
      loadImage(`./img/hedge/corner_1.png`),
      loadImage(`./img/hedge/corner_2.png`),
      loadImage(`./img/hedge/corner_3.png`),
      loadImage(`./img/hedge/corner_4.png`),
      loadImage(`./img/hedge/corner_5.png`),
      loadImage(`./img/hedge/corner_6.png`),
      loadImage(`./img/hedge/three_1.png`),
      loadImage(`./img/hedge/three_2.png`),
      loadImage(`./img/hedge/three_3.png`),
      loadImage(`./img/hedge/three_4.png`),
      loadImage(`./img/hedge/end_1.png`),
      loadImage(`./img/hedge/end_2.png`),
      loadImage(`./img/hedge/end_3.png`),
      loadImage(`./img/hedge/end_4.png`)
    ];

    context.fillStyle = "#000000";

    const wallsToComponent = (u, d, l, r) => {
      let count = 0;
      if(u) count++;
      if(d) count++;
      if(l) count++;
      if(r) count++;

      if(count == 4) return [`./img/hedge/intersection_${randInt(2) + 1}.png`, randInt(4) / 2 * Math.PI];
      if(count == 3) {
        if(!d) return [`./img/hedge/three_${randInt(4) + 1}.png`, 0]
        if(!l) return [`./img/hedge/three_${randInt(4) + 1}.png`, 0.5 * Math.PI];
        if(!u) return [`./img/hedge/three_${randInt(4) + 1}.png`, 1.0 * Math.PI];
        if(!r) return [`./img/hedge/three_${randInt(4) + 1}.png`, 1.5 * Math.PI];
        return [`./img/hedge/intersection_${randInt(2) + 1}.png`, randInt(4) / 2 * Math.PI];
      }
      if(count == 2) {
        if(u & d) return [`./img/hedge/straight_${randInt(6) + 1}.png`, (randInt(2) + 0.0) * Math.PI];
        if(l & r) return [`./img/hedge/straight_${randInt(6) + 1}.png`, (randInt(2) + 0.5) * Math.PI];
        // Corners
        if(u & r) return [`./img/hedge/corner_${randInt(6) + 1}.png`, 0];
        if(d & r) return [`./img/hedge/corner_${randInt(6) + 1}.png`, 0.5 * Math.PI];
        if(d & l) return [`./img/hedge/corner_${randInt(6) + 1}.png`, 1.0 * Math.PI];
        if(u & l) return [`./img/hedge/corner_${randInt(6) + 1}.png`, 1.5 * Math.PI];
      }
      if(count == 1) {
        if(d) return [`./img/hedge/end_${randInt(4) + 1}.png`, 0]
        if(l) return [`./img/hedge/end_${randInt(4) + 1}.png`, 0.5 * Math.PI];
        if(u) return [`./img/hedge/end_${randInt(4) + 1}.png`, 1.0 * Math.PI];
        if(r) return [`./img/hedge/end_${randInt(4) + 1}.png`, 1.5 * Math.PI];
      }
      return [null, 0];
    }

    Promise.all(imgs).then(() => {
      for(let row = 0; row < CONFIG.mazeGridSize; row++) {
        for(let col = 0; col < CONFIG.mazeGridSize; col++) {
          const u = (row != 0) && this.grid[row - 1][col].W;
          const d = this.grid[row][col].W;
          const l = (col != 0) && this.grid[row][col - 1].N;
          const r = this.grid[row][col].N;
          const ulCorner = wallsToComponent(u, d, l, r);
          if(ulCorner[0]) {
            context.translate(col * SIZES.mazeCell + 32, row * SIZES.mazeCell + 32);
            context.rotate(ulCorner[1]);
            context.drawImage(ImageSrc(ulCorner[0]), -32, -32);
            context.resetTransform();
          }
          if(this.grid[row][col].W) {
            context.translate(col * SIZES.mazeCell + 32, row * SIZES.mazeCell + 32 + 64);
            context.rotate((randInt(2) + 0.0) * Math.PI);
            context.drawImage(ImageSrc(`./img/hedge/straight_${randInt(6) + 1}.png`), -32, -32);
            context.resetTransform();
            context.translate(col * SIZES.mazeCell + 32, row * SIZES.mazeCell + 32 + 128);
            context.rotate((randInt(2) + 0.0) * Math.PI);
            context.drawImage(ImageSrc(`./img/hedge/straight_${randInt(6) + 1}.png`), -32, -32);
            context.resetTransform();
            context.translate(col * SIZES.mazeCell + 32, row * SIZES.mazeCell + 32 + 192);
            context.rotate((randInt(2) + 0.0) * Math.PI);
            context.drawImage(ImageSrc(`./img/hedge/straight_${randInt(6) + 1}.png`), -32, -32);
            context.resetTransform();
          }
          if(col == CONFIG.mazeGridSize - 1) {
            const u = row != 0;
            const l = this.grid[row][col].N;
            const urCorner = wallsToComponent(u, true, l, false);
            context.translate((col + 1) * SIZES.mazeCell + 32, row * SIZES.mazeCell + 32);
            context.rotate(urCorner[1]);
            context.drawImage(ImageSrc(urCorner[0]), -32, -32);
            context.resetTransform();
            context.translate((col + 1) * SIZES.mazeCell + 32, row * SIZES.mazeCell + 32 + 64);
            context.rotate((randInt(2) + 0.0) * Math.PI);
            context.drawImage(ImageSrc(`./img/hedge/straight_${randInt(6) + 1}.png`), -32, -32);
            context.resetTransform();
            context.translate((col + 1) * SIZES.mazeCell + 32, row * SIZES.mazeCell + 32 + 128);
            context.rotate((randInt(2) + 0.0) * Math.PI);
            context.drawImage(ImageSrc(`./img/hedge/straight_${randInt(6) + 1}.png`), -32, -32);
            context.resetTransform();
            context.translate((col + 1) * SIZES.mazeCell + 32, row * SIZES.mazeCell + 32 + 192);
            context.rotate((randInt(2) + 0.0) * Math.PI);
            context.drawImage(ImageSrc(`./img/hedge/straight_${randInt(6) + 1}.png`), -32, -32);
            context.resetTransform();
          }
          if(this.grid[row][col].N) {
            context.translate(col * SIZES.mazeCell + 32 + 64, row * SIZES.mazeCell + 32);
            context.rotate((randInt(2) + 0.5) * Math.PI);
            context.drawImage(ImageSrc(`./img/hedge/straight_${randInt(6) + 1}.png`), -32, -32);
            context.resetTransform();
            context.translate(col * SIZES.mazeCell + 32 + 128, row * SIZES.mazeCell + 32);
            context.rotate((randInt(2) + 0.5) * Math.PI);
            context.drawImage(ImageSrc(`./img/hedge/straight_${randInt(6) + 1}.png`), -32, -32);
            context.resetTransform();
            context.translate(col * SIZES.mazeCell + 32 + 192, row * SIZES.mazeCell + 32);
            context.rotate((randInt(2) + 0.5) * Math.PI);
            context.drawImage(ImageSrc(`./img/hedge/straight_${randInt(6) + 1}.png`), -32, -32);
            context.resetTransform();
          }
          if(row == CONFIG.mazeGridSize - 1) {
            const u = this.grid[row][col].W;
            const l = col != 0;
            const dlCorner = wallsToComponent(u, false, l, true);
            context.translate(col * SIZES.mazeCell + 32, (row + 1) * SIZES.mazeCell + 32);
            context.rotate(dlCorner[1]);
            context.drawImage(ImageSrc(dlCorner[0]), -32, -32);
            context.resetTransform();
            context.translate(col * SIZES.mazeCell + 32 + 64, (row + 1) * SIZES.mazeCell + 32);
            context.rotate((randInt(2) + 0.5) * Math.PI);
            context.drawImage(ImageSrc(`./img/hedge/straight_${randInt(6) + 1}.png`), -32, -32);
            context.resetTransform();
            context.translate(col * SIZES.mazeCell + 32 + 128, (row + 1) * SIZES.mazeCell + 32);
            context.rotate((randInt(2) + 0.5) * Math.PI);
            context.drawImage(ImageSrc(`./img/hedge/straight_${randInt(6) + 1}.png`), -32, -32);
            context.resetTransform();
            context.translate(col * SIZES.mazeCell + 32 + 192, (row + 1) * SIZES.mazeCell + 32);
            context.rotate((randInt(2) + 0.5) * Math.PI);
            context.drawImage(ImageSrc(`./img/hedge/straight_${randInt(6) + 1}.png`), -32, -32);
            context.resetTransform();
          }
        }
      }
      context.translate(CONFIG.mazeGridSize * SIZES.mazeCell + 32, CONFIG.mazeGridSize * SIZES.mazeCell + 32);
      context.rotate(1.5 * Math.PI);
      context.drawImage(ImageSrc(`./img/hedge/corner_${randInt(6) + 1}.png`), -32, -32);
      context.resetTransform();
    });
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

    // Probably collapsible with the above loop; but this reads better
    for(let row = 0; row < CONFIG.mazeGridSize; row++) {
      for(let col = 0; col < CONFIG.mazeGridSize; col++) {
        if(row == 0) {
          this.grid[row][col].corners.NE = true;
        } else {
          this.grid[row][col].corners.NE = this.grid[row - 1][col].corners.SE;
        }
        if(col == 0) {
          this.grid[row][col].corners.NW = true;
          this.grid[row][col].corners.SW = true;
        } else {
          this.grid[row][col].corners.NW = this.grid[row][col - 1].corners.NE;
          this.grid[row][col].corners.SW = this.grid[row][col - 1].corners.SE;
        }
        let SE = this.grid[row][col].E || this.grid[row][col].S;
        if(row == CONFIG.mazeGridSize - 1) {
          SE = true;
        } else {
          SE |= this.grid[row + 1][col].E;
        }
        if(col == CONFIG.mazeGridSize - 1) {
          SE = true;
        } else {
          SE |= this.grid[row][col + 1].S;
        }
        this.grid[row][col].corners.SE = SE;
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