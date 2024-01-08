import { Vector2 } from "../utils/vector2.js";

export class Entity {
  constructor(x, y) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0,0);
  }

  move() {
    this.position.add(this.velocity);
  }

  repelFrom(point, weight) {
    this.velocity.add(this.position.delta(point).normalize().scale(weight));
  }

  get rotation() {
    if(this.velocity.x == 0 && this.velocity.y == 0) return 0;
    return Math.atan(this.velocity.y / this.velocity.x);
  }
}
