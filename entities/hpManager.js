export class HPManager {
  constructor(maxHp, regenTickDelay, regenSpeed) {
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.regenTickDelay = regenTickDelay;
    this.regenSpeed = regenSpeed;

    this.lastHitTick = 0;
  }

  takeDmg(dmg, ticks) {
    this.lastHitTick = ticks;
    this.hp -= dmg;
  }

  tick(ticks) {
    if(ticks >= this.lastHitTick + this.regenTickDelay) {
      this.hp = Math.min(this.regenSpeed + this.hp, this.maxHp);
    }
  }

  get percentage() {
    return this.hp / this.maxHp * 100;
  }
}