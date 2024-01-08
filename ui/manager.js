import { ChestScreen } from "./screens/chest.js";

export class UIManager {
  constructor() {
    this.window = new ChestScreen();
  }

  render(context) {
    this.window.render(context);
  }

  tick(mousePosition) {
    this.window.tick(mousePosition);
  }

  click(mousePosition) {
    this.window.click(mousePosition);
  }
}