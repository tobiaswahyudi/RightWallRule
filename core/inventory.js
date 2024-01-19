export class InventoryManager {
  constructor() {
    this.guns = [null, null, null];
    this.turrets = [null, null];
    this.gunIndex = 0;

    this.xp = 0;
    this.levelUpXp = 10;

    this.hud = null;
  }

  replaceGun(gun, slotIdx) {
    this.guns[slotIdx] = gun;
    if(this.hud) this.hud.updateSlots();
  }

  cycleGuns() {
    let slotIdx = 1;
    while(slotIdx < this.guns.length && !this.guns[slotIdx]) slotIdx++;
    if(slotIdx == this.guns.length) return;

    const cycle = this.guns.splice(0, slotIdx);
    this.guns = this.guns.concat(cycle);

    if(this.hud) this.hud.updateSlots();
  }

  replaceTurret(turret, slotIdx) {
    this.turrets[slotIdx] = turret;
    if(this.hud) this.hud.updateSlots();
  }

  get selectedGun() {
    return this.guns[this.gunIndex];
  }

  levelUpCheck() {
    return this.levelUpXp <= this.xp;
  }

  levelUp() {
    this.xp = 0;
    this.levelUpXp = Math.round(this.levelUpXp * 1.4);
  }

  get xpPercentage() {
    return this.xp / this.levelUpXp * 100;
  }
}