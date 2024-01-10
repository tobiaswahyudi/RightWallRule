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

  cycleGuns() {
    let slotIdx = 1;
    while(slotIdx < this.guns.length && !this.guns[slotIdx]) slotIdx++;
    if(slotIdx == this.guns.length) return;

    const cycle = this.guns.splice(0, slotIdx);
    this.guns = this.guns.concat(cycle);

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