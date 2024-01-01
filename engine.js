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
      wall: [],
      enemy: [],
      bullet: [],
      tower: [],
      chest: [],
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
    entity._id = `${type}-${crypto.randomUUID()}`;
    this.entities[type].push(entity);

    this.collisionMap.registerEntity(entity);
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

    ////////////// Headings: want to move
    // Enemy Headings
    this.entities.enemy.forEach(enemy => {
      enemy.tick(this.ticks, this.player, this.entities.tower);
      this.collisionMap.updateEntity(enemy);
    })

    // Bullet Headings
    this.entities.bullet.forEach(bullet => {
      bullet.tick(this.ticks);
      this.collisionMap.updateEntity(bullet);
    })

    // Spawn new bullets
    if(this.input.shooting) {
      const maybeBullet = this.player.shoot(this.input);
      if(maybeBullet) this.spawnEntity("bullet", maybeBullet);
    }

    // Player Headings
    this.player.tick(this.ticks, this.input);
    this.collisionMap.updateEntity(player);

    ////////////// Collisions
    for(const [entity1, entity2] of this.collisionMap.candidatePairs()) {
      if((entity1 instanceof Player && entity2 instanceof Bullet) || (entity1 instanceof Bullet && entity2 instanceof Player)) {
      } else {
        entity1.heading.x = 0;
        entity1.heading.y = 0;
  
        entity2.heading.x = 0;
        entity2.heading.y = 0;
      }
    }

    
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

    // Wall
    this.entities.wall.forEach(wall => wall.render(this.context));

    // Enemy
    this.entities.enemy.forEach(enemy => enemy.render(this.context));

    // Bullet
    this.entities.bullet.forEach(bullet => bullet.render(this.context));

    // Player
    this.player.render(this.context);

    
    this.context.resetTransform();
    // FPS Counter
    this.context.font = "15px Arial";
    this.context.fillStyle = "#00FF00";
    this.context.textAlign = "right";
    this.context.fillText(this.perf.fps, this.width - 5, 20);
  }
}

const gameEngine = new GameEngine();