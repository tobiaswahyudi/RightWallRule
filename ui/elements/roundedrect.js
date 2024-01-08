import { UIElement } from "./element.js";

function SVGRoundedRectangle(xStart, xEnd, yStart, yEnd, cornerRadius) {
  return `
    M ${xStart}, ${yStart + cornerRadius}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${xStart + cornerRadius}, ${yStart}
    L ${xEnd - cornerRadius}, ${yStart}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${xEnd}, ${yStart + cornerRadius}
    L ${xEnd}, ${yEnd  - cornerRadius}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${xEnd - cornerRadius}, ${yEnd}
    L ${xStart + cornerRadius}, ${yEnd}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${xStart}, ${yEnd - cornerRadius}
    Z
  `;
}

const HOVER_SIZE_OFFSET = 10;

export class UIRoundedRectangle extends UIElement{
  constructor(xStart, xEnd, yStart, yEnd, cornerRadius, fill, stroke, lineWidth, textbox, onClick) {
    super(0, 0);
    this.xStart = xStart;
    this.xEnd = xEnd;
    this.yStart = yStart;
    this.yEnd = yEnd;
    this.cornerRadius = cornerRadius;
    this.generatePaths();

    this.fill = fill;
    this.stroke = stroke;
    this.lineWidth = lineWidth;
    this.onClick = onClick;
    this.hovered =  false;
    if(textbox) textbox.translate((xStart + xEnd) / 2, (yStart + yEnd) / 2);
    this.textbox = textbox;
  }

  generatePaths() {
    this.path = new Path2D(SVGRoundedRectangle(this.xStart, this.xEnd, this.yStart, this.yEnd, this.cornerRadius));
    this.hoverPath = new Path2D(SVGRoundedRectangle(this.xStart - HOVER_SIZE_OFFSET, this.xEnd + HOVER_SIZE_OFFSET, this.yStart - HOVER_SIZE_OFFSET, this.yEnd + HOVER_SIZE_OFFSET, this.cornerRadius));
  }

  updateHover(cursorLocation) {
    // TODO: keyboard input selection
    if(this.hovered) {
      this.hovered = (this.xStart - HOVER_SIZE_OFFSET < cursorLocation.x && cursorLocation.x - HOVER_SIZE_OFFSET < this.xEnd) && (this.yStart - HOVER_SIZE_OFFSET < cursorLocation.y && cursorLocation.y - HOVER_SIZE_OFFSET < this.yEnd);
    } else {
      this.hovered = (this.xStart < cursorLocation.x && cursorLocation.x < this.xEnd) && (this.yStart < cursorLocation.y && cursorLocation.y < this.yEnd);
    }
    return this.hovered;
  }
  
  render(context) {
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.stroke;
    context.fillStyle = this.fill;

    if(this.hovered) {
      context.fill(this.hoverPath);
      context.stroke(this.hoverPath);
    } else {
      context.fill(this.path);
      context.stroke(this.path);
    }

    if(this.textbox) this.textbox.render(context);
  }

  translate(x, y) {
    this.xStart += x;
    this.xEnd += x;
    this.yStart += y;
    this.yEnd += y;
    this.generatePaths();
    if(this.textbox) this.textbox.translate(x, y);
  }

  get height() {
    return this.yEnd - this.yStart;
  }
}