import { Effect } from "./effect.js";

export class AbstractEffect extends Effect {
  constructor(x, y, shapeConstructor, animation, fill, stroke, strokeWidth) {
    super(x, y, animation);
    this.fill = fill;
    this.stroke = stroke;
    this.shapeConstructor = shapeConstructor;
    this.strokeWidth = strokeWidth;
  }

  render(context) {
    if(this.fill) {
      context.fillStyle = this.fill;
      context.fill(this.shapeConstructor(this));
    }
    if(this.stroke) {
      context.lineWidth = this.strokeWidth;
      context.strokeStyle = this.stroke;
      context.stroke(this.shapeConstructor(this));
    }
  }
}