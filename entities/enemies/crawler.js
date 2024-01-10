import { Enemy } from "./enemy.js";
import { CONFIG, COLORS, SIZES, WEIGHTS, SPEEDS } from "../../config.js";
import { CircleShapedSprite } from "../shapes.js";
import { CircleEffect, EFFECT_LAYERS } from "../effect.js";
import gameEngine from "../../core/engine.js";
import { CircularBuffer } from "../../utils/circularBuffer.js";

export class CrawlerEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 20);

    this.crawlFrequency = 0.8;
    this.crawlTickOffset = Math.random();

    this.shape = new CircleShapedSprite(this.position, SIZES.enemyRadius, this.colorRange(0));

    this.shadow = new CircleEffect(0, 0, this.followMe(6, 9), SIZES.enemyRadius, COLORS.shadowOnFloor);
    this.lastTickCollisionCount = 0;
    this.tickCollisionCounts = new CircularBuffer(CONFIG.FPS);
    this.tickCollisionCounts.push(0);

    gameEngine.spawnEffect(EFFECT_LAYERS.under, this.shadow, -1);
  }

  followMe(xOffset, yOffset) {
    return (effect, ticks) => {
      effect.position.x = this.position.x + xOffset;
      effect.position.y = this.position.y + yOffset;
    }
  }

  colorRange(ratio) {
    return `hsl(${15 + ratio * 2}, ${60 + ratio * 4}%, ${42 + ratio * 6}%)`;
  }

  tick(ticks, player, towers) {
    const myGridRow = Math.floor(this.position.y / SIZES.mazeCell);
    const myGridCol = Math.floor(this.position.x / SIZES.mazeCell);

    const myCell = gameEngine.maze.grid[myGridRow][myGridCol];

    // Outside screen space
    if(!gameEngine.screenCells.has(myCell) && !gameEngine.edgeCells.has(myCell)) {
      // Cull self
      gameEngine.deleteEntity(this);
      gameEngine.deleteEffect(this.shadow);

      // If the sentinel is culled, take corrective action
      if(this.sentinelAction) this.sentinelAction(this);

      return;
    }

    const target = myCell.pathTarget;
    
    this.velocity = target.delta(this.position).normalize().scale(SPEEDS.crawler);
    let sinSq = Math.sin((ticks / CONFIG.FPS * this.crawlFrequency + this.crawlTickOffset) * Math.PI);
    sinSq *= sinSq;
    this.velocity.scale(sinSq);

    const n = this.tickCollisionCounts.reduce((a,b) => a + b)/this.tickCollisionCounts.length;

    this.shape.color = this.colorRange((n - 1) / (n + 3));

    if(this.hp <= 0) {
      gameEngine.deleteEntity(this);
      gameEngine.deleteEffect(this.shadow);
    }
    this.tickCollisionCounts.push(this.lastTickCollisionCount);
    this.lastTickCollisionCount = 0;
  }

  render(context) {
    this.shape.render(context);
  }

  collide(other, collisionPoint) {
    other.repelFrom(collisionPoint, WEIGHTS.repulsion.enemy);
    if(other instanceof Enemy) this.lastTickCollisionCount++;
  }
}
