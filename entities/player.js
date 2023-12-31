class Player extends Entity {
  constructor() {
    super(0, 0);

    this.velocity = 3;
  }
  tick() {}

  render(context) {
    context.fillStyle = COLORS.player;

    context.beginPath();
    context.ellipse(
      this.position.x, this.position.y,
      SIZES.playerRadius, SIZES.playerRadius,
      0, 0, 360
    );
    context.fill();
  }
}

const player = new Player();