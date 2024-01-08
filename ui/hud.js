import { UIRoundedRectangle } from "./elements/roundedrect.js";
import { UITextBox } from "./elements/textbox.js";
import { UIImage } from "./elements/image.js";

const AVATAR_BACKGROUND = "#00000066";
const AVATAR_STROKE = "#223311";

const GUN_SLOT_BACKGROUND = "#00000044";
const GUN_SLOT_STROKE = "#223311";

const TURRET_SLOT_BACKGROUND = "#00000044";
const TURRET_SLOT_STROKE = "#223311";

const HP_OUTER = "#112200AA";
const HP_INNER = "#E55052";

export class HUD {
  constructor(inventory) {
    this.inventory = inventory;
    this.avatar = new UIRoundedRectangle(10, 130, 10, 130, 20, AVATAR_BACKGROUND, AVATAR_STROKE, 4, new UITextBox(0, 5, "ඞ", 100, "#DDDDDD"));
    this.gunSlots = Array(inventory.gunCapacity).fill(0).map((z, idx) => new UIRoundedRectangle(
      150 + idx * 170, 150 + 160 + idx * 170, 50, 130, 10, GUN_SLOT_BACKGROUND, GUN_SLOT_STROKE, 4
    ));
    this.turretSlots = Array(inventory.turretCapacity).fill(0).map((z, idx) => new UIRoundedRectangle(
      10, 210, 170 + idx * 130, 170 + 120 + idx * 130, 10, TURRET_SLOT_BACKGROUND, TURRET_SLOT_STROKE, 4
    ));
    this.turretLabel = new UITextBox(54, 155, "TURRETS", 20, TURRET_SLOT_STROKE);
    this.hpOuter = new UIRoundedRectangle(150, 660, 10, 40, 10, HP_OUTER, "#00000000", 0);
    this.hpInner = new UIRoundedRectangle(155, 655, 15, 35, 5, HP_INNER, "#00000000", 0);
  }

  render(context) {
    this.avatar.render(context);
    this.hpOuter.render(context);
    this.hpInner.render(context);
    this.gunSlots.forEach(slot => slot.render(context));
    this.turretSlots.forEach(slot => slot.render(context));
    this.turretLabel.render(context);
  }
}