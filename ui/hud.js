import { GunSlotDisplay, TurretSlotDisplay } from "./slotDisplay.js";

export class HUD {
  constructor(inventory) {
    this.inventory = inventory;
    this.avatar = document.getElementById('avatar');
    this.gunsContainer = document.getElementById('guns-container');
    this.turretsContainer = document.getElementById('turrets-container');
    this.hpbar = document.getElementById('hpbar-inner');

    this.gunSlots = this.inventory.guns.map(gun => new GunSlotDisplay(this.gunsContainer, gun, false));
    this.turretSlots = this.inventory.turrets.map((turret, idx) => new TurretSlotDisplay(this.turretsContainer, turret, idx, false));

    this.update();
  }

  update() {
    this.gunSlots.forEach((slot, idx) => {
      slot.gun = this.inventory.guns[idx];
    });

    this.turretSlots.forEach((slot, idx) => {
      if(this.inventory.turrets[idx]) {
        slot.turret = this.inventory.turrets[idx];
      }
    })
  }

  set hp(val) {
    this.hpbar.style.width = `${val}%`;
  }
}