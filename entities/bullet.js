class BulletEmitter {
  constructor(anchorPosition, color = COLORS.towerBullet) {
    this.color = color;
    this.anchorPosition = anchorPosition;
    this.bulletSpeed = SPEEDS.bullet;
    this.fireDelay = CONFIG.FPS * 0.3;
    this.nextShoot = 0;
  }

  shoot(ticks, direction) {
    if(ticks >= this.nextShoot) {
      this.nextShoot = ticks + this.fireDelay;
      return [new Bullet(this.anchorPosition.x, this.anchorPosition.y, this.color, direction, this.bulletSpeed)];
    }
    return [];
  }
}

class PlayerBulletEmitter extends BulletEmitter {
  constructor(anchorPosition) {
    super(anchorPosition, COLORS.playerBullet);
  }

  shoot(ticks, direction, isShotgun) {
    if(ticks >= this.nextShoot) {
      if(isShotgun) {
        this.nextShoot = ticks + 3 * this.fireDelay;
        const bullets = [];
        for(let i = 0; i < 5; i++) {
          const deltaAngle = (Math.random() * 2 - 1) * 10;
          bullets.push(new Bullet(this.anchorPosition.x, this.anchorPosition.y, this.color, direction.rotate(deltaAngle), this.bulletSpeed));
        }
        return bullets;
      } else {
        this.nextShoot = ticks + this.fireDelay;
        return [new Bullet(this.anchorPosition.x, this.anchorPosition.y, this.color, direction, this.bulletSpeed)];
      }
    }
    return [];
  }
}

class Bullet extends Entity {
  constructor(x, y, color, heading, speed) {
    super(x, y);
    this.velocity = heading.copy.scale(speed);

    this.color = color;
    this.shape = new CircleShapedSprite(this.position, SIZES.bulletRadius, color);
  }

  _bulletSmokeShrinkAnimation(bulletSmoke, ticks) {
    bulletSmoke.radius = bulletSmoke.originalRadius * (bulletSmoke.endTick - ticks) / (bulletSmoke.endTick - bulletSmoke.spawnTick);
  }

  tick(ticks) {
    gameEngine.spawnEffect(
      EFFECTS.layer.under,
      new CircleEffect(
        this.position.x + (Math.random() - 0.5) * 4,
        this.position.y + (Math.random() - 0.5) * 4,
        this._bulletSmokeShrinkAnimation,
        Math.random() * (SIZES.bulletSmokeRadius.max - SIZES.bulletSmokeRadius.min) + SIZES.bulletSmokeRadius.min,
        "rgba(252, 240, 199, 0.5)"
      ),
      10
    );
  }

  render(context) {
    this.shape.render(context);
  }

  collide(other, collisionPoint) {
    gameEngine.deleteEntity(this);
    gameEngine.spawnEffect(
      EFFECTS.layer.above,
      new CircleEffect(
        this.position.x,
        this.position.y,
        thunk,
        (Math.random() * (SIZES.bulletSmokeRadius.max - SIZES.bulletSmokeRadius.min) + SIZES.bulletSmokeRadius.min) * 1.2,
        "rgba(255, 240, 240, 0.8)"
      ),
      6
    );
    if(other instanceof Enemy) {
      other.hp -= 5;
      other.velocity.add(this.velocity.normalize().scale(WEIGHTS.repulsion.bullet));
    }
  }
}