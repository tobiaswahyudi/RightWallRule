import { COLORS, CONFIG, SIZES } from '../config.js';
import gameEngine from '../core/engine.js';
import { DIRECTION_OFFSET, DIR_INDEX_GAP, DIR_VECTORS, dirIndexGap, makeElbow, offsetDir } from '../maze/pathfinding.js';
import { getMazeRowCol } from '../utils/rowcol.js';
import { Vector2 } from '../utils/vector2.js';
import { Boss } from './boss.js';

const BIGBLOB_HP = 10000;
const FULL_LENGTH = SIZES.mazeCell / 2;
const SQUARE_HALFSIZE =  SIZES.mazeCell / 2  - SIZES.wallWidth;
const BULGE_FULL_RADIUS = SQUARE_HALFSIZE * Math.SQRT2;

const CRAWL_FREQUENCY = 0.6;
const CRAWL_SPEED = 3;
const BUTT_CRAWL_SPEED = 3;

const OFFSETS = {
  SW: new Vector2(-SQUARE_HALFSIZE, +SQUARE_HALFSIZE),
  SE: new Vector2(+SQUARE_HALFSIZE, +SQUARE_HALFSIZE),
  NE: new Vector2(+SQUARE_HALFSIZE, -SQUARE_HALFSIZE),
  NW: new Vector2(-SQUARE_HALFSIZE, -SQUARE_HALFSIZE),
}

const WALL_TO_OFFSETS = {
  N: [OFFSETS.NW, OFFSETS.NE],
  E: [OFFSETS.NE, OFFSETS.SE],
  S: [OFFSETS.SE, OFFSETS.SW],
  W: [OFFSETS.SW, OFFSETS.NW],
}

function bezierControlDistance(segments) {
  return 4/3*Math.tan(Math.PI / (2 * segments));
}

class BigBlobBulge {
  constructor(cells, p1, p2, p1Offset, p2Offset) {
    this.cells = new Set(cells);
    this.p1 = p1.copy;
    this.p2 = p2.copy;
    const cellScale = p1.delta(p2).magnitude/(2 * SQUARE_HALFSIZE);
    this.p1control = p1.copy.add(p2Offset.copy.scale(bezierControlDistance(4) * cellScale));
    this.p2control = p2.copy.add(p1Offset.copy.scale(bezierControlDistance(4) * cellScale));
  }
}

export class BigBlobBoss extends Boss {
  constructor(x, y) {
    super(x, y, BIGBLOB_HP, "Chonk the very large");
    this.target = this.position.copy;
    this.currentCell = null;
    this.length = FULL_LENGTH;
    this.butt = this.position.copy;
    this.buttMoving = false;
    
    const [buttGridRow, buttGridCol] = getMazeRowCol(this.butt);
    this.buttCell = gameEngine.maze.grid[buttGridRow][buttGridCol];
    this.buttTargetCell = this.buttCell;
    this.buttDirection = this.buttCell.nextCellDir || 'N';

    this.buttEndCell = this.buttCell;
  }

