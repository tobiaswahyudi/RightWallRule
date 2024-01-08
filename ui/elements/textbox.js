import { UIElement } from "./element.js";

const LINE_SPACING = 1.2;

export class UITextBox extends UIElement{
  constructor(x, y, text, fontSize, color) {
    super(x,y);
    this.text = text.split('\n');
    this.fontSize = fontSize;
    this.color = color;
  }

  render(context) {
    const deltaY = (this.text.length - 1) * (LINE_SPACING * this.fontSize / 2) - (LINE_SPACING / 4 * this.fontSize);

    context.textAlign = "center";
    context.font = `${this.fontSize}px Zilla Slab`;
    context.fillStyle = this.color;
    this.text.forEach((line, rowIdx) => context.fillText(line, this.x, this.y - deltaY + (rowIdx * this.fontSize * LINE_SPACING)));
  }

  get height() {
    return this.text.length * LINE_SPACING * this.fontSize / 2;
  }
}