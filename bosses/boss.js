import { Entity } from "../entities/entity.js";
import { HPManager } from "../entities/hpManager.js";
import { BossHpBar } from "../ui/bossbar.js";

export class Boss extends Entity {
  constructor(x, y, hp, name) {
    super(x, y);
    this.hp = new HPManager(hp, 3600, 0);
    this.name = name;
    this.hpbar = new BossHpBar(this);
  }

  tick(ticks, player, towers) {
    console.error("this Boss does not override tick()");
  }

  render(ticks) {
    console.error("this Boss does not override tick()");
  }

  die() {
    console.error("this Boss does not override die()");
  }
}