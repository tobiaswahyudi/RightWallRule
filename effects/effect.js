import { Vector2 } from "../utils/vector2.js";
import gameEngine from "../core/engine.js";

export const EFFECT_LAYERS = {
  under: "under",
  above: "above",
}

export class Effect {
  constructor(x, y, animation) {
    this.position = new Vector2(x, y);
    this.animation = animation;
    this.endTick = 0;
    this.despawnAction = null;
  }

  tick(ticks) {
    if(this.animation) this.animation(this, ticks);
    if(this.endTick == ticks) {
      gameEngine.deleteEffect(this);
      if(this.despawnAction) this.despawnAction(ticks);
    }
  }
}