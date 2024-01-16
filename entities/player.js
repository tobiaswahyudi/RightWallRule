import { Entity } from "./entity.js";
import { COLORS, SIZES, WEIGHTS, SPEEDS, CONFIG } from "../config.js";
import { CircleShapedSprite } from "./shapes.js";
import { EFFECT_LAYERS } from "../effects/effect.js";
import { CircleEffect } from "../effects/circleEffect.js";
import { Vector2 } from "../utils/vector2.js";
import { ImageSrc } from "../utils/image.js";
import { HPManager } from "./hpManager.js";
import { Enemy } from "./enemies/enemy.js";
import gameEngine from "../core/engine.js";

export class Player extends Entity {
  constructor(gameEngine) {
    super(0, 0);

    this.hp = new HPManager(100, CONFIG.FPS * 2, 0.05);

    this.shape = new CircleShapedSprite(this.position, SIZES.playerRadius, COLORS.player);

    this.shadow = new CircleEffect(0, 0, this.followMe(6, 9), SIZES.playerRadius, COLORS.shadowOnFloor);

    gameEngine.spawnEffect(EFFECT_LAYERS.under, this.shadow, -1);

    this.lastDirection = new Vector2(1, 0);
    this.image = ImageSrc('./img/entities/player.png');
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
    this.hp.tick(ticks);
  }

  render(context) {
    // this.shape.render(context);
    context.drawImage(this.image, this.position.x - 27, this.position.y - 27);
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.lastDirection.theta);
    if(this.lastDirection.x < 0) {
      context.scale(1, -1);
    }
    context.drawImage(gameEngine.inventoryManager.selectedGun.image, SIZES.playerRadius-16, -10);
    context.restore();
  }

  collide(other, collisionPoint, ticks) {
    other.repelFrom(collisionPoint, WEIGHTS.repulsion.player);
    if(other instanceof Enemy) this.hp.takeDmg(0.1, ticks);
  }
}