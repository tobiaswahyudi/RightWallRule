import { Enemy } from "./enemy.js";
import { CONFIG, COLORS, SIZES, WEIGHTS, SPEEDS } from "../../config.js";
import { CircleHitbox } from "../../hitbox/shapes.js";
import { EFFECT_LAYERS } from "../../effects/effect.js";
import { CircleEffect } from "../../effects/circleEffect.js";
import gameEngine from "../../core/engine.js";
import { CircularBuffer } from "../../utils/circularBuffer.js";
import { VFXPoof } from "../../effects/vfx/poof.js";
import { getMazeRowCol } from "../../utils/rowcol.js";

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

    this.hitbox = new CircleHitbox(this.position, SIZES.enemyRadius, this.colorRange(0));
  }

  

  colorRange(ratio, brightnessAdjust = 0) {
    return `hsl(${15 + ratio * 2}, ${60 + ratio * 4}%, ${Math.max(0, 42 + ratio * 6 + brightnessAdjust)}%)`;
  }

  tick(ticks, player, towers) {
    const [myGridRow, myGridCol] = getMazeRowCol(this.position);

    if(myGridRow < 0 || myGridRow >= CONFIG.mazeGridSize || myGridCol < 0 || myGridCol >= CONFIG.mazeGridSize) {
      // Not sure when this happens. Pretty sure it's a culling bug.
      this.die();
      return;
    }

    const myCell = gameEngine.maze.grid[myGridRow][myGridCol];

    const target = myCell.pathTarget;
    
    this.velocity = target.delta(this.position).normalize().scale(SPEEDS.crawler);
    let sinSq = Math.sin((ticks / CONFIG.FPS * this.crawlFrequency + this.crawlTickOffset) * Math.PI);
    sinSq *= sinSq;
    this.velocity.scale(sinSq);

    const n = this.hp / CRAWLER_HP;
    this.hitbox.color = this.colorRange(n);

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
    this.hitbox.color = this.colorRange(n, -5);

    VFXPoof(EFFECT_LAYERS.above, this.position, 5, 20, this.hitbox.color, 30, 100, 120, -direction.thetaDeg - 20, -direction.thetaDeg + 20);
    gameEngine.inventoryManager.xp++;
  }

  render(context) {
    this.hitbox.render(context);
  }

  collide(other, collisionPoint) {
    other.repelFrom(collisionPoint, WEIGHTS.repulsion.enemy);
  }
}
