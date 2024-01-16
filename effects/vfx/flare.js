import gameEngine from "../../core/engine.js";
import { thunk } from "../../utils/thunk.js";
import { CircleEffect } from "../circleEffect.js";
import { EFFECT_LAYERS } from "../effect.js";
import { VFXPoof } from "./poof.js";

const FLARE_DURATION = 60;

function flareMove(startPosition, targetPosition) {
  return (fx, ticks) => {
    const x = ticks - fx.spawnTick;
    const distRatio = (2 * FLARE_DURATION - x) * x / (FLARE_DURATION * FLARE_DURATION);
    fx.position = targetPosition.delta(startPosition).scale(distRatio).add(startPosition);
  }
}

export function VFXFlare(startPosition, targetPosition, color, despawnAction = thunk) {
  const flare = new CircleEffect(
    startPosition.x, startPosition.y, flareMove(startPosition.copy, targetPosition, FLARE_DURATION), 8, color
  );
  flare.despawnAction = (ticks) => {
    VFXPoof(EFFECT_LAYERS.above, targetPosition, 20, 10, color, 30, 150, 250);
    despawnAction(ticks);
  };
  gameEngine.spawnEffect(EFFECT_LAYERS.above, flare, FLARE_DURATION);
}

