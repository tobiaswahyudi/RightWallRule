import { Effect } from "./effect.js";

export class RectEffect extends Effect {
  constructor(xStart, xEnd, yStart, yEnd, animation, color) {
    super((xStart + xEnd)/2, (yStart + yEnd) / 2, animation);
    this.xStart = xStart;
    this.xEnd = xEnd;
    this.yStart = yStart;
    this.yEnd = yEnd;
    this.color = color;
  }

  render(context) {
    context.fillStyle = this.color;

    context.fillRect(
      this.xStart,
      this.yStart,
      this.xEnd - this.xStart,
      this.yEnd - this.yStart
    );
  }
}