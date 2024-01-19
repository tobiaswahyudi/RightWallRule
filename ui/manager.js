import { createRandomGun } from "../guns/gun.js";
import { GunSlotDisplay, TurretSlotDisplay } from "./slotDisplay.js";

function hideElement(element) {
  element.classList.add('hidden');
  return element;
}

export class UIManager {
  constructor() {
    this._state = null;
    this.backdrop = hideElement(document.getElementById('modal-backdrop'));
    this.gameOver = hideElement(document.getElementById('ded'));
    this.pauseDialog = hideElement(document.getElementById('pause-game'));
    this.controlsDialog = hideElement(document.getElementById('controls'));
    this.openChestDialog = hideElement(document.getElementById('open-chest'));
    this.newGunDialog = hideElement(document.getElementById('new-gun'));
    this.upgradeDialog = hideElement(document.getElementById('upgrade-fertilize'));
    this.upgradeDoneDialog = hideElement(document.getElementById('upgrade-done'));
  }

  set state(val) {
    if(this._state) {
      this[this._state].classList.add('hidden');
      this.backdrop.classList.add('hidden');
    }
    this._state = val;
    if(val) {
      this.backdrop.classList.remove('hidden');
      this[this._state].classList.remove('hidden');
    }
  }

  closeDialog() {
    this.state = null;
  }

  showGameOver() {
    this.state = 'gameOver';
    this.gameOver.children[1].onclick = () => {window.location.reload()};
    this.gameOver.children[2].onclick = () => {window.close()};
  }

  showPauseDialog(unpause) {
    this.state = 'pauseDialog';
    this.pauseDialog.children[1].onclick = unpause;
    this.pauseDialog.children[3].onclick = () => this.showControlsDialog();
    this.pauseDialog.children[4].onclick = () => {window.location.reload()};
  }

  showControlsDialog() {
    this.state = 'controlsDialog';
    this.controlsDialog.children[2].children[0].onclick = () => {this.state = 'pauseDialog'};
  }

  showChestDialog(inventory, returnFn) {
    const buttons = this.openChestDialog.children[1].children;

    buttons[0].onclick = () => { this.showNewGunDialog(inventory, returnFn) }
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

    const cleanupAndNext = (thing, isGun) => {
      [...gunSlotsCtr.children].forEach(c => c.remove());
      [...turretSlotsCtr.children].forEach(c => c.remove());
      this.showUpgradeDoneDialog(inventory, thing, isGun, returnFn)
    }

    inventory.guns.forEach(gun => {
      const slot = new GunSlotDisplay(gunSlotsCtr, gun, true);
      if(gun) {
        slot.node.classList.add('hoverable');
        slot.node.onclick = () => {
          // Upgrade
          cleanupAndNext(gun, true);
        }
      } else {
        slot.node.classList.add('disabled');
      }
    })

    inventory.turrets.forEach(turret => {
      const slot = new TurretSlotDisplay(turretSlotsCtr, turret, true);
      if(turret) {
        slot.node.classList.add('hoverable');
        slot.node.onclick = () => {
          // Upgrade
          cleanupAndNext(turret, false);
        }
      } else {
        slot.node.classList.add('disabled');
      }
    })

    this.state = 'upgradeDialog';
  }

  showUpgradeDoneDialog(inventory, thing, isGun, returnFn) {
    const container = document.getElementById('upgrade-done-slots');
    const theArrow = container.firstElementChild;
    const old = thing.copy;
    if(isGun) {
      new GunSlotDisplay(container, old, true);
    } else {
      new TurretSlotDisplay(container, old, true);
    }
    container.appendChild(theArrow);
    if(isGun) {
      thing.stats.upgrade(30, 2);
      new GunSlotDisplay(container, thing, true);
    } else {
      thing.gun.stats.upgrade(30, 2);
      new TurretSlotDisplay(container, thing, true);
    }

    const closeBtn = document.getElementById('close-upgrade-dialog');
    closeBtn.onclick = () => {
      [...container.children].forEach(c => c.remove());
      container.appendChild(theArrow);
      this.state = null;
      returnFn();
      inventory.hud.updateSlots();
    };

    this.state = 'upgradeDoneDialog';
  }
}