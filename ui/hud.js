class GunSlot {
  constructor(container) {
    this._gun = null;
    this.node = document.createElement('div');
    this.node.classList.add('gun-slot');
    this.node.classList.add('h-flex');

    container.appendChild(this.node);
  }

  createElements() {
    const slotDoc = new DOMParser().parseFromString(`
      <img class="gun-img">
      <div class="v-flex gun-info">
        <h5 class="gun-stat"></h5>
        <div class="gun-stats">
          <img class="stat-img" src="./img/stats/quantity.png">
          <img class="stat-img stat-img-col2" src="./img/stats/firerate.png">
          <span class="gun-stat">abc</span>
          <br/>
          <img class="stat-img" src="./img/stats/power.png">
          <img class="stat-img stat-img-col2" src="./img/stats/accuracy.png">
          <span class="gun-stat">abc</span>
        </div>
      </div>
    `, "text/html");
    const nodes = [...slotDoc.body.children];

    this.img = slotDoc.getElementsByTagName('img')[0];
    this.name = slotDoc.getElementsByTagName('h5')[0];
    this.stats = slotDoc.getElementsByClassName('gun-stats')[0];
    
    nodes.forEach(node => this.node.appendChild(node));
  }

  set gun(val) {
    if(this._gun == null) this.createElements();
    this._gun = val;

    this.node.children[0].src = val.imgSrc;
    this.node.children[1].children[0].innerText = val.name;
    const quantity = `x${val.stats.bulletCount}`;
    const fireRate = `${val.stats.fireRate}/s`;
    const damage = `${val.stats.damage}dmg`;
    const accuracy = `${val.stats.spread}°`;
    this.stats.children[2].innerText = `${quantity}${"\xA0".repeat(9 - quantity.length)}${fireRate}`;
    this.stats.children[6].innerText = `${damage}${"\xA0".repeat(9 - damage.length)}${accuracy}`;
  }
}

class TurretSlot {
  constructor(container) {
    this._turret = null;
    this.node = document.createElement('div');
    this.node.classList.add('turret-slot');
    this.node.classList.add('h-flex');

    container.appendChild(this.node);
  }

  createElements() {
    const slotDoc = new DOMParser().parseFromString(`
      <img class="turret-base-img" src="./img/guns/turret_base.png">
      <img class="turret-img">
      <div class="v-flex gun-info">
        <h5 class="gun-stat"></h5>
        <div class="turret-hpbar-outer">
          <div class="turret-hpbar-inner"></div>
        </div>
        <span class="gun-stat turret-deployment-status">Not deployed</span>
        <div class="gun-stats">
          <img class="stat-img" src="./img/stats/quantity.png">
          <img class="stat-img stat-img-col2" src="./img/stats/firerate.png">
          <span class="gun-stat">abc</span>
          <br/>
          <img class="stat-img" src="./img/stats/power.png">
          <img class="stat-img stat-img-col2" src="./img/stats/accuracy.png">
          <span class="gun-stat">abc</span>
        </div>
      </div>
    `, "text/html");
    const nodes = [...slotDoc.body.children];

    this.img = slotDoc.getElementsByTagName('img')[0];
    this.name = slotDoc.getElementsByTagName('h5')[0];
    this.stats = slotDoc.getElementsByClassName('gun-stats')[0];
    
    nodes.forEach(node => this.node.appendChild(node));
  }

  set turret(val) {
    if(this._turret == null) this.createElements();
    this._turret = val;

    this.node.children[1].src = val.gun.imgSrc;
    this.node.children[2].children[0].innerText = val.gun.name + '\nTurret';
    const quantity = `x${val.gun.stats.bulletCount}`;
    const fireRate = `${val.gun.stats.fireRate}/s`;
    const damage = `${val.gun.stats.damage}dmg`;
    const accuracy = `${val.gun.stats.spread}°`;
    this.stats.children[2].innerText = `${quantity}${"\xA0".repeat(9 - quantity.length)}${fireRate}`;
    this.stats.children[6].innerText = `${damage}${"\xA0".repeat(9 - damage.length)}${accuracy}`;
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
      if(this.inventory.guns.length > idx) {
        slot.gun = this.inventory.guns[idx];
      }
    });

    this.turretSlots.forEach((slot, idx) => {
      if(this.inventory.turrets.length > idx) {
        slot.turret = this.inventory.turrets[idx];
      }
    })
  }

  set hp(val) {
    this.hpbar.style.width = `${val}%`;
  }
}