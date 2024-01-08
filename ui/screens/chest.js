import { UIScreen } from "./screen.js";
import { UIRoundedRectangle } from "../elements/roundedrect.js";
import { UITextBox } from "../elements/textbox.js";
import { UIImage } from "../elements/image.js";

const BUTTON_BACKGROUND_COLOR = "#A9E5BB";
const BUTTON_BORDER_COLOR = "#133F20";

const TEXT_COLOR = "#11292C";

const NEW_GUN_IMAGE = new Image();
NEW_GUN_IMAGE.src = "./img/newgun.png";
const UPGRADE_IMAGE = new Image();
UPGRADE_IMAGE.src = "./img/upgrade.png";
const NEW_TURRET_IMAGE = new Image();
NEW_TURRET_IMAGE.src = "./img/newturret.png";

export class ChestScreen extends UIScreen {
  constructor() {
    const children = [
      40,
      72,
      new UITextBox(0, 0, "A box full of\nmagical potting supplies!", 60, TEXT_COLOR),
      40,
      new UIRoundedRectangle(-380, -140, 0, 300, 10, BUTTON_BACKGROUND_COLOR, BUTTON_BORDER_COLOR, 6, new UITextBox(0, -100, "Cultivate\nnew gun", 30, TEXT_COLOR), () => alert("gun!")),
      -300,
      new UIImage(-340, 110, NEW_GUN_IMAGE),
      new UIRoundedRectangle(-120, 120, 0, 300, 10, BUTTON_BACKGROUND_COLOR, BUTTON_BORDER_COLOR, 6, new UITextBox(0, -100, "Fertilize\ngun or turret", 30, TEXT_COLOR), () => alert("fertilize!")),
      -300,
      new UIImage(-80, 110, UPGRADE_IMAGE),
      new UIRoundedRectangle(140, 380, 0, 300, 10, BUTTON_BACKGROUND_COLOR, BUTTON_BORDER_COLOR, 6, new UITextBox(0, -100, "Crossbreed\nnew turret", 30, TEXT_COLOR), () => alert("turret!")),
      -300,
      new UIImage(180, 110, NEW_TURRET_IMAGE),

    ]
    super(880, 560, children);
  }
}