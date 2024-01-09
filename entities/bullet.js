import { Entity } from "./entity.js";
import { Enemy } from "./enemies/enemy.js";
import { CircleShapedSprite } from "./shapes.js";
import { SIZES, COLORS, WEIGHTS, SPEEDS } from "../config.js";
import gameEngine from "../core/engine.js";
import { EFFECT_LAYERS, CircleEffect } from "./effect.js";
import { thunk } from "../utils/thunk.js";

export class Bullet extends Entity {
  constructor(x, y, color, heading, speed) {
    super(x, y);
    this.velocity = heading.copy.scale(speed);

    this.color = color;
    this.shape = new CircleShapedSprite(this.position, SIZES.bulletRadius, color);
  }

  _bulletSmokeShrinkAnimation(bulletSmoke, ticks) {
    bulletSmoke.radius = bulletSmoke.originalRadius * (bulletSmoke.endTick - ticks) / (bulletSmoke.endTick - bulletSmoke.spawnTick);
  }

  tick(ticks) {
    gameEngine.spawnEffect(
      EFFECT_LAYERS.under,
      new CircleEffect(
        this.position.x + (Math.random() - 0.5) * 4,
        this.position.y + (Math.random() - 0.5) * 4,
        this._bulletSmokeShrinkAnimation,
        Math.random() * (SIZES.bulletSmokeRadius.max - SIZES.bulletSmokeRadius.min) + SIZES.bulletSmokeRadius.min,
        "rgba(252, 240, 199, 0.5)"
      ),
      10
    );
  }

  render(context) {
    this.shape.render(context);
  }

  collide(other, collisionPoint) {
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
    if(other instanceof Enemy) {
      other.hp -= 5;
      other.velocity.add(this.velocity.normalize().scale(WEIGHTS.repulsion.bullet));
    }
  }
}