class BulletEmitter {
  constructor(anchorPosition, color = COLORS.towerBullet) {
    this.color = color;
    this.anchorPosition = anchorPosition;
    this.bulletVelocity = 12;
    this.fireRate = 300;
    this.lastShoot = 0;
  }

  shoot(heading) {
    const timeNow = new Date().getTime();
    if(timeNow - this.lastShoot >= this.fireRate) {
      this.lastShoot = timeNow;
      return new Bullet(this.anchorPosition.x, this.anchorPosition.y, this.color, heading, this.bulletVelocity);
    }
    return null;
  }
}

class Bullet extends Entity {
  constructor(x, y, color, heading, velocity) {
    super(x, y);
    this.heading = heading.copy;
    this.velocity = velocity;

    this.color = color;
  }

  tick(ticks) {
    this.move();
  }

  render(context) {
    context.fillStyle = this.color;

    context.beginPath();
    context.ellipse(
      this.position.x, this.position.y,
      SIZES.bulletRadius, SIZES.bulletRadius,
      0, 0, 360
    );
    context.fill();
  }
}