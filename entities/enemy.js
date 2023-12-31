class Enemy extends Entity {
  constructor(x, y, hp) {
    super(x, y);
    this.hp = hp;
    this.maxHp = hp;
  }

  get shouldRemove() {
    return this.hp <= 0;
  }

  tick(ticks, player, towers) {
    console.error("this Enemy does not override tick()");
  }

  render(ticks) {
    console.error("this Enemy does not override tick()");
  }
}

class CrawlerEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 20);

    this.crawlFrequency = 1.2;
    this.crawlTickOffset = Math.random();

    console.log(this.crawlTickOffset)
  }

  tick(ticks, player, towers) {
    this.heading = player.position.delta(this.position).normalize();
    this.velocity = Math.sin((ticks / CONFIG.FPS * this.crawlFrequency + this.crawlTickOffset) * Math.PI);
    this.velocity *= this.velocity;

    this.move();
  }

  render(context) {
    context.fillStyle = COLORS.enemy;

    context.beginPath();
    context.ellipse(
      this.position.x, this.position.y,
      SIZES.enemyRadius, SIZES.enemyRadius,
      0, 0, 360
    );
    context.fill();
  }
}