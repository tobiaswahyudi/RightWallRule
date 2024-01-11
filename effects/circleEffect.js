import { Effect } from "./effect.js";

export class CircleEffect extends Effect {
  constructor(x, y, animation, radius, color) {
    super(x, y, animation);
    this.originalRadius = radius;
    this.radius = radius;
    this.color = color;
  }

  render(context) {
    context.fillStyle = this.color;

    context.beginPath();
    context.ellipse(
      this.position.x, this.position.y,
      this.radius, this.radius,
      0, 0, 360
    );
    context.fill();
  }
}