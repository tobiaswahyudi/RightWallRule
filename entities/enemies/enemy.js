import { Entity } from "../entity.js";

export class Enemy extends Entity {
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
