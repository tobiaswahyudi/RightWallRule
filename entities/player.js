class Player extends Entity {
  constructor() {
    super(0, 0);

    this.shooty = new BulletEmitter(this.position, COLORS.playerBullet);
    this.shape = new CircleShapedSprite(this.position, SIZES.playerRadius, COLORS.player);

    this.shadow = new CircleEffect(0, 0, this.followMe(6, 9), SIZES.playerRadius, COLORS.shadowOnFloor);

    gameEngine.spawnEffect(EFFECTS.layer.under, this.shadow, -1);
  }

  followMe(xOffset, yOffset) {
    return (effect, ticks) => {
      effect.position.x = this.position.x + xOffset;
      effect.position.y = this.position.y + yOffset;
    }
  }

  tick(ticks, input) {
    this.velocity = input.movement.scale(SPEEDS.player);
  }

  shoot(input) {
    return this.shooty.shoot(input.shootDir);
  }

  render(context) {
    this.shape.render(context);
  }

  collide(other, collisionPoint) {
    other.repelFrom(collisionPoint, WEIGHTS.repulsion.player);
  }
}

const player = new Player();