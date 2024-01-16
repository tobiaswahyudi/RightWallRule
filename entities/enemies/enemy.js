import gameEngine from "../../core/engine.js";
import { EFFECT_LAYERS } from "../../effects/effect.js";
import { Entity } from "../entity.js";

export class Enemy extends Entity {
  constructor(x, y, hp, shadow) {
    super(x, y);
    this.hp = hp;
    this.maxHp = hp;
    this.shadow = shadow;
    this.wave = null;
    this.culled = false;
    this.killed = false;
  }

  onSpawn() {
    gameEngine.spawnEffect(EFFECT_LAYERS.under, this.shadow, -1);
  }

  tick(ticks, player, towers) {
    console.error("this Enemy does not override tick()");
  }

  render(ticks) {
    console.error("this Enemy does not override tick()");
  }

  cull() {
    if(this.culled) return;
    this.culled = true;
    gameEngine.deleteEntity(this);
    gameEngine.deleteEffect(this.shadow);
  }

  uncull() {
    this.culled = false;
    gameEngine.spawnEntity('enemy', this);
    gameEngine.spawnEffect(EFFECT_LAYERS.under, this.shadow);
  }

  die() {
    this.killed = true;
    gameEngine.deleteEntity(this);
    gameEngine.deleteEffect(this.shadow);
    this.wave.remove(this);
  }
}

export class EnemyWave {
  constructor(ticks) {
    this.enemies = [];
    this.lastCulledTick = ticks;
    this.onscreen = false;
  }

  addEnemy(enemy) {
    this.enemies.push(enemy);
    enemy.wave = this;
  }

  get position() {
    return this.enemies[0].position;
  }

  remove(enemy) {
    this.enemies = this.enemies.filter(e => e != enemy);
  }
}