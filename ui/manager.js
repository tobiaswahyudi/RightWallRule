import { GunSlot } from "./hud.js";
import { Gun, GunStats } from "../guns/gun.js";
import { SPEEDS } from "../config.js";

export class UIManager {
  constructor() {
    this._state = null;
    this.backdrop = document.getElementById('modal-backdrop');
    this.pauseDialog = document.getElementById('pause-game');
    this.openChestDialog = document.getElementById('open-chest');
    this.newGunDialog = document.getElementById('new-gun');
  }

  set state(val) {
    if(this._state) {
      this[this._state].style.display = "none";
      this.backdrop.style.display = "none";
    }
    this._state = val;
    if(val) {
      this.backdrop.style.display = "block";
      this[this._state].style.display = "block";
    }
  }

  closeDialog() {
    this.state = null;
  }

  showPauseDialog(unpause) {
    this.state = 'pauseDialog';
    this.pauseDialog.children[1].onclick = unpause;
    this.pauseDialog.children[4].onclick = () => {window.location.reload()};
  }

  showChestDialog(inventory, returnFn) {
    const buttons = this.openChestDialog.children[1].children;

    buttons[0].onclick = () => { this.showNewGunDialog(inventory, returnFn) }
    this.state = 'openChestDialog';
  }

  showNewGunDialog(inventory, returnFn) {
    const DEBUGING_PURPOSES_NEW_GUN = new Gun("Stinky Beaner", "./img/guns/peashooter.png", "#EEFF00", new GunStats(8, 1, SPEEDS.bullet, 2, 5));

    const newGunCtr = document.getElementById('the-new-gun');
    const newGunSlot = new GunSlot(newGunCtr, DEBUGING_PURPOSES_NEW_GUN);
    
    const gunSlotsCtr = document.getElementById('replace-gun-slots');

    const cleanup = () => {
      newGunSlot.node.remove();
      [...gunSlotsCtr.children].forEach(c => c.remove());
    }

    inventory.guns.forEach((gun, idx) => {
      const slot = new GunSlot(gunSlotsCtr, gun);
      slot.node.classList.add('hoverable');
      slot.node.onclick = () => {
        inventory.replaceGun(DEBUGING_PURPOSES_NEW_GUN, idx);
        this.state = null;
        cleanup();
        returnFn();
      }
    })

    this.state = 'newGunDialog';
  }
}