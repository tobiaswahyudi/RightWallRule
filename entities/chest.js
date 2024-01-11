import { Entity } from "./entity.js";
import { RectShapedSprite } from "./shapes.js";

import gameEngine from "../core/engine.js";
import { Player } from "./player.js";

import { Spawner } from "./enemies/spawner.js";
import { CONFIG, SIZES } from "../config.js";
import { EFFECT_LAYERS } from "../effects/effect.js";
import { AbstractEffect } from "../effects/abstractEffect.js";
import { VFXFlare } from "../effects/vfx/flare.js";

export class Chest extends Entity {
  constructor(x, y) {
    super(x, y);
    this.innerRadius = 10;
    this.outerRadius = 55;
    this.opened = false;
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
    this.effect = new AbstractEffect(x, y);
    gameEngine.spawnEffect(EFFECT_LAYERS.under, this.effect, -1);

    this.seenByPlayer = false;
    this.renderPath = false;
  }

  tick() {
    const myGridRow = Math.floor(this.position.y / SIZES.mazeCell);
    const myGridCol = Math.floor(this.position.x / SIZES.mazeCell);

    let myCell = gameEngine.maze.grid[myGridRow][myGridCol];

    if(gameEngine.screenCells.has(myCell) && !this.seenByPlayer) {
      this.seenByPlayer = true;
      VFXFlare(gameEngine.player.position, this.position, "#FFFF22", () => {
        this.renderPath = true;
      })
    }

    if(this.renderPath) {
      const coords = [];
      do {
        coords.push(myCell.center);
        myCell = myCell.nextCell;
      } while (myCell);
      coords.push(gameEngine.player.position);

      if(coords.length < 2) return;

      this.effect.shapeConstructor = () => new Path2D(`M ${coords.map(vec => `${vec.x}, ${vec.y}`).join(" L ")}`);
      this.effect.stroke = "#00004455";
      this.effect.strokeWidth = 2;
    }
  }

  render(context, ticks) {
    context.fillStyle = "#FFFF5555";
    const yellowStar = new Path2D();
    yellowStar.addPath(this.shinePath, new DOMMatrix().translate(this.position.x, this.position.y).rotate((ticks / 2.1) + 30).scale(0.7 + 0.2 * Math.sin(ticks / 30)));
    context.fill(yellowStar);
    context.fillStyle = "#FFFFDD99";
    const whiteStar = new Path2D();
    whiteStar.addPath(this.shinePath, new DOMMatrix().translate(this.position.x, this.position.y).rotate(ticks / 2.1).scale(0.85 + 0.15 * Math.sin(ticks / 30)));
    context.fill(whiteStar);
    this.shape.render(context);
  }

  collide(rhs) {
    if(rhs instanceof Player && !this.opened) {
      gameEngine.paused = true;
      gameEngine.uiManager.showChestDialog(gameEngine.inventoryManager, () => {
        gameEngine.deleteEntity(this);
        gameEngine.deleteEffect(this.effect);
        gameEngine.paused = false;

        gameEngine.claimedChests++;

        for(let i = 0; i < gameEngine.claimedChests; i++) {
          const unlucky = [...gameEngine.entities.chest][0];
          gameEngine.deleteEntity(unlucky);
          gameEngine.deleteEffect(unlucky.effect);
          gameEngine.spawnEntity("spawner", new Spawner(unlucky.position.x, unlucky.position.y, 8 * CONFIG.FPS));
        }
      });
      this.opened = true;
    }
  }
}