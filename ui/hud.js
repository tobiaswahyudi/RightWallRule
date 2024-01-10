export class GunSlot {
  constructor(container, gun) {
    this._gun = null;
    this.node = document.createElement('div');
    this.node.classList.add('gun-slot');
    this.node.classList.add('h-flex');

    container.appendChild(this.node);
    if(gun) this.gun = gun;
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
    if(!this._gun) this.createElements();
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
  constructor(container, turret, idx) {
    this._turret = null;
    this.node = document.createElement('div');
    this.node.classList.add('turret-slot');
    this.node.classList.add('h-flex');

    const keyTag = document.createElement('div');
    keyTag.classList.add('key-tag');
    keyTag.innerText = idx + 1;
    this.node.appendChild(keyTag);

    container.appendChild(this.node);
    if(turret) this.turret = turret;
  }

  createElements() {
    const slotDoc = new DOMParser().parseFromString(`
      <img class="turret-base-img">
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
    if(!this._turret) this.createElements();
    this._turret = val;

    this.node.children[1].src = "./img/guns/turret_base.png";
    this.node.children[2].src = val.gun.imgSrc;
    this.node.children[3].children[0].innerText = val.gun.name + '\nTurret';
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

    this.gunSlots = this.inventory.guns.map(gun => new GunSlot(this.gunsContainer, gun));
    this.turretSlots = this.inventory.turrets.map((turret, idx) => new TurretSlot(this.turretsContainer, turret, idx));

    this.update();
  }

  update() {
    this.gunSlots.forEach((slot, idx) => {
      if(this.inventory.guns[idx]) {
        slot.gun = this.inventory.guns[idx];
      }
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