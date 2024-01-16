import { CrawlerEnemy } from "./crawler.js";
import { CONFIG, SIZES, SPEEDS } from "../../config.js";
import { CircleShapedSprite } from "./../shapes.js";
import gameEngine from "../../core/engine.js";
import { Entity } from "../entity.js";
import { normalSample } from "../../utils/random.js";
import { EnemyWave } from "./enemy.js";

export class Spawner extends Entity {
  constructor(x, y, spawnDelay) {
    super(x, y);
    this.spawnDelay = spawnDelay;
    this.lastSpawn = -spawnDelay;
    this.innerRadius = 30;
    this.outerRadius = 50;
    this.spiralPath = new Path2D(`
      M ${this.innerRadius * Math.cos(0)}, ${this.innerRadius * Math.sin(0)}
      A ${this.innerRadius + this.outerRadius} ${this.innerRadius + this.outerRadius} 0 0 1 ${(this.innerRadius + this.outerRadius) * Math.cos(1/3 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(1/3 * Math.PI)}
      A ${(this.innerRadius + this.outerRadius)/2} ${(this.innerRadius + this.outerRadius)/2} 0 0 0 ${this.innerRadius * Math.cos(1/3 * Math.PI)}, ${this.innerRadius * Math.sin(1/3 * Math.PI)}
      A ${this.innerRadius + this.outerRadius} ${this.innerRadius + this.outerRadius} 0 0 1 ${(this.innerRadius + this.outerRadius) * Math.cos(2/3 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(2/3 * Math.PI)}
      A ${(this.innerRadius + this.outerRadius)/2} ${(this.innerRadius + this.outerRadius)/2} 0 0 0 ${this.innerRadius * Math.cos(2/3 * Math.PI)}, ${this.innerRadius * Math.sin(2/3 * Math.PI)}
      A ${this.innerRadius + this.outerRadius} ${this.innerRadius + this.outerRadius} 0 0 1 ${(this.innerRadius + this.outerRadius) * Math.cos(3/3 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(3/3 * Math.PI)}
      A ${(this.innerRadius + this.outerRadius)/2} ${(this.innerRadius + this.outerRadius)/2} 0 0 0 ${this.innerRadius * Math.cos(3/3 * Math.PI)}, ${this.innerRadius * Math.sin(3/3 * Math.PI)}
      A ${this.innerRadius + this.outerRadius} ${this.innerRadius + this.outerRadius} 0 0 1 ${(this.innerRadius + this.outerRadius) * Math.cos(4/3 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(4/3 * Math.PI)}
      A ${(this.innerRadius + this.outerRadius)/2} ${(this.innerRadius + this.outerRadius)/2} 0 0 0 ${this.innerRadius * Math.cos(4/3 * Math.PI)}, ${this.innerRadius * Math.sin(4/3 * Math.PI)}
      A ${this.innerRadius + this.outerRadius} ${this.innerRadius + this.outerRadius} 0 0 1 ${(this.innerRadius + this.outerRadius) * Math.cos(5/3 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(5/3 * Math.PI)}
      A ${(this.innerRadius + this.outerRadius)/2} ${(this.innerRadius + this.outerRadius)/2} 0 0 0 ${this.innerRadius * Math.cos(5/3 * Math.PI)}, ${this.innerRadius * Math.sin(5/3 * Math.PI)}
      A ${this.innerRadius + this.outerRadius} ${this.innerRadius + this.outerRadius} 0 0 1 ${(this.innerRadius + this.outerRadius) * Math.cos(6/3 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(6/3 * Math.PI)}
      A ${(this.innerRadius + this.outerRadius)/2} ${(this.innerRadius + this.outerRadius)/2} 0 0 0 ${this.innerRadius * Math.cos(6/3 * Math.PI)}, ${this.innerRadius * Math.sin(6/3 * Math.PI)}
      Z
    `);

    this.shape = new CircleShapedSprite(this.position, 15, "#000044");
  }

  tick(ticks) {
    if(ticks > this.lastSpawn + this.spawnDelay) {
      this.lastSpawn = ticks;
      this.spawnWave(this.position, ticks);
    }
  }

  resetSpawn(ticks) {
    return (sentinel) => {
      if(sentinel == this.lastSentinel) this.lastSpawn = ticks - this.spawnDelay;
    }
  }

  spawnWave(position, ticks) {
    const quantity = 24 + normalSample() * 8;
    const wave = new EnemyWave(ticks);
    for(let i = 1; i <= quantity; i++) {
      wave.addEnemy(new CrawlerEnemy(
        position.x + ((Math.random() - 0.5) * (SIZES.mazeCell - 2 * SIZES.wallWidth) / 3),
        position.y + ((Math.random() - 0.5) * (SIZES.mazeCell - 2 * SIZES.wallWidth) / 3)
      ));
    }
    gameEngine.spawnEnemyWave(wave);
  }

  collide() {

  }

  render(context, ticks) {
    context.fillStyle = "#440066";
    const path = new Path2D();
    path.addPath(this.spiralPath, new DOMMatrix().translate(this.position.x, this.position.y).rotate(-ticks).scale(0.85 + 0.15 * Math.sin(ticks / 20)));
    context.fill(path);
    this.shape.render(context);
  }
}