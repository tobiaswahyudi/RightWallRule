/**************************************
 * Performance Counter
 * 
 * Logs frames per second.
 **************************************/
class PerfCounter {
  constructor() {
    this.ticksPerSecond = [];
    this.secondIndex = 0;
    this.lastTickSecond = 0;
    this.ticksThisSecond = 0;

    // The window width, in seconds.
    this.windowWidth = 10;
  }

  firstTick() {
    this.lastTickSecond = new Date().getSeconds();
  }

  logTick() {
    const thisSecond = new Date().getSeconds();
    if(this.lastTickSecond != thisSecond) {
      if(this.ticksPerSecond.length == this.windowWidth) {
        this.secondIndex %= this.windowWidth;
        this.ticksPerSecond[this.secondIndex] = this.ticksThisSecond;
      } else {
        this.ticksPerSecond.push(this.ticksThisSecond);
      }
      this.ticksThisSecond = 0;
      this.secondIndex++;
    }
    this.ticksThisSecond++;
    this.lastTickSecond = thisSecond;
  }

  get fps() {
    if(this.ticksPerSecond.length == 0) return 0;
    const total = this.ticksPerSecond.reduce((a,b) => a+b);
    return total/this.ticksPerSecond.length;
  }
}

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
    console.log(this)

    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.input.setupListeners(window);

    const boundTick = this.tick.bind(this);

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
    this.perf.logTick();
    this.ticks++;
    // Compute everyone

    // Effects
    this.effects.under.forEach(effect => effect.tick(this.ticks));
    this.effects.above.forEach(effect => effect.tick(this.ticks));

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
      const maybeBullet = this.player.shoot(this.input);
      if(maybeBullet) this.spawnEntity("bullet", maybeBullet);
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


    // Grid
    // upper-left corner of screen
    const upperLeft = new Vector2(-this.width/2, -this.height/2).add(this.player.position);
    const bottomRight = new Vector2(this.width, this.height).add(upperLeft);

    const ulChunk = this.collisionMap.coordsToChunk(upperLeft);
    const drChunk = this.collisionMap.coordsToChunk(bottomRight);

    this.context.strokeStyle = "#000000";

    for(let row = ulChunk.row; row <= drChunk.row; row++) {
      for(let col = ulChunk.col; col <= drChunk.col; col++) {
        this.context.strokeRect(col * CONFIG.collisionMapChunkSize, row * CONFIG.collisionMapChunkSize, CONFIG.collisionMapChunkSize, CONFIG.collisionMapChunkSize);
      }
    }

    this.context.resetTransform();

    // FPS Counter
    this.context.font = "15px Arial";
    this.context.fillStyle = "#00FF00";
    this.context.textAlign = "right";
    this.context.fillText(this.perf.fps, this.width - 5, 20);
  }
}

const gameEngine = new GameEngine();

const thunk = () => {};