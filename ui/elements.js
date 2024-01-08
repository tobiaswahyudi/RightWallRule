export function SVGRoundedRectangle(xStart, xEnd, yStart, yEnd, cornerRadius) {
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
const LINE_SPACING = 1.2;

export class UITextBox {
  constructor(x, y, text, fontSize, color) {
    this.x = x;
    this.y = y;
    this.text = text.split('\n');
    this.fontSize = fontSize;
    this.color = color;
  }

  updateHover() {}

  render(context) {
    const deltaY = (this.text.length - 1) * (LINE_SPACING * this.fontSize / 2) - (1/3 * this.fontSize);

    context.textAlign = "center";
    context.font = `${this.fontSize}px Arial`;
    context.fillStyle = this.color;
    this.text.forEach((line, rowIdx) => context.fillText(line, this.x, this.y - deltaY + (rowIdx * this.fontSize * LINE_SPACING)));
  }

  translate(x, y) {
    this.x += x;
    this.y += y;
  }

  get height() {
    return (this.text.length - 1) * (LINE_SPACING * this.fontSize / 2) + this.fontSize;
  }
}

export class UIRoundedRectangle {
  constructor(xStart, xEnd, yStart, yEnd, cornerRadius, fill, stroke, lineWidth, textbox, onClick) {
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
    this.hovered = (xStart < cursorLocation.x && cursorLocation.x < xEnd) && (yStart < cursorLocation.y && cursorLocation.y < yEnd);
    return this.hovered;
  }
  
  render(context) {
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.stroke;
    context.fillStyle = this.fill;

    context.fill(this.path);
    context.stroke(this.path);

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