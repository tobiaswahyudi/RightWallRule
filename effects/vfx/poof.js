import gameEngine from "../../core/engine.js";
import { Vector2 } from "../../utils/vector2.js";
import { CircleEffect } from "../circleEffect.js";

function movePoofParticle(startPosition, endPosition) {
  return (fx, ticks) => {
    fx.position = endPosition.delta(startPosition).scale((ticks - fx.spawnTick) / (fx.endTick - fx.spawnTick)).add(startPosition);
    fx.radius = fx.originalRadius * (fx.endTick - ticks) / (fx.endTick - fx.spawnTick);
  }
}

export function VFXPoof(layer, position, count, radius, color, duration, minSpeed, maxSpeed, minAngle = 0, maxAngle = 360) {
  const a = maxAngle - minAngle;
  const angle = a/count;
  const direction = new Vector2(1, 0);
  for(let i = 0; i < count; i++) {
    const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
    const theta = (i + Math.random() - 0.5) * angle + minAngle;
    gameEngine.spawnEffect(
      layer,
      new CircleEffect(
        position.x,
        position.y,
        movePoofParticle(position, direction.copy.scale(speed).rotate(theta).add(position)),
        radius,
        color
      ),
      duration
    );
  }
}