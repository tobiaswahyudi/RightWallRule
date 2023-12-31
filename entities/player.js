class Player extends Entity {
  constructor() {
    super(0, 0);

    this.velocity = 3;

    this.shooty = new BulletEmitter(this.position, COLORS.playerBullet);
  }

  tick(ticks, input) {
    this.heading = input.movement;
    this.move();
  }

  shoot(input) {
    return this.shooty.shoot(input.shootDir);
  }

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