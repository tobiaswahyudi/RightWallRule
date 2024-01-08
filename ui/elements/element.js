export class UIElement {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }

  updateHover(cursorLocation) {}
  
  render(context) {}

  translate(x, y) {
    this.x += x;
    this.y += y;
  }

  get height() { return 0; }
}