import { CrawlerEnemy } from "./crawler.js";
import { CONFIG, SIZES, SPEEDS } from "../../config.js";
import { CircleShapedSprite } from "./../shapes.js";
import gameEngine from "../../core/engine.js";
import { Entity } from "../entity.js";
import { normalSample } from "../../utils/random.js";

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
    // 100 * sin(3.14159 * 1/3)

    this.shape = new CircleShapedSprite(this.position, 15, "#000044");

    this.lastSentinel = null;
  }

  tick(ticks) {
    const myGridRow = Math.floor(this.position.y / SIZES.mazeCell);
    const myGridCol = Math.floor(this.position.x / SIZES.mazeCell);

    let myCell = gameEngine.maze.grid[myGridRow][myGridCol];
    let lastEdgeCell = myCell;
    let distance = myCell.distanceToPlayer;

    while(myCell && myCell.nextCell) {
      if(gameEngine.edgeCells.has(myCell)) lastEdgeCell = myCell;
      myCell = myCell.nextCell;
    }

    distance -= lastEdgeCell.distanceToPlayer;

    const ticksToDistance = 2 * distance / SPEEDS.crawler;

    if(ticks > this.lastSpawn + this.spawnDelay + ticksToDistance) {
      this.lastSpawn = ticks - ticksToDistance;
      this.spawnHorde(lastEdgeCell.center, ticks - ticksToDistance);
    }
  }

  resetSpawn(ticks) {
    return (sentinel) => {
      if(sentinel == this.lastSentinel) this.lastSpawn = ticks - this.spawnDelay;
    }
  }

  spawnHorde(position, ticks) {
    const quantity = 24 + normalSample() * 8;
    for(let i = 1; i < quantity; i++) {
      gameEngine.spawnEntity("enemy", new CrawlerEnemy(
        position.x + ((Math.random() - 0.5) * (SIZES.mazeCell - 2 * SIZES.wallWidth) / 3),
        position.y + ((Math.random() - 0.5) * (SIZES.mazeCell - 2 * SIZES.wallWidth) / 3)
      ));
    }
    const sentinel = new CrawlerEnemy(
      position.x + ((Math.random() - 0.5) * (SIZES.mazeCell - 2 * SIZES.wallWidth) / 3),
      position.y + ((Math.random() - 0.5) * (SIZES.mazeCell - 2 * SIZES.wallWidth) / 3)
    );
    sentinel.designateAsSentinel(this.resetSpawn(ticks));
    this.lastSentinel = sentinel;
    gameEngine.spawnEntity("enemy", sentinel);
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