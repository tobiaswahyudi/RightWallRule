import { CONFIG, SIZES, WEIGHTS } from "../config.js";
import gameEngine from "../core/engine.js";
import { Entity } from "../entities/entity.js";
import { CircleShapedSprite } from "../entities/shapes.js";
import { indexifyRowCol } from "../maze/maze.js";
import { Vector2 } from "../utils/vector2.js";

export const TURRET_TARGETING_TENDENCY = {
  NEAREST_FIRST: "Nearest First",
  DETERMINED: "Determined",
}

export class TurretStats {
  constructor(hp, targetingRange) {
    this.maxHp = hp;
    this.targetingRange = targetingRange;
  }
}

export class Turret extends Entity {
  constructor(gun, turretStats) {
    super(0, 0);
    this.deployed = false;

    this.gridRow = 0;
    this.gridCol = 0;

    this.gun = gun;
    this.stats = turretStats;
    this.hp = this.stats.maxHp;

    this.adjacentCells = new Set();
    this.nearbyEnemies = new Set();

    this.targetDirection = new Vector2(1, 0);

    this.shape = new CircleShapedSprite(this.position, 15, "#223366");
  }

  deploy(position) {
    if(this.deployed) throw new Error("Attempting to deploy already-deployed turret");

    this.deployed = true;
    this.position.x = position.x;
    this.position.y = position.y;

    this.adjacentCells.clear();
    this.nearbyEnemies.clear();

    this.gridRow = Math.floor(this.position.y / SIZES.mazeCell);
    this.gridCol = Math.floor(this.position.x / SIZES.mazeCell);

    this.adjacentCells.clear();
    this.adjacentCells.add(indexifyRowCol(this.gridRow, this.gridCol));
    if(!gameEngine.maze.grid[this.gridRow][this.gridCol].E) this.adjacentCells.add(indexifyRowCol(this.gridRow, this.gridCol + 1));
    if(!gameEngine.maze.grid[this.gridRow][this.gridCol].W) this.adjacentCells.add(indexifyRowCol(this.gridRow, this.gridCol - 1));
    if(!gameEngine.maze.grid[this.gridRow][this.gridCol].N) this.adjacentCells.add(indexifyRowCol(this.gridRow - 1, this.gridCol));
    if(!gameEngine.maze.grid[this.gridRow][this.gridCol].S) this.adjacentCells.add(indexifyRowCol(this.gridRow + 1, this.gridCol));

    gameEngine.spawnEntity("turret", this);
  }

  undeploy() {
    this.deployed = false;
    gameEngine.deleteEntity(this);
  }

  tick(ticks) {
    // Do expensive computation only once in a while
    if(ticks % (CONFIG.FPS / 2) == 0) {
      this.nearbyEnemies.clear();
      gameEngine.entities.enemy.forEach(enemy => {
        const gridRow = Math.floor(enemy.position.y / SIZES.mazeCell);
        const gridCol = Math.floor(enemy.position.x / SIZES.mazeCell);

        if(this.adjacentCells.has(indexifyRowCol(gridRow, gridCol))) {
          this.nearbyEnemies.add(enemy);
        }
      });
    }

    if(this.nearbyEnemies.size == 0) return [];

    let nearestEnemy = null;
    let nearestEnemyDistance = Infinity;
    this.nearbyEnemies.forEach(enemy => {
      const dist = enemy.position.delta(this.position).magnitude;
      if(dist < nearestEnemyDistance) {
        nearestEnemy = enemy;
        nearestEnemyDistance = dist;
      }
    });

    if(nearestEnemyDistance > this.stats.targetingRange) return [];

    this.targetDirection = nearestEnemy.position.delta(this.position).normalize();
    return this.gun.shoot(ticks, this.position, this.targetDirection.normalize());
  }

  render(context) {
    if(!this.deployed) throw new Error("Attempting to render not-deployed turret");
    this.shape.render(context);
    
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.targetDirection.theta);
    if(this.targetDirection.x < 0) {
      context.scale(1, -1);
    }
    context.drawImage(this.gun.image, 15-16, -10);
    context.restore();
  }

  collide(other, collisionPoint) {
    other.repelFrom(collisionPoint, WEIGHTS.repulsion.player);
  }
}