class GunSlot {
  constructor(container) {
    this._gun = null;
    this.node = document.createElement('div');
    this.node.classList.add('gun-slot');

    container.appendChild(this.node);
  }

  set gun(val) {
    this._gun = val;
  }

  update() {
  }
}

class TurretSlot {
  constructor(container) {
    this._turret = null;
    this.node = document.createElement('div');
    this.node.classList.add('turret-slot');

    container.appendChild(this.node);
  }

  set turret(val) {
    this._turret = val;
  }

  update() {
  }
}

export class HUD {
  constructor(inventory) {
    this.inventory = inventory;
    this.avatar = document.getElementById('avatar');
    this.gunsContainer = document.getElementById('guns-container');
    this.turretsContainer = document.getElementById('turrets-container');
    this.hpbar = document.getElementById('hpbar-inner');

    this.gunSlots = Array(this.inventory.gunCapacity).fill(0).map(zero => new GunSlot(this.gunsContainer));
    this.turretSlots = Array(this.inventory.turretCapacity).fill(0).map(zero => new TurretSlot(this.turretsContainer));

    this.update();
  }

  update() {
    this.gunSlots.forEach((slot, idx) => {
      slot.gun = this.inventory.guns[idx];
      slot.update();
    })
  }
}