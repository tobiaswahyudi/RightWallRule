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

const CRAWLER_HP = 20;

export class CrawlerEnemy extends Enemy {
  constructor(x, y) {
    const shadow = new CircleEffect(0, 0, null, SIZES.enemyRadius, COLORS.shadowOnFloor);
    super(x, y, CRAWLER_HP, shadow);
    this.shadow.animation = followMe(this.position, 6, 9);

    this.crawlFrequency = 0.8;
    this.crawlTickOffset = Math.random();

    this.shape = new CircleShapedSprite(this.position, SIZES.enemyRadius, this.colorRange(0));
  }

  

  colorRange(ratio, brightnessAdjust = 0) {
    return `hsl(${15 + ratio * 2}, ${60 + ratio * 4}%, ${Math.max(0, 42 + ratio * 6 + brightnessAdjust)}%)`;
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

    const n = this.hp / CRAWLER_HP;
    this.shape.color = this.colorRange(n);

    if(this.hp <= 0) {
      this.die();
      return;
    }
    // Outside screen space
    if(!gameEngine.screenCells.has(myCell) && !gameEngine.edgeCells.has(myCell)) {
      this.cull();
    }
  }

  die() {
    super.die();
    // Look at Bullet.js
    const direction = this.lastBulletDirection;

    const n = this.hp / CRAWLER_HP;
    this.shape.color = this.colorRange(n, -5);

    VFXPoof(EFFECT_LAYERS.above, this.position, 5, 20, this.shape.color, 30, 100, 120, -direction.thetaDeg - 20, -direction.thetaDeg + 20);
    gameEngine.inventoryManager.xp++;
  }

  render(context) {
    this.shape.render(context);
  }

  collide(other, collisionPoint) {
    other.repelFrom(collisionPoint, WEIGHTS.repulsion.enemy);
  }
}
