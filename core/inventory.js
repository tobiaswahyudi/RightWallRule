// Dead simple
export class InventoryManager {
  constructor() {
    this.guns = [null, null, null];
    this.turrets = [null, null];
    this.gunIndex = 0;
  }

  replaceGun(gun, slotIdx) {
    this.guns[slotIdx] = gun;
  }

  replaceTurret(turret, slotIdx) {
    this.turrets[slotIdx] = turret;
  }

  get selectedGun() {
    return this.guns[this.gunIndex];
  }
}