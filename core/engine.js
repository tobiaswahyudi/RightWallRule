import { PerfCounter } from "./perf.js";
import { Maze } from "../maze/maze.js";
import { SIZES, CONFIG, COLORS, SPEEDS } from "../config.js";
import { CollisionHashMap } from "../utils/collisionHashMap.js";
import { ScaledCanvas } from "./canvas.js";
import { computeNavDistancesToPlayer } from "../maze/pathfinding.js";
import { Player } from "../entities/player.js";
import { GameInputManager } from "./input.js";
import { mutualCollide } from "../entities/collisions.js";
import { UIManager } from "../ui/manager.js";

import { HUD } from "../ui/hud.js";
import { InventoryManager } from "./inventory.js";
import { Gun, GunStats } from "../guns/gun.js";
import { Turret, TurretStats } from "../turrets/turret.js";

/**************************************
 * Game Engine Class
 **************************************/
class GameEngine {
  constructor() {
    this.perf = new PerfCounter();

    this.canvas = null;
    this.context = null;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.paused = false;
    this.uiManager = new UIManager();

    this.maze = new Maze(0.64);

    this.options = {};
    this.entities = {
      wall: new Set(),
      enemy: new Set(),
      spawner: new Set(),
      bullet: new Set(),
      turret: new Set(),
      chest: new Set(),
    };
    this.effects = {
      under: new Set(),
      above: new Set()
    };
    this.collisionMap = new CollisionHashMap();

    this.player = new Player(this);
    this.player._id = "player";
    this.collisionMap.registerEntity(this.player);

    this.playerGridSquareLastTick = null;

    this.input = new GameInputManager();
    this.gameTicks = 0;

    this.inventoryManager = new InventoryManager();

    this.inventoryManager.replaceGun(new Gun(
      "Triple Peashooter",
      "./img/guns/peashooter.png",
      "#304405",
      new GunStats(3, 5, SPEEDS.bullet, 1, 5)
    ), 0);

    this.inventoryManager.replaceTurret(new Turret(
      new Gun("Double Peashooter", "./img/guns/peashooter.png", "#002211", new GunStats(2, 6, SPEEDS.bullet, 1, 10)),
      new TurretStats(50, SIZES.mazeCell)
    ), 0);
    
    this.hud = new HUD(this.inventoryManager);
    this.inventoryManager.hud = this.hud;
    
    this.realTicks = 0;

    this.claimedChests = -1;
  }
  
  /**************************************
   * Utilities
   **************************************/

  // Spawns a new entity.
  spawnEntity(type, entity) {
    // Please shoot some enemies, I'm begging you
    if(type == "enemy" && this.entities[type].size > 666) {
      this.deleteEffect(entity.shadow);
      return;
    }

    entity.spawnTick = this.gameTicks;
    entity._id = `${type}-${crypto.randomUUID()}`;
    entity._type = type;
    this.entities[type].add(entity);

    this.collisionMap.registerEntity(entity);
  }

  deleteEntity(entity) {
    this.entities[entity._type].delete(entity);
    this.collisionMap.deleteEntity(entity);
  }

  // Spawns a new effect.
  spawnEffect(layer, effect, duration) {
    effect.spawnTick = this.gameTicks;
    effect.endTick = this.gameTicks + duration;
    effect._layer = layer;
    this.effects[layer].add(effect);
  }

  deleteEffect(effect) {
    this.effects[effect._layer].delete(effect);
  }

  /**************************************
   * Starts the game engine.
   * Sets up canvas and stuff, then kicks off the tick loop.
   **************************************/
  start(canvas, window) {
    this.canvas = new ScaledCanvas(canvas, CONFIG.pixelation);
    this.context = this.canvas.getContext('2d');
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.input.setupListeners(window);

    const boundTick = this.tick.bind(this);

    computeNavDistancesToPlayer(this.maze.grid, this.player, this.maze.grid[0][0]);

    function runTick() {
      boundTick();
      requestAnimationFrame(runTick);
    }

    this.perf.firstTick();
    requestAnimationFrame(runTick);
  }

  /**************************************
   * Engine tick. Does not call gameTick() if the game is paused.
   * Calls tick() for all entities, then calls this.render().
   **************************************/

  tick() {
    this.perf.logTickStart();
    this.realTicks++;
    if(!this.paused) {
      this.gameTick();
      ////////////// Render game
      this.render(this.gameTicks);
    }
    if(this.paused) {
      this.context.fillStyle = "#000000";
      this.context.fillRect(this.width - 100, 0, 100, 50);
    }
    
    this.context.resetTransform();
    // FPS Counter
    this.context.font = "15px Arial";
    this.context.fillStyle = "#00FF00";
    this.context.textAlign = "right";
    this.context.fillText(Math.trunc(this.perf.fps), this.width - 15, 15 * CONFIG.pixelation);
    this.context.fillText(Math.trunc(this.perf.maxTps), this.width - 15, 33 * CONFIG.pixelation);

    this.input.tick();

    this.perf.logTickEnd();
  }

