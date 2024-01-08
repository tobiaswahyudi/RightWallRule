import { UIElement } from "./element.js";

export class UIImage extends UIElement {
  constructor(x, y, img) {
    super(x,y);
    this.img = img;
  }

  render(context) {
    context.drawImage(this.img, this.x, this.y);
  }
}