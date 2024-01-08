import { UIScreen } from "./screen.js";
import { UIRoundedRectangle, UITextBox } from "../elements.js";

const BUTTON_BACKGROUND_COLOR = "#A9E5BB";
const BUTTON_BORDER_COLOR = "#133F20";

const TEXT_COLOR = "#11292C";

export class ChestScreen extends UIScreen {
  constructor() {
    const children = [
      36,
      new UITextBox(0, 0, "A box full of magical\npotting supplies!", 60, TEXT_COLOR),
      40,
      new UIRoundedRectangle(-360, -140, 0, 300, 10, BUTTON_BACKGROUND_COLOR, BUTTON_BORDER_COLOR, 6, new UITextBox(0, -100, "Cultivate\nnew gun", 30, TEXT_COLOR), () => alert("gun!")),
      -300,
      new UIRoundedRectangle(-120, 120, 0, 300, 10, BUTTON_BACKGROUND_COLOR, BUTTON_BORDER_COLOR, 6, new UITextBox(0, -100, "Fertilize\ngun or turret", 30, TEXT_COLOR), () => alert("fertilize!")),
      -300,
      new UIRoundedRectangle(140, 360, 0, 300, 10, BUTTON_BACKGROUND_COLOR, BUTTON_BORDER_COLOR, 6, new UITextBox(0, -100, "Crossbreed\nnew turret", 30, TEXT_COLOR), () => alert("turret!"))
    ]
    super(800, 630, children);
  }
}