  /**************************************
   * In-game tick.
   * Calls tick() for all entities, then calls this.render().
   **************************************/
  gameTick() {
    this.gameTicks++;
    // Compute everyone

    // Pathfinding
    
    const playerGridRow = Math.floor(this.player.position.y / SIZES.mazeCell);
    const playerGridCol = Math.floor(this.player.position.x / SIZES.mazeCell);
    const playerGridSquare = this.maze.grid[playerGridRow][playerGridCol];

    if(playerGridSquare != this.playerGridSquareLastTick) {
      computeNavDistancesToPlayer(this.maze.grid, this.player, playerGridSquare);
      this.playerGridSquareLastTick = playerGridSquare;
    }

    ////////////// Headings: want to move
    // Spawner Tick
    this.entities.spawner.forEach(spawner => {
      spawner.tick(this.gameTicks);
    });

    // Chest Tick
    this.entities.chest.forEach(chest => {
      chest.tick(this.gameTicks);
    });
    
    // Enemy Headings
    this.entities.enemy.forEach(enemy => {
      this.collisionMap.updateEntity(enemy);
      enemy.tick(this.gameTicks, this.player, this.entities.tower);
    })

    // Spawn new bullets
    if(this.input.shooting) {
      const bullets = this.inventoryManager.selectedGun.shoot(
        this.gameTicks,
        this.input.shootDir.scale(SIZES.playerRadius).add(this.player.position),
        this.input.shootDir
      );
      bullets.forEach(bullet => this.spawnEntity("bullet", bullet));
    }

    // Spawn new turrets
    if(this.input.rawInput.newlyPressedKeys.has('KeyE')) {
      if(this.inventoryManager.turrets[0].deployed) {
        this.inventoryManager.turrets[0].undeploy();
      } else {
        this.inventoryManager.turrets[0].deploy(this.player.position);
      }
    }

    // Turret Ticks
    this.entities.turret.forEach(turret => {
      const bullets = turret.tick(this.gameTicks);
      if(bullets.length != 0)
        bullets.forEach(bullet => this.spawnEntity("bullet", bullet));
    });
    
    // Bullet Headings
    this.entities.bullet.forEach(bullet => {
      this.collisionMap.updateEntity(bullet);
      bullet.tick(this.gameTicks);
    });

    // Player Headings
    this.collisionMap.updateEntity(this.player);
    this.player.tick(this.gameTicks, this.input);

    ////////////// Collisions

    const wallCollisions = [];

    const candidatePairIterator = this.collisionMap.candidatePairs();
    for(const [entity1, entity2] of candidatePairIterator) mutualCollide(wallCollisions, entity1, entity2);

    wallCollisions.forEach(([entity, collisionPoint]) => {
      const collisionDelta = collisionPoint.delta(entity.position);
      if(entity.velocity.projectionLength(collisionDelta) > 0) {
        // Velocity moves entity into collision
        const unitPerp = collisionDelta.perp().normalize();
        entity.velocity = unitPerp.scale(entity.velocity.projectionLength(unitPerp));
      }
    })
    
    ////////////// Movement
    // Move Enemies
    this.entities.enemy.forEach(enemy => enemy.move())

    // Move Bullets
    this.entities.bullet.forEach(bullet => bullet.move())

    // Move Players
    this.player.move();

    // Effects
    this.effects.under.forEach(effect => effect.tick(this.gameTicks));
    this.effects.above.forEach(effect => effect.tick(this.gameTicks));
  }

  /**************************************
   * Animation tick.
   * Calls render() for all entities.
   * Layers on entity type. 
   **************************************/
  render() {
    // Render everyone
    this.context.resetTransform();

    // Floor
    this.context.fillStyle = COLORS.floor;

    // Set up transform
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.translate(this.width/2 - this.player.position.x, this.height/2 - this.player.position.y);

    // Under Effects
    this.effects.under.forEach(effect => effect.render(this.context));

    // Wall
    this.entities.wall.forEach(wall => wall.render(this.context));

    // Spawner
    this.entities.spawner.forEach(spawner => spawner.render(this.context, this.gameTicks));
    
    // Enemy
    this.entities.enemy.forEach(enemy => enemy.render(this.context));

    // Chest
    this.entities.chest.forEach(chest => chest.render(this.context, this.gameTicks));

    // Bullet
    this.entities.bullet.forEach(bullet => bullet.render(this.context));

    // Turret
    this.entities.turret.forEach(turret => turret.render(this.context));

    // Player
    this.player.render(this.context);

    // Above Effects
    this.effects.above.forEach(effect => effect.render(this.context));

    // // NAVIGATION GRID
    // this.context.fillStyle = "#00FF00";
    // this.context.strokeStyle = "#00FF00";
    // this.maze.grid.forEach(row => row.forEach(cell => {
    //   this.context.fillRect(cell.center.x - 2, cell.center.y - 2, 4, 4);
    //   cell.neighbors.forEach(neighbor => {
    //     if(neighbor.row < cell.row || neighbor.col < cell.col) {
    //       this.context.stroke(new Path2D(`M ${cell.center.x}, ${cell.center.y} L ${neighbor.center.x}, ${neighbor.center.y}`));
    //     }
    //   });
    // }))

    // this.context.strokeStyle = "#FF0000";

    // this.maze.grid.forEach(row => row.forEach(cell => {
    //   if(cell.pathTarget) {
    //     this.context.stroke(new Path2D(`M ${cell.center.x}, ${cell.center.y} L ${cell.pathTarget.x}, ${cell.pathTarget.y}`));
    //   }
    // }));
  }
}

const gameEngine = new GameEngine();

export default gameEngine;