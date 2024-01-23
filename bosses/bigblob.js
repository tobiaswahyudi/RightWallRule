import { COLORS, CONFIG, SIZES } from '../config.js';
import gameEngine from '../core/engine.js';
import { makeElbow } from '../maze/pathfinding.js';
import { getMazeRowCol } from '../utils/rowcol.js';
import { Vector2 } from '../utils/vector2.js';
import { Boss } from './boss.js';

const BIGBLOB_HP = 10000;
const FULL_LENGTH = SIZES.mazeCell / 2;
const SQUARE_HALFSIZE =  SIZES.mazeCell / 2  - SIZES.wallWidth;

const CRAWL_FREQUENCY = 0.6;
const CRAWL_SPEED = 1;

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
      // Nothing
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
      if(this.butt.delta(this.buttTargetCell.center).magnitude < CRAWL_SPEED) {
        this.buttDirection = this.buttCell.nextCellDir || 'N';
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
      const buttVelocity = this.buttTargetCell.center.delta(this.butt).normalize().scale(CRAWL_SPEED);
      let sinSq = Math.sin((ticks / CONFIG.FPS * CRAWL_FREQUENCY) * Math.PI);
      sinSq *= sinSq;
      buttVelocity.scale(sinSq);
      this.butt.add(buttVelocity);
      // TODO: should the butt ever stop moving?
    }

    if(this.position.delta(this.target).magnitude < CRAWL_SPEED) {
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
    let lastLeft = null;
    let lastRight = null;

    const [targetGridRow, targetGridCol] = getMazeRowCol(this.target);
    const targetCell = gameEngine.maze.grid[targetGridRow][targetGridCol];

    switch (this.buttDirection) {
      case('N'): {
        lastLeft = new Vector2(cell.center.x - SQUARE_HALFSIZE, this.butt.y + SQUARE_HALFSIZE);
        lastRight = new Vector2(cell.center.x + SQUARE_HALFSIZE, this.butt.y + SQUARE_HALFSIZE);
        break;
      }
      case('S'): {
        lastLeft = new Vector2(cell.center.x + SQUARE_HALFSIZE, this.butt.y - SQUARE_HALFSIZE);
        lastRight = new Vector2(cell.center.x - SQUARE_HALFSIZE, this.butt.y - SQUARE_HALFSIZE);
        break;
      }
      case('E'): {
        lastLeft = new Vector2(this.butt.x - SQUARE_HALFSIZE, cell.center.y - SQUARE_HALFSIZE);
        lastRight = new Vector2(this.butt.x - SQUARE_HALFSIZE, cell.center.y + SQUARE_HALFSIZE);
        break;
      }
      case('W'): {
        lastLeft = new Vector2(this.butt.x + SQUARE_HALFSIZE, cell.center.y + SQUARE_HALFSIZE);
        lastRight = new Vector2(this.butt.x + SQUARE_HALFSIZE, cell.center.y - SQUARE_HALFSIZE);
        break;
      }
    }

    leftPoints.push(lastLeft);
    rightPoints.push(lastRight);

    let lastDir = cell.nextCellDir || 'N';

    while(cell && cell != targetCell) {
      let nextLeft = null;
      let nextRight = null;
      switch (cell.nextCellDir) {
        case('N'): {
          nextLeft = new Vector2(cell.center.x - SQUARE_HALFSIZE, cell.center.y - SQUARE_HALFSIZE);
          nextRight = new Vector2(cell.center.x + SQUARE_HALFSIZE, cell.center.y - SQUARE_HALFSIZE);
          break;
        }
        case('S'): {
          nextLeft = new Vector2(cell.center.x + SQUARE_HALFSIZE, cell.center.y + SQUARE_HALFSIZE);
          nextRight = new Vector2(cell.center.x - SQUARE_HALFSIZE, cell.center.y + SQUARE_HALFSIZE);
          break;
        }
        case('E'): {
          nextLeft = new Vector2(cell.center.x + SQUARE_HALFSIZE, cell.center.y - SQUARE_HALFSIZE);
          nextRight = new Vector2(cell.center.x + SQUARE_HALFSIZE, cell.center.y + SQUARE_HALFSIZE);
          break;
        }
        case('W'): {
          nextLeft = new Vector2(cell.center.x - SQUARE_HALFSIZE, cell.center.y + SQUARE_HALFSIZE);
          nextRight = new Vector2(cell.center.x - SQUARE_HALFSIZE, cell.center.y - SQUARE_HALFSIZE);
          break;
        }
      }

      const leftAddPoints = makeElbow(lastLeft, nextLeft, lastDir, cell.nextCellDir);
      const rightAddPoints = makeElbow(lastRight, nextRight, lastDir, cell.nextCellDir);

      leftAddPoints.forEach(pos => leftPoints.push(pos));
      rightAddPoints.forEach(pos => rightPoints.push(pos));

      lastDir = cell.nextCellDir;
      cell = cell.nextCell;
      lastLeft = nextLeft;
      lastRight = nextRight;
    }

    switch (lastDir) {
      case('N'): {
        lastLeft = new Vector2(this.currentCell.center.x - SQUARE_HALFSIZE, this.position.y - SQUARE_HALFSIZE);
        lastRight = new Vector2(this.currentCell.center.x + SQUARE_HALFSIZE, this.position.y - SQUARE_HALFSIZE);
        break;
      }
      case('S'): {
        lastLeft = new Vector2(this.currentCell.center.x + SQUARE_HALFSIZE, this.position.y + SQUARE_HALFSIZE);
        lastRight = new Vector2(this.currentCell.center.x - SQUARE_HALFSIZE, this.position.y + SQUARE_HALFSIZE);
        break;
      }
      case('E'): {
        lastLeft = new Vector2(this.position.x + SQUARE_HALFSIZE, this.currentCell.center.y - SQUARE_HALFSIZE);
        lastRight = new Vector2(this.position.x + SQUARE_HALFSIZE, this.currentCell.center.y + SQUARE_HALFSIZE);
        break;
      }
      case('W'): {
        lastLeft = new Vector2(this.position.x - SQUARE_HALFSIZE, this.currentCell.center.y + SQUARE_HALFSIZE);
        lastRight = new Vector2(this.position.x - SQUARE_HALFSIZE, this.currentCell.center.y - SQUARE_HALFSIZE);
        break;
      }
    }

    const pathString = `M ${lastLeft.x}, ${lastLeft.y}
    ${leftPoints.reverse().map(pt => `L ${pt.x}, ${pt.y}`).join(' ')}
    ${rightPoints.map(pt => `L ${pt.x}, ${pt.y}`).join(' ')}
    L ${lastRight.x}, ${lastRight.y}
    z`;
    const bigboy = new Path2D(pathString);

    context.fillStyle = COLORS.enemy;
    context.fill(bigboy);

    context.fillStyle = 'red';

    context.beginPath();
    context.ellipse(
      this.position.x, this.position.y,
      3, 3,
      0, 0, 360
    );
    context.fill();

    context.fillStyle = '#ff000066';
    leftPoints.forEach(pt => {
      context.beginPath();
      context.ellipse(
        pt.x, pt.y,
        3, 3,
        0, 0, 360
      );
      context.fill();
    });
    
    context.fillStyle = '#0000ff66';
    rightPoints.forEach(pt => {
      context.beginPath();
      context.ellipse(
        pt.x, pt.y,
        3, 3,
        0, 0, 360
      );
      context.fill();
    });
  }

  die() {
    console.error("this Boss does not override die()");
  }
}