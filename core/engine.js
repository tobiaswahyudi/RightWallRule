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

    this.maze = new Maze(16, 0.64);

    this.options = {};
    this.entities = {
      wall: new Set(),
      enemy: new Set(),
      bullet: new Set(),
      tower: new Set(),
      chest: new Set(),
    };
    this.effects = {
      under: new Set(),
      above: new Set()
    };
    this.player = null;
    this.playerGridSquareLastTick = null;

    this.collisionMap = new CollisionHashMap();

    this.input = null;
    this.ticks = 0;
  }
  
  /**************************************
   * Utilities
   **************************************/

  // Spawns a new entity.
  spawnEntity(type, entity) {
    entity.spawnTick = this.ticks;
    entity._id = `${type}-${crypto.randomUUID()}`;
    this.entities[type].add(entity);

    this.collisionMap.registerEntity(entity);
  }

  deleteEntity(type, entity) {
    this.entities[type].delete(entity);
    this.collisionMap.deleteEntity(entity);
  }

  // Spawns a new effect.
  spawnEffect(layer, effect, duration) {
    effect.spawnTick = this.ticks;
    effect.endTick = this.ticks + duration;
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
   * Game engine tick.
   * Calls tick() for all entities, then calls this.render().
   **************************************/
  tick() {
    this.perf.logTickStart();
    this.ticks++;
    // Compute everyone

    // Pathfinding
    
    const playerGridRow = Math.floor(this.player.position.y / CONFIG.mazeCellSize);
    const playerGridCol = Math.floor(this.player.position.x / CONFIG.mazeCellSize);
    const playerGridSquare = this.maze.grid[playerGridRow][playerGridCol];

    if(playerGridSquare != this.playerGridSquareLastTick) {
      computeNavDistancesToPlayer(this.maze.grid, this.player, playerGridSquare);
      this.playerGridSquareLastTick = playerGridSquare;
    }

    ////////////// Headings: want to move
    // Enemy Headings
    this.entities.enemy.forEach(enemy => {
      this.collisionMap.updateEntity(enemy);
      enemy.tick(this.ticks, this.player, this.entities.tower);
    })

    // Bullet Headings
    this.entities.bullet.forEach(bullet => {
      this.collisionMap.updateEntity(bullet);
      bullet.tick(this.ticks);
    })

    // Spawn new bullets
    if(this.input.shooting) {
      const bullets = this.player.shoot(this.ticks, this.input.shootDir, true);
      bullets.forEach(bullet => this.spawnEntity("bullet", bullet));
    }

    // Player Headings
    this.collisionMap.updateEntity(player);
    this.player.tick(this.ticks, this.input);

    ////////////// Collisions

    const wallCollisions = [];

    for(const [entity1, entity2] of this.collisionMap.candidatePairs()) {
      const collisionPoint = entity1.shape.collisionCheck(entity2.shape);
      if(!collisionPoint) continue;
      if (entity1 instanceof Wall && entity2 instanceof Wall) continue;
      if(entity1 instanceof Bullet && entity2 instanceof Bullet) continue;
      if((entity1 instanceof Player && entity2 instanceof Bullet) || (entity1 instanceof Bullet && entity2 instanceof Player)) continue;

      // Log all wall collisions
      if (entity1 instanceof Wall || entity2 instanceof Wall) {
        const nonWall = entity1 instanceof Wall ? entity2 : entity1;
        wallCollisions.push([nonWall, collisionPoint]);
      }
      entity1.collide(entity2, collisionPoint);
      entity2.collide(entity1, collisionPoint);
    }

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
    this.effects.under.forEach(effect => effect.tick(this.ticks));
    this.effects.above.forEach(effect => effect.tick(this.ticks));

    ////////////// Render
    this.render(this.ticks);
    // console.log(this)
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

    // Enemy
    this.entities.enemy.forEach(enemy => enemy.render(this.context));

    // Bullet
    this.entities.bullet.forEach(bullet => bullet.render(this.context));

    // Player
    this.player.render(this.context);

    // Above Effects
    this.effects.above.forEach(effect => effect.render(this.context));

    // NAVIGATION GRID
    this.context.fillStyle = "#00FF00";
    this.context.strokeStyle = "#00FF00";
    this.maze.grid.forEach(row => row.forEach(cell => {
      this.context.fillRect(cell.center.x - 2, cell.center.y - 2, 4, 4);
      cell.neighbors.forEach(neighbor => {
        if(neighbor.row < cell.row || neighbor.col < cell.col) {
          this.context.stroke(new Path2D(`M ${cell.center.x}, ${cell.center.y} L ${neighbor.center.x}, ${neighbor.center.y}`));
        }
      });
    }))

    this.context.strokeStyle = "#FF0000";

    this.maze.grid.forEach(row => row.forEach(cell => {
      if(cell.pathTarget) {
        this.context.stroke(new Path2D(`M ${cell.center.x}, ${cell.center.y} L ${cell.pathTarget.x}, ${cell.pathTarget.y}`));
      }
    }));

    this.context.resetTransform();

    // FPS Counter
    this.context.font = "15px Arial";
    this.context.fillStyle = "#00FF00";
    this.context.textAlign = "right";
    this.context.fillText(Math.trunc(this.perf.fps), this.width - 15, 15 * CONFIG.pixelation);
    this.context.fillText(Math.trunc(this.perf.maxTps), this.width - 15, 35 * CONFIG.pixelation);

    this.perf.logTickEnd();
  }
}

const gameEngine = new GameEngine();

const thunk = () => {};