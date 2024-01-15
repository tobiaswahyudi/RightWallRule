import { Entity } from "../entity.js";

export class Enemy extends Entity {
  constructor(x, y, hp) {
    super(x, y);
    this.hp = hp;
    this.maxHp = hp;
    this.wave = null;
  }

  get shouldRemove() {
    return this.hp <= 0;
  }

  designateAsSentinel(sentinelAction) {
    this.sentinelAction = sentinelAction;
  }

  tick(ticks, player, towers) {
    console.error("this Enemy does not override tick()");
  }

  render(ticks) {
    console.error("this Enemy does not override tick()");
  }
}

export class EnemyWave {
  constructor(enemies, ticks) {
    this.enemies = enemies;
    enemies.forEach(enemy => enemy.wave = this);
    this.lastCulledTick = ticks;
    this.onscreen = false;
  }

  get position() {
    return this.enemies[0].position;
  }

  remove(enemy) {
    this.enemies = this.enemies.filter(e => e != enemy);
  }
}