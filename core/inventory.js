// Dead simple
export class InventoryManager {
  constructor() {
    this.guns = [null, null, null];
    this.turrets = [null, null];
    this.gunIndex = 0;

    this.hud = null;
  }

  replaceGun(gun, slotIdx) {
    this.guns[slotIdx] = gun;
    if(this.hud) this.hud.update();
  }

  replaceTurret(turret, slotIdx) {
    this.turrets[slotIdx] = turret;
    if(this.hud) this.hud.update();
  }

  get selectedGun() {
    return this.guns[this.gunIndex];
  }
}