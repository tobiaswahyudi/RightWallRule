import { createRandomGun } from "../guns/gun.js";
import { GunSlotDisplay, TurretSlotDisplay } from "./slotDisplay.js";

export class UIManager {
  constructor() {
    this._state = null;
    this.backdrop = document.getElementById('modal-backdrop');
    this.pauseDialog = document.getElementById('pause-game');
    this.openChestDialog = document.getElementById('open-chest');
    this.newGunDialog = document.getElementById('new-gun');
    this.upgradeDialog = document.getElementById('upgrade-fertilize');
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
    buttons[1].onclick = () => { this.showUpgradeDialog(inventory, returnFn) }
    this.state = 'openChestDialog';
  }

  showNewGunDialog(inventory, returnFn) {
    const newGun = createRandomGun();

    const newGunCtr = document.getElementById('the-new-gun');
    const newGunSlot = new GunSlotDisplay(newGunCtr, newGun, true);
    
    const gunSlotsCtr = document.getElementById('replace-gun-slots');

    const cleanupAndClose = () => {
      newGunSlot.node.remove();
      [...gunSlotsCtr.children].forEach(c => c.remove());
      this.state = null;
      returnFn();
    }

    inventory.guns.forEach((gun, idx) => {
      const slot = new GunSlotDisplay(gunSlotsCtr, gun, true);
      slot.node.classList.add('hoverable');
      slot.node.onclick = () => {
        inventory.replaceGun(newGun, idx);
        cleanupAndClose();
      }
    })

    const discardBtn = document.getElementById('discard-new-gun');
    discardBtn.onclick = cleanupAndClose;

    this.state = 'newGunDialog';
  }

  showUpgradeDialog(inventory, returnFn) {
    const gunSlotsCtr = document.getElementById('upgrade-gun-slots');
    const turretSlotsCtr = document.getElementById('upgrade-turret-slots');

    const cleanupAndClose = () => {
      [...gunSlotsCtr.children].forEach(c => c.remove());
      [...turretSlotsCtr.children].forEach(c => c.remove());
      this.state = null;
      returnFn();
    }

    inventory.guns.forEach(gun => {
      const slot = new GunSlotDisplay(gunSlotsCtr, gun, true);
      slot.node.classList.add('hoverable');
      slot.node.onclick = () => {
        // Upgrade
        cleanupAndClose();
      }
    })

    inventory.turrets.forEach(turret => {
      const slot = new TurretSlotDisplay(turretSlotsCtr, turret, true);
      slot.node.classList.add('hoverable');
      slot.node.onclick = () => {
        // Upgrade
        cleanupAndClose();
      }
    })

    this.state = 'upgradeDialog';
  }
}