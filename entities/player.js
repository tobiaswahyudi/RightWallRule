import { Entity } from "./entity.js";
import { CONFIG, COLORS, SIZES, WEIGHTS, SPEEDS } from "../config.js";
import { CircleShapedSprite } from "./shapes.js";
import { CircleEffect, EFFECT_LAYERS } from "./effect.js";
import { Vector2 } from "../utils/vector2.js";
import gameEngine from "../core/engine.js";

export class Player extends Entity {
  constructor(gameEngine) {
    super(0, 0);

    this.shape = new CircleShapedSprite(this.position, SIZES.playerRadius, COLORS.player);

    this.shadow = new CircleEffect(0, 0, this.followMe(6, 9), SIZES.playerRadius, COLORS.shadowOnFloor);

    gameEngine.spawnEffect(EFFECT_LAYERS.under, this.shadow, -1);

    this.lastDirection = new Vector2(1, 0);
  }

  followMe(xOffset, yOffset) {
    return (effect, ticks) => {
      effect.position.x = this.position.x + xOffset;
      effect.position.y = this.position.y + yOffset;
    }
  }

  tick(ticks, input) {
    this.velocity = input.movement.scale(SPEEDS.player);
    if(input.movement.magnitude > 0) this.lastDirection = input.movement;
    if(gameEngine.input.shooting) this.lastDirection = gameEngine.input.shootDir;
  }

  render(context) {
    this.shape.render(context);
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.lastDirection.theta);
    if(this.lastDirection.x < 0) {
      context.scale(1, -1);
    }
    context.drawImage(gameEngine.inventoryManager.selectedGun.image, SIZES.playerRadius-16, -10);
    context.restore();
  }

  collide(other, collisionPoint) {
    other.repelFrom(collisionPoint, WEIGHTS.repulsion.player);
  }
}