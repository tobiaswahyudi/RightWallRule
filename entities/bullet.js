import { Entity } from "./entity.js";
import { Enemy } from "./enemies/enemy.js";
import { CircleShapedSprite } from "./shapes.js";
import { SIZES, COLORS, WEIGHTS, SPEEDS } from "../config.js";
import gameEngine from "../core/engine.js";
import { EFFECT_LAYERS } from "../effects/effect.js";
import { CircleEffect } from "../effects/circleEffect.js";
import { thunk } from "../utils/thunk.js";

export class Bullet extends Entity {
  constructor(x, y, color, heading, gunStats) {
    super(x, y);
    this.velocity = heading.copy.scale(gunStats.bulletSpeed);
    this.stats = gunStats;

    this.color = color;
    this.shape = new CircleShapedSprite(this.position, SIZES.bulletRadius * this.stats.damage, color);

    this.hit = false;
  }

  _bulletSmokeShrinkAnimation(bulletSmoke, ticks) {
    bulletSmoke.radius = bulletSmoke.originalRadius * (bulletSmoke.endTick - ticks) / (bulletSmoke.endTick - bulletSmoke.spawnTick);
  }

  tick(ticks) {
    gameEngine.spawnEffect(
      EFFECT_LAYERS.under,
      new CircleEffect(
        this.position.x,
        this.position.y,
        this._bulletSmokeShrinkAnimation,
        SIZES.bulletRadius - 2,
        "rgba(252, 240, 199, 0.5)"
      ),
      2
    );
  }

  render(context) {
    this.shape.render(context);
  }

  collide(other, collisionPoint) {
    if(other instanceof Enemy && !this.hit) {
      this.hit = true;
      if(other.hp < 0) return;
      other.hp -= this.stats.damage;
      if(other.hp < 0) this.stats.kills++;
      other.velocity.add(this.velocity.normalize().scale(WEIGHTS.repulsion.bullet));

      other.lastBulletDirection = this.velocity;
    }
    gameEngine.deleteEntity(this);
    gameEngine.spawnEffect(
      EFFECT_LAYERS.above,
      new CircleEffect(
        this.position.x,
        this.position.y,
        thunk,
        (Math.random() * (SIZES.bulletSmokeRadius.max - SIZES.bulletSmokeRadius.min) + SIZES.bulletSmokeRadius.min) * 1.2,
        "rgba(255, 240, 240, 0.8)"
      ),
      6
    );
  }
}