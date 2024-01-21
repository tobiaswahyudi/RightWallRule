import { OPTIONS, getOption, setOption } from "../core/options.js";
import { createRandomGun, crossbreedGuns } from "../guns/gun.js";
import { Turret } from "../turrets/turret.js";
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
    this.optionsDialog = hideElement(document.getElementById('options'));
    this.controlsDialog = hideElement(document.getElementById('controls'));
    this.openChestDialog = hideElement(document.getElementById('open-chest'));
    this.newGunDialog = hideElement(document.getElementById('new-gun'));
    this.upgradeDialog = hideElement(document.getElementById('upgrade-fertilize'));
    this.upgradeDoneDialog = hideElement(document.getElementById('upgrade-done'));
    this.hybridizeSelect = hideElement(document.getElementById('hybridize-select'));
    this.hybridizeConfirm = hideElement(document.getElementById('hybridize-confirm'));
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
    this.pauseDialog.children[2].onclick = () => this.showOptionsDialog(unpause);
    this.pauseDialog.children[3].onclick = () => this.showControlsDialog();
    this.pauseDialog.children[4].onclick = () => {window.location.reload()};
  }

  showOptionsDialog(unpause) {
    this.state = 'optionsDialog';

    [...this.optionsDialog.children].slice(-1)[0].onclick = () => this.showPauseDialog(unpause);

    // UI SIZE
    const uiSize = this.optionsDialog.children[1].children[1];
    const uiSizeValue = uiSize.children[1];
    uiSizeValue.innerText = getOption(OPTIONS.UI.fontSize);
    const updateUISize = (delta) => () => {
      const currentOption = getOption(OPTIONS.UI.fontSize);
      const sizeVal = currentOption + delta;
      setOption(OPTIONS.UI.fontSize, sizeVal);
      uiSizeValue.innerText = sizeVal;
      document.children[0].style.fontSize = `${sizeVal}px`;
    }
    uiSize.children[0].onclick = updateUISize(-1);
    uiSize.children[2].onclick = updateUISize(+1);
  }

  showControlsDialog() {
    this.state = 'controlsDialog';
    this.controlsDialog.children[2].children[0].onclick = () => {this.state = 'pauseDialog'};
  }

  showChestDialog(inventory, returnFn) {
    const buttons = this.openChestDialog.children[1].children;

    buttons[0].onclick = () => { this.showNewGunDialog(inventory, returnFn) }
    buttons[1].onclick = () => { this.showHybridizeDialog(inventory, returnFn) }
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

    const hasEmptySlots = inventory.guns.some(x => !x);

    inventory.guns.forEach((gun, idx) => {
      const slot = new GunSlotDisplay(gunSlotsCtr, gun, true);
      slot.node.classList.add('hoverable');
      slot.node.onclick = () => {
        if(gun && hasEmptySlots) {
          const ruSure = confirm(`You have empty slots available. Are you sure you want to replace this gun?\nClick OK to confirm and replace ${gun.name}.`);
          if(!ruSure) return;
        }
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

  showHybridizeDialog(inventory, returnFn) {
    const gunSlot = new GunSlotDisplay(document.getElementById('cross-gun-slot'), null, true);
    gunSlot.node.classList.add('hoverable');
    const turretSlot = new TurretSlotDisplay(document.getElementById('cross-turret-slot'), null, true);
    turretSlot.node.classList.add('hoverable');
    const newTurretSlot = new TurretSlotDisplay(document.getElementById('cross-new-slot'), null, true);
    newTurretSlot.node.classList.add('disabled');
    const nextButton = this.hybridizeSelect.children[4].children[0];
    nextButton.classList.add('disabled');
    nextButton.classList.remove('hoverable');

    const selections = [null, null];

    const cleanupAndNext = () => {
      gunSlot.node.remove();
      turretSlot.node.remove();
      newTurretSlot.node.remove();
      if(selectionSubdialog) selectionSubdialog.remove();
      this.showHybridizeConfirmDialog(inventory, selections, returnFn);
    }

    const updateButton = () => {
      if(selections[0] && selections[1]) {
        nextButton.classList.remove('disabled');
        nextButton.classList.add('hoverable');
        nextButton.onclick = () => cleanupAndNext(selections, inventory, returnFn);
        newTurretSlot.node.style.animation = "throb 0.55s ease-in-out infinite alternate-reverse";
        newTurretSlot.node.innerHTML = `<h1 style="color: white; font-family: 'JetBrains Mono', monospace; margin: 0;">???</h1>`;
      }
    }

    let subdialogBackdrop = null;
    let selectionSubdialog = null;
    const openSubdialog = (selectionSlot, isGun) => () => {
      const doc = new DOMParser().parseFromString(`
        <div class="modal-backdrop"></div>
        <div class="hybridize-select-subdialog">
          <div class="dialog-slots-container h-flex" id="this-one"></div>
        </div>
      `, 'text/html');
      const subdialogSlots = doc.getElementById('this-one');

      const slotCtor = isGun ? (...args) => new GunSlotDisplay(...args) : (...args) => new TurretSlotDisplay(...args);
      const inventorySlots = isGun ? inventory.guns : inventory.turrets;
      inventorySlots.forEach(thing => {
        const slot = slotCtor(subdialogSlots, thing, true);
        if(thing) {
          slot.node.classList.add('hoverable');
          slot.node.onclick = () => {
            selections[(isGun ? 0 : 1)] = thing;
            selectionSlot.val = thing;
            updateButton();
            selectionSubdialog.remove();
            subdialogBackdrop.remove();
          }
        } else {
          slot.node.classList.add('disabled');
        }
      });

      subdialogBackdrop = doc.body.children[0];
      selectionSubdialog = doc.body.children[1];

      this.hybridizeSelect.appendChild(subdialogBackdrop);
      this.hybridizeSelect.appendChild(selectionSubdialog);
      selectionSubdialog.style.top = `${selectionSlot.node.offsetTop + selectionSlot.node.scrollHeight - 20}px`;
      selectionSubdialog.style.left = `${selectionSlot.node.offsetLeft + selectionSlot.node.scrollWidth/2 - selectionSubdialog.scrollWidth / 2}px`;
      subdialogBackdrop.onclick = () => {
        selectionSubdialog.remove();
        subdialogBackdrop.remove();
      }
    }

    gunSlot.node.onclick = openSubdialog(gunSlot, true);
    turretSlot.node.onclick = openSubdialog(turretSlot, false);
    this.state = 'hybridizeSelect';
  }

  showHybridizeConfirmDialog(inventory, selections, returnFn) {
    const parentGun = selections[0];
    const parentTurret = selections[1];
    const newTurret = new Turret(crossbreedGuns(parentGun, parentTurret.gun), parentTurret.stats);


    const newTurretCtr = document.getElementById('the-new-turret');
    
    const parentGunSlot = new GunSlotDisplay(newTurretCtr, parentGun, true);
    newTurretCtr.innerHTML += `<h1 style="display: inline; margin: 0 1rem 0 0;">⇒</h1>`;
    const newTurretSlot = new TurretSlotDisplay(newTurretCtr, newTurret, true);
    newTurretCtr.innerHTML += `<h1 style="display: inline; margin: 0 1rem 0 0;">⇐</h1>`;
    const parentTurretSlot = new TurretSlotDisplay(newTurretCtr, parentTurret, true);
    
    newTurretCtr.children[0].style.fontSize = "0.8rem";
    newTurretCtr.children[4].style.fontSize = "0.8rem";

    const turretSlotsCtr = document.getElementById('replace-turret-slots');

    const cleanupAndClose = () => {
      [...newTurretCtr.children].forEach(c => c.remove());
      [...turretSlotsCtr.children].forEach(c => c.remove());
      this.state = null;
      returnFn();
    }

    const hasEmptySlots = inventory.turrets.some(x => !x);

    inventory.turrets.forEach((turret, idx) => {
      const slot = new TurretSlotDisplay(turretSlotsCtr, turret, true);
      slot.node.classList.add('hoverable');
      slot.node.onclick = () => {
        if(turret && hasEmptySlots) {
          const ruSure = confirm(`You have empty slots available. Are you sure you want to replace this turret?\nClick OK to confirm and replace ${turret.gun.name}.`);
          if(!ruSure) return;
        }
        inventory.replaceTurret(newTurret, idx);
        cleanupAndClose();
      }
    })

    const discardBtn = document.getElementById('discard-new-turret');
    discardBtn.onclick = cleanupAndClose;

    this.state = 'hybridizeConfirm';
  }
}