  tick(ticks, player, towers) {
    // Add all distances from butt to head
    const [buttGridRow, buttGridCol] = getMazeRowCol(this.butt);
    this.buttCell = gameEngine.maze.grid[buttGridRow][buttGridCol];
    
    const [myGridRow, myGridCol] = getMazeRowCol(this.position);
    this.currentCell = gameEngine.maze.grid[myGridRow][myGridCol];

    let totalDist = 0;
    if(this.buttCell == this.currentCell) {
      // totalDist = this.length;
    } else if(this.buttCell.nextCell == this.currentCell) {
      totalDist = this.butt.delta(this.position).magnitude;
    } else {
      let lastPos = this.buttCell.nextCell;
      if(lastPos) {
        totalDist += this.butt.delta(lastPos.center).magnitude;
        while(lastPos.nextCell && lastPos.nextCell != this.currentCell) {
          totalDist += lastPos.center.delta(lastPos.nextCell.center).magnitude;
          lastPos = lastPos.nextCell;
        }
        totalDist += lastPos.center.delta(this.position).magnitude;
      }
    }

    if(totalDist >= this.length) {
      if(this.butt.delta(this.buttTargetCell.center).magnitude < BUTT_CRAWL_SPEED) {
        this.buttDirection = this.buttCell.nextCellDir || 'N';
        this.butt = this.buttTargetCell.center.copy;
        if(this.buttCell.nextCell) {
          this.buttTargetCell = this.buttCell.nextCell;
        } else {
          const [playerGridRow, playerGridCol] = getMazeRowCol(gameEngine.player.position);
          this.buttTargetCell = gameEngine.maze.grid[playerGridRow][playerGridCol];
        }
      }
      if(this.buttCell != this.buttTargetCell) {
        this.buttEndCell = this.buttCell;
      }
      const buttVelocity = this.buttTargetCell.center.delta(this.butt).normalize().scale(BUTT_CRAWL_SPEED);
      let sinSq = Math.sin((ticks / CONFIG.FPS * CRAWL_FREQUENCY) * Math.PI);
      sinSq *= sinSq;
      buttVelocity.scale(sinSq);
      this.butt.add(buttVelocity);
      // TODO: should the butt ever stop moving?
    }

    if(this.position.delta(this.target).magnitude < CRAWL_SPEED) {
      this.position = this.target.copy;
      if(this.currentCell.nextCell) {
        this.target = this.currentCell.nextCell.center;
      } else {
        const [playerGridRow, playerGridCol] = getMazeRowCol(gameEngine.player.position);
        this.target = gameEngine.maze.grid[playerGridRow][playerGridCol].center;
      }
    }
    const velocity = this.target.delta(this.position).normalize().scale(CRAWL_SPEED);
    let sinSq = Math.sin((ticks / CONFIG.FPS * CRAWL_FREQUENCY) * Math.PI);
    sinSq *= sinSq;
    velocity.scale(sinSq);
    this.position.add(velocity);
  }

