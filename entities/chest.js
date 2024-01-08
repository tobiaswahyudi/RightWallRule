import { Entity } from "./entity.js";
import { CircleShapedSprite, RectShapedSprite } from "./shapes.js";

import { ChestScreen } from "../ui/screens/chest.js";
import gameEngine from "../core/engine.js";
import { Player } from "./player.js";

export class Chest extends Entity {
  constructor(x, y) {
    super(x, y);
    this.innerRadius = 10;
    this.outerRadius = 55;
    this.shinePath = new Path2D(`
      M ${this.innerRadius * Math.cos(0)}, ${this.innerRadius * Math.sin(0)}
      L ${(this.innerRadius + this.outerRadius) * Math.cos(1/6 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(1/6 * Math.PI)}
      L ${this.innerRadius * Math.cos(1/3 * Math.PI)}, ${this.innerRadius * Math.sin(1/3 * Math.PI)}
      L ${(this.innerRadius + this.outerRadius) * Math.cos(3/6 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(3/6 * Math.PI)}
      L ${this.innerRadius * Math.cos(2/3 * Math.PI)}, ${this.innerRadius * Math.sin(2/3 * Math.PI)}
      L ${(this.innerRadius + this.outerRadius) * Math.cos(5/6 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(5/6 * Math.PI)}
      L ${this.innerRadius * Math.cos(3/3 * Math.PI)}, ${this.innerRadius * Math.sin(3/3 * Math.PI)}
      L ${(this.innerRadius + this.outerRadius) * Math.cos(7/6 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(7/6 * Math.PI)}
      L ${this.innerRadius * Math.cos(4/3 * Math.PI)}, ${this.innerRadius * Math.sin(4/3 * Math.PI)}
      L ${(this.innerRadius + this.outerRadius) * Math.cos(9/6 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(9/6 * Math.PI)}
      L ${this.innerRadius * Math.cos(5/3 * Math.PI)}, ${this.innerRadius * Math.sin(5/3 * Math.PI)}
      L ${(this.innerRadius + this.outerRadius) * Math.cos(11/6 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(11/6 * Math.PI)}
      L ${this.innerRadius * Math.cos(6/3 * Math.PI)}, ${this.innerRadius * Math.sin(6/3 * Math.PI)}
      Z
    `);

    this.shape = new RectShapedSprite(x - 10, x + 10, y - 10, y + 10, "#EEFFEE");
  }

  render(context, ticks) {
    context.fillStyle = "#FFFFDD99";
    const path = new Path2D();
    path.addPath(this.shinePath, new DOMMatrix().translate(this.position.x, this.position.y).rotate(ticks / 2.1).scale(0.85 + 0.15 * Math.sin(ticks / 30)));
    context.fill(path);
    this.shape.render(context);
  }

  collide(rhs) {
    if(rhs instanceof Player) {
      gameEngine.pause();
      gameEngine.uiManager.window = new ChestScreen(() => {
        gameEngine.deleteEntity(this);
        gameEngine.paused = false;
      });
    }
  }
}