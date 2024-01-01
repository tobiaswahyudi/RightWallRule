class Player extends Entity {
  constructor() {
    super(0, 0);

    this.velocity = 3;

    this.shooty = new BulletEmitter(this.position, COLORS.playerBullet);
    this.shape = new CircleShapedSprite(this.position, SIZES.playerRadius, COLORS.player);
  }

  tick(ticks, input) {
    this.heading = input.movement;
  }

  shoot(input) {
    return this.shooty.shoot(input.shootDir);
  }

  render(context) {
    this.shape.render(context);
  }
}

const player = new Player();