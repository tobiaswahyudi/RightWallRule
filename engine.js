class GameEngine {
  constructor() {
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

    requestAnimationFrame(runTick);
  }

  tick() {
    // Compute everyone
    this.player.heading = this.input.movement;

    // Check for player-wall collisions
    this.player.move();

    // Render
    this.render();
    // console.log(this)
  }

  render() {
    // Render everyone
    this.context.resetTransform();
    this.context.fillStyle = COLORS.floor;

    this.context.fillRect(0, 0, this.width, this.height);

    this.context.translate(this.width/2 - this.player.position.x, this.height/2 - this.player.position.y);

    this.entities.walls.forEach(wall => wall.render(this.context));

    this.player.render(this.context);
  }
}

const gameEngine = new GameEngine();