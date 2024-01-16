import { Enemy } from "./enemy.js";
import { CONFIG, COLORS, SIZES, WEIGHTS, SPEEDS } from "../../config.js";
import { CircleShapedSprite } from "../shapes.js";
import { EFFECT_LAYERS } from "../../effects/effect.js";
import { CircleEffect } from "../../effects/circleEffect.js";
import gameEngine from "../../core/engine.js";
import { CircularBuffer } from "../../utils/circularBuffer.js";
import { VFXPoof } from "../../effects/vfx/poof.js";

const followMe = (position, xOffset, yOffset) => {
  return (effect, ticks) => {
    effect.position.x = position.x + xOffset;
    effect.position.y = position.y + yOffset;
  }
}

export class CrawlerEnemy extends Enemy {
  constructor(x, y) {
    const shadow = new CircleEffect(0, 0, null, SIZES.enemyRadius, COLORS.shadowOnFloor);
    super(x, y, 20, shadow);
    this.shadow.animation = followMe(this.position, 6, 9);

    this.crawlFrequency = 0.8;
    this.crawlTickOffset = Math.random();

    this.shape = new CircleShapedSprite(this.position, SIZES.enemyRadius, this.colorRange(0));

    this.lastTickCollisionCount = 0;
    this.tickCollisionCounts = new CircularBuffer(CONFIG.FPS);
    this.tickCollisionCounts.push(0);
  }

  

  colorRange(ratio) {
    return `hsl(${15 + ratio * 2}, ${60 + ratio * 4}%, ${42 + ratio * 6}%)`;
  }

  tick(ticks, player, towers) {
    const myGridRow = Math.floor(this.position.y / SIZES.mazeCell);
    const myGridCol = Math.floor(this.position.x / SIZES.mazeCell);

    const myCell = gameEngine.maze.grid[myGridRow][myGridCol];

    const target = myCell.pathTarget;
    
    this.velocity = target.delta(this.position).normalize().scale(SPEEDS.crawler);
    let sinSq = Math.sin((ticks / CONFIG.FPS * this.crawlFrequency + this.crawlTickOffset) * Math.PI);
    sinSq *= sinSq;
    this.velocity.scale(sinSq);

    const n = this.tickCollisionCounts.reduce((a,b) => a + b)/this.tickCollisionCounts.length;

    this.shape.color = this.colorRange((n - 1) / (n + 3));

    if(this.hp <= 0) {
      this.die();
      return;
    }
    this.tickCollisionCounts.push(this.lastTickCollisionCount);
    this.lastTickCollisionCount = 0;

    // Outside screen space
    if(!gameEngine.screenCells.has(myCell) && !gameEngine.edgeCells.has(myCell)) {
      this.cull();
    }
  }

  die() {
    super.die();
    // Look at Bullet.js
    const direction = this.lastBulletDirection;
    VFXPoof(EFFECT_LAYERS.above, this.position, 10, 20, this.shape.color, 30, 80, 100, -direction.thetaDeg - 20, -direction.thetaDeg + 20);
  }

  render(context) {
    this.shape.render(context);
  }

  collide(other, collisionPoint) {
    other.repelFrom(collisionPoint, WEIGHTS.repulsion.enemy);
    if(other instanceof Enemy) this.lastTickCollisionCount++;
  }
}