  render(context) {
    let leftPoints = [];
    let rightPoints = [];
    let cell = this.buttEndCell;
    let cellStartLeft = null;
    let cellStartRight = null;

    const [targetGridRow, targetGridCol] = getMazeRowCol(this.target);
    const targetCell = gameEngine.maze.grid[targetGridRow][targetGridCol];

    switch (this.buttDirection) {
      case('N'): {
        cellStartLeft = new Vector2(cell.center.x, this.butt.y).add(OFFSETS.SW);
        cellStartRight = new Vector2(cell.center.x, this.butt.y).add(OFFSETS.SE);
        break;
      }
      case('S'): {
        cellStartLeft = new Vector2(cell.center.x, this.butt.y).add(OFFSETS.NE);
        cellStartRight = new Vector2(cell.center.x, this.butt.y).add(OFFSETS.NW);
        break;
      }
      case('E'): {
        cellStartLeft = new Vector2(this.butt.x, cell.center.y).add(OFFSETS.NW);
        cellStartRight = new Vector2(this.butt.x, cell.center.y).add(OFFSETS.SW);
        break;
      }
      case('W'): {
        cellStartLeft = new Vector2(this.butt.x, cell.center.y).add(OFFSETS.SE);
        cellStartRight = new Vector2(this.butt.x, cell.center.y).add(OFFSETS.NE);
        break;
      }
    }

    let lastDir = cell.nextCellDir || 'N';

    let leftBulge = null;
    let rightBulge = null;
    let cellEndLeft = null;
    let cellEndRight = null;
    let leftWall = false;
    let rightWall = false;
    
    while(cell && cell != targetCell) {
      let nextDelta = null;
      let leftBackCorner = false;
      let rightBackCorner = false;
      switch (cell.nextCellDir) {
        case('N'): {
          cellEndLeft = cell.center.copy.add(OFFSETS.NW);
          cellEndRight = cell.center.copy.add(OFFSETS.NE);
          nextDelta = new Vector2(0, -2 * SIZES.wallWidth);
          leftBackCorner = 'SW';
          rightBackCorner = 'SE';
          leftWall = 'W';
          rightWall = 'E';
          break;
        }
        case('S'): {
          cellEndLeft = cell.center.copy.add(OFFSETS.SE);
          cellEndRight = cell.center.copy.add(OFFSETS.SW);
          nextDelta = new Vector2(0, +2 * SIZES.wallWidth);
          leftBackCorner = 'NE';
          rightBackCorner = 'NW';
          leftWall = 'E';
          rightWall = 'W';
          break;
        }
        case('E'): {
          cellEndLeft = cell.center.copy.add(OFFSETS.NE);
          cellEndRight = cell.center.copy.add(OFFSETS.SE);
          nextDelta = new Vector2(+2 * SIZES.wallWidth, 0);
          leftBackCorner = 'NW';
          rightBackCorner = 'SW';
          leftWall = 'N';
          rightWall = 'S';
          break;
        }
        case('W'): {
          cellEndLeft = cell.center.copy.add(OFFSETS.SW);
          cellEndRight = cell.center.copy.add(OFFSETS.NW);
          nextDelta = new Vector2(-2 * SIZES.wallWidth, 0);
          leftBackCorner = 'SE';
          rightBackCorner = 'NE';
          leftWall = 'S';
          rightWall = 'N';
          break;
        }
      }

      if(cell == this.buttEndCell) {
        const buttBulge = new BigBlobBulge([cell], cellStartLeft, cellStartRight, OFFSETS[leftBackCorner], OFFSETS[rightBackCorner]);
        rightPoints.push(buttBulge);
        if(this.butt.delta(this.buttEndCell.center).magnitude < 2 * SQUARE_HALFSIZE) {
          if(!cell[leftWall]) {
            leftBulge = new BigBlobBulge([cell], cellStartLeft, cellEndLeft, WALL_TO_OFFSETS[leftWall][0], WALL_TO_OFFSETS[leftWall][1]);
            leftPoints.push(leftBulge);
          } else leftPoints.push(cellEndLeft);
          if(!cell[rightWall]) {
            rightBulge = new BigBlobBulge([cell], cellStartRight, cellEndRight, WALL_TO_OFFSETS[rightWall][1], WALL_TO_OFFSETS[rightWall][0]);
            rightPoints.push(rightBulge);
          } else rightPoints.push(cellEndRight);
        }
      } else {
      leftPoints.push(cellStartLeft);
      rightPoints.push(cellStartRight);

        const sourceDir = offsetDir(lastDir, DIRECTION_OFFSET.Ahead);
        // Go right
        let currentWall = offsetDir(sourceDir, DIRECTION_OFFSET.CCW);
        while(currentWall != cell.nextCellDir) {
          if(!cell[currentWall]) {
            const bulgeStart = cell.center.copy.add(WALL_TO_OFFSETS[currentWall][1]);
            const bulgeEnd = cell.center.copy.add(WALL_TO_OFFSETS[currentWall][0]);
            rightPoints.push(new BigBlobBulge([cell], bulgeStart, bulgeEnd, WALL_TO_OFFSETS[currentWall][1], WALL_TO_OFFSETS[currentWall][0]));
          } else {
            rightPoints.push(cell.center.copy.add(WALL_TO_OFFSETS[currentWall][0]));
          }
          currentWall = offsetDir(currentWall, DIRECTION_OFFSET.CCW);
        }
        // Go left
        currentWall = offsetDir(sourceDir, DIRECTION_OFFSET.CW);
        while(currentWall != cell.nextCellDir) {
          if(!cell[currentWall]) {
            const bulgeStart = cell.center.copy.add(WALL_TO_OFFSETS[currentWall][0]);
            const bulgeEnd = cell.center.copy.add(WALL_TO_OFFSETS[currentWall][1]);
            leftPoints.push(new BigBlobBulge([cell], bulgeStart, bulgeEnd, WALL_TO_OFFSETS[currentWall][0], WALL_TO_OFFSETS[currentWall][1]));
          } else {
            leftPoints.push(cell.center.copy.add(WALL_TO_OFFSETS[currentWall][1]));
          }
          currentWall = offsetDir(currentWall, DIRECTION_OFFSET.CW);
        }
      }

      lastDir = cell.nextCellDir;
      cell = cell.nextCell;
      cellStartLeft = cellEndLeft.copy.add(nextDelta);
      cellStartRight = cellEndRight.copy.add(nextDelta);
    }

    switch (lastDir) {
      case('N'): {
        cellEndLeft = new Vector2(this.currentCell.center.x - SQUARE_HALFSIZE, this.position.y - SQUARE_HALFSIZE);
        cellEndRight = new Vector2(this.currentCell.center.x + SQUARE_HALFSIZE, this.position.y - SQUARE_HALFSIZE);
        leftWall = 'W';
        rightWall = 'E';
        break;
      }
      case('S'): {
        cellEndLeft = new Vector2(this.currentCell.center.x + SQUARE_HALFSIZE, this.position.y + SQUARE_HALFSIZE);
        cellEndRight = new Vector2(this.currentCell.center.x - SQUARE_HALFSIZE, this.position.y + SQUARE_HALFSIZE);
        leftWall = 'E';
        rightWall = 'W';
        break;
      }
      case('E'): {
        cellEndLeft = new Vector2(this.position.x + SQUARE_HALFSIZE, this.currentCell.center.y - SQUARE_HALFSIZE);
        cellEndRight = new Vector2(this.position.x + SQUARE_HALFSIZE, this.currentCell.center.y + SQUARE_HALFSIZE);
        leftWall = 'N';
        rightWall = 'S';
        break;
      }
      case('W'): {
        cellEndLeft = new Vector2(this.position.x - SQUARE_HALFSIZE, this.currentCell.center.y + SQUARE_HALFSIZE);
        cellEndRight = new Vector2(this.position.x - SQUARE_HALFSIZE, this.currentCell.center.y - SQUARE_HALFSIZE);
        leftWall = 'S';
        rightWall = 'N';
        break;
      }
    }

    const headFromTargetDistance = this.position.delta(this.target).magnitude;
    let headFromWallDistance = SIZES.mazeCell;

    if(targetCell[lastDir]) {
      // Might hit wall? what's the distance?
      headFromWallDistance = headFromTargetDistance;
    }
    if(headFromTargetDistance < 2 * SQUARE_HALFSIZE) {
      leftPoints.push(cellStartLeft);
      rightPoints.push(cellStartRight);
      if(!targetCell[leftWall]) {
        leftBulge = new BigBlobBulge([cell], cellStartLeft, cellEndLeft, WALL_TO_OFFSETS[leftWall][0], WALL_TO_OFFSETS[leftWall][1]);  
        leftPoints.push(leftBulge);
      }
      if(!targetCell[rightWall]) {
        rightBulge = new BigBlobBulge([cell], cellStartRight, cellEndRight, WALL_TO_OFFSETS[rightWall][1], WALL_TO_OFFSETS[rightWall][0]);
        rightPoints.push(rightBulge);
      }
    }

    let headArc = `A ${BULGE_FULL_RADIUS} ${BULGE_FULL_RADIUS} 0 0 0 ${cellEndLeft.x}, ${cellEndLeft.y}`;
    
    
    // Compute head flattening
    const deltaRadial = Math.max(0, (SQUARE_HALFSIZE * (Math.SQRT2 - 1)) - headFromWallDistance);
    if(deltaRadial > 0) {
      const radius = SQUARE_HALFSIZE * Math.SQRT2;
      const deltaPerp = Math.sqrt(2 * deltaRadial * radius - (deltaRadial * deltaRadial));

      const leftFlatPoint = this.position.copy.add(DIR_VECTORS[lastDir].copy.scale(SQUARE_HALFSIZE + headFromWallDistance)).add(DIR_VECTORS[leftWall].copy.scale(deltaPerp));
      const rightFlatPoint = this.position.copy.add(DIR_VECTORS[lastDir].copy.scale(SQUARE_HALFSIZE + headFromWallDistance)).add(DIR_VECTORS[rightWall].copy.scale(deltaPerp));

      const arcRadius = BULGE_FULL_RADIUS * (1 - (deltaPerp / SQUARE_HALFSIZE));

      headArc = `A ${arcRadius} ${arcRadius} 0 0 0 ${rightFlatPoint.x}, ${rightFlatPoint.y}
      L ${leftFlatPoint.x}, ${leftFlatPoint.y}
      A ${arcRadius} ${arcRadius} 0 0 0 ${cellEndLeft.x}, ${cellEndLeft.y}`;
    } 

    const pathString = `M ${cellEndRight.x}, ${cellEndRight.y}
    ${headArc}
    ${leftPoints.reverse().map(thing => {
      if(thing instanceof BigBlobBulge) return `L ${thing.p2.x}, ${thing.p2.y} C ${thing.p2control.x}, ${thing.p2control.y}, ${thing.p1control.x}, ${thing.p1control.y} ${thing.p1.x}, ${thing.p1.y}`
      else return `L ${thing.x}, ${thing.y}`
    }).join('\n')}
    ${rightPoints.map(thing => {
      if(thing instanceof BigBlobBulge) return `L ${thing.p1.x}, ${thing.p1.y} C ${thing.p1control.x}, ${thing.p1control.y}, ${thing.p2control.x}, ${thing.p2control.y} ${thing.p2.x}, ${thing.p2.y}`
      else return `L ${thing.x}, ${thing.y}`
    }).join('\n')}
    L ${cellEndRight.x}, ${cellEndRight.y}
    z`;
    const bigboy = new Path2D(pathString);

    context.fillStyle = COLORS.enemy;
    context.fill(bigboy);

    context.lineWidth = 4;
    context.strokeStyle = '#4E2945';
    context.stroke(bigboy);

    context.fillStyle = 'red';

    context.beginPath();
    context.ellipse(
      this.position.x, this.position.y,
      3, 3,
      0, 0, 360
    );
    context.fill();

    context.beginPath();
    context.strokeStyle = '#05FF05';
    const headCell = this.position.copy.add(DIR_VECTORS[lastDir].copy.scale(SQUARE_HALFSIZE));
    const wallLine = headCell.copy.add(DIR_VECTORS[lastDir].copy.scale(headFromWallDistance));
    context.stroke(new Path2D(`M ${headCell.x}, ${headCell.y} L ${wallLine.x}, ${wallLine.y}`));

    context.fillStyle = '#ff000066';
    leftPoints.forEach(pt => {
      context.beginPath();
      context.ellipse(
        pt.x || pt.p1.x, pt.y || pt.p1.y,
        3, 3,
        0, 0, 360
      );
      context.fill();
      if(pt instanceof BigBlobBulge) {
        context.beginPath();
        context.ellipse(
          pt.p1control.x, pt.p1control.y,
          3, 3,
          0, 0, 360
        );
        context.fill();
        context.beginPath();
        context.ellipse(
          pt.p2control.x, pt.p2control.y,
          3, 3,
          0, 0, 360
        );
        context.fill();
        context.ellipse(
          pt.p2.x, pt.p2.y,
          3, 3,
          0, 0, 360
        );
      }
    });
    
    context.fillStyle = '#0000ff66';
    rightPoints.forEach(pt => {
      context.beginPath();
      context.ellipse(
        pt.x || pt.p2.x, pt.y || pt.p2.y,
        3, 3,
        0, 0, 360
      );
      context.fill();
      if(pt instanceof BigBlobBulge) {
        context.beginPath();
        context.ellipse(
          pt.p1control.x, pt.p1control.y,
          3, 3,
          0, 0, 360
        );
        context.fill();
        context.beginPath();
        context.ellipse(
          pt.p2control.x, pt.p2control.y,
          3, 3,
          0, 0, 360
        );
        context.fill();
        context.ellipse(
          pt.p1.x, pt.p1.y,
          3, 3,
          0, 0, 360
        );
      }
    });
  }

  die() {
    console.error("this Boss does not override die()");
  }
}