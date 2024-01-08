import { UIRoundedRectangle } from "../elements.js";

const WINDOW_BACKGROUND_COLOR = "#A9E5BB";
const WINDOW_BORDER_COLOR = "#133F20";
const WINDOW_BORDER_WIDTH = 8;
const WINDOW_CORNER_RADIUS = 20;

const WINDOW_PADDING = 120;

export class UIScreen {
  constructor(width, height, childElements) {
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    this.window = new UIRoundedRectangle(
      screenCenterX - width/2, screenCenterX + width/2,
      screenCenterY - height/2, screenCenterY + height/2,
      WINDOW_CORNER_RADIUS,
      WINDOW_BACKGROUND_COLOR,
      WINDOW_BORDER_COLOR,
      WINDOW_BORDER_WIDTH
    );
    let accumulatedY = screenCenterY - height / 2 + WINDOW_PADDING;
    childElements.forEach(el => {
      if(typeof el === "number") {
        accumulatedY += el;
      } else {
        el.translate(screenCenterX, accumulatedY);
        accumulatedY += el.height;
      }
    });
    this.elements = childElements.filter(el => (typeof el === 'object'));
  }

  render(context) {
    this.window.render(context);
    this.elements.forEach(el => el.render(context));
  }

  tick(mousePosition) {
    this.elements.forEach(el => el.updateHover(mousePosition));
  }

  click(mousePosition) {
    const clickedMaybe = this.elements.find(el => el.updateHover(mousePosition));
    if(clickedMaybe) clickedMaybe.onClick();
  }
}