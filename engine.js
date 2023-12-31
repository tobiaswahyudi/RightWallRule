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

class GameEngine {
  constructor() {
    this.perf = new PerfCounter();

    this.canvas = null;
    this.context = null;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.options = {};
    this.entities = {
      walls: [],
      enemies: [],
      bullets: [],
      towers: [],
      chests: [],
    };
    this.player = null;
    this.input = null;
    this.ticks = 0;
  }

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

  tick() {
    this.perf.logTick();
    this.ticks++;
    // Compute everyone

    // Enemy Movement
    this.entities.enemies.forEach(enemy => enemy.tick(this.ticks, this.player, this.entities.towers))

    // Bullet Movement
    this.entities.bullets.forEach(bullet => bullet.tick(this.ticks))

    // Player Movement
    this.player.heading = this.input.movement;
    // Check for player-wall collisions here
    this.player.move();

    // Render
    this.render(this.ticks);
    // console.log(this)
  }

  render() {
    // Render everyone
    this.context.resetTransform();

    // Floor
    this.context.fillStyle = COLORS.floor;

    // Set up transform
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.translate(this.width/2 - this.player.position.x, this.height/2 - this.player.position.y);

    // Walls
    this.entities.walls.forEach(wall => wall.render(this.context));

    // Enemies
    this.entities.enemies.forEach(enemy => enemy.render(this.context));

    // Bullets
    this.entities.bullets.forEach(bullet => bullet.render(this.context));

    // Player
    this.player.render(this.context);

    // FPS Counter
    this.context.font = "15px Arial";
    this.context.fillStyle = "#00FF00";
    this.context.textAlign = "right";
    this.context.resetTransform();
    this.context.fillText(this.perf.fps, this.width - 5, 20);
  }
}

const gameEngine = new GameEngine();