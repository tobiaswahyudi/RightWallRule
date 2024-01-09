import { UIRoundedRectangle } from "./elements/roundedrect.js";
import { UITextBox } from "./elements/textbox.js";
import { UIImage } from "./elements/image.js";

const AVATAR_BACKGROUND = "#00000066";
const AVATAR_STROKE = "#ffffff";

const GUN_SLOT_BACKGROUND = "#00000044";
const GUN_SLOT_STROKE = "#ffffff";

const TURRET_SLOT_BACKGROUND = "#00000044";
const TURRET_SLOT_STROKE = "#ffffff";

const HP_OUTER = "#ffffff";
const HP_INNER = "#E55052";

class GunSlot {
  constructor(rect, gun) {
    this.rect = rect;
    this.gun = gun;
    this.lines = new Path2D(`M ${rect.xStart + 50}, ${rect.yStart} l 0, 80`);
    this.gunName = new UITextBox(rect.xStart + 60, rect.yStart + 15, gun.name, 16, "#FFFFFF", "left");
  }

  render(context) {
    this.rect.render(context);
    if(this.gun) {
      context.stroke(this.lines);
      this.gunName.render(context);
    }
  }
}
export class HUD {
  constructor(inventory) {
    this.inventory = inventory;
    this.avatar = new UIRoundedRectangle(10, 130, 10, 130, 20, AVATAR_BACKGROUND, AVATAR_STROKE, 2, new UITextBox(0, 5, "ඞ", 100, "#DDDDDD"));
    this.gunSlots = Array(inventory.gunCapacity).fill(0).map((z, idx) => new UIRoundedRectangle(
      150 + idx * 170, 150 + 160 + idx * 170, 50, 130, 5, GUN_SLOT_BACKGROUND, GUN_SLOT_STROKE, 2
    ));
    this.turretSlots = Array(inventory.turretCapacity).fill(0).map((z, idx) => new UIRoundedRectangle(
      10, 210, 170 + idx * 130, 170 + 120 + idx * 130, 5, TURRET_SLOT_BACKGROUND, TURRET_SLOT_STROKE, 2
    ));
    this.turretLabel = new UITextBox(54, 155, "TURRETS", 20, "#FFFFFF");
    this.hpOuter = new UIRoundedRectangle(150, 660, 10, 40, 5, "#00000044", HP_OUTER, 2);
    this.hpInner = new UIRoundedRectangle(150+1, 660-1, 10+1, 40-1, 5-1, HP_INNER, "#00000000", 0);

    this.update();
  }

  update() {
    this.inventory.guns.forEach((gun, idx) => {
      this.gunSlots[idx] = new GunSlot(this.gunSlots[idx], gun);
    })
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