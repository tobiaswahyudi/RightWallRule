export class UIManager {
  constructor() {
    this.window = null;
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