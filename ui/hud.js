const GUN_STATS_HTML = `
<div class="gun-stats">
  <img class="stat-img" src="./img/stats/quantity.png">
  <img class="stat-img stat-img-col2" src="./img/stats/firerate.png">
  <span class="gun-stat">abc</span>
  <br/>
  <img class="stat-img" src="./img/stats/accuracy.png">
  <img class="stat-img stat-img-col2" src="./img/stats/power.png">
  <span class="gun-stat">abc</span>
</div>
`

function displayGunStats(gunStatsCtr, stats) {
  const quantity = `x${stats.bulletCount}`;
  const fireRate = `${stats.fireRate.toFixed(1)}/s`;
  const damage = `${stats.damage.toFixed(1)}dmg`;
  const accuracy = `${stats.spread.toFixed(1)}°`;
  gunStatsCtr.children[2].innerText = `${quantity}${"\xA0".repeat(9 - quantity.length)}${fireRate}`;
  gunStatsCtr.children[6].innerText = `${accuracy}${"\xA0".repeat(9 - accuracy.length)}${damage}`;
}

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
        ${GUN_STATS_HTML}
      </div>
    `, "text/html");
    const nodes = [...slotDoc.body.children];

    this.img = slotDoc.getElementsByTagName('img')[0];
    this.name = slotDoc.getElementsByTagName('h5')[0];
    this.stats = slotDoc.getElementsByClassName('gun-stats')[0];
    
    nodes.forEach(node => this.node.appendChild(node));
  }

  destroyElements() {
    [...this.node.children].forEach(e => e.remove());
  }

  set gun(val) {
    if(!this._gun) this.createElements();
    this._gun = val;
    if(!this._gun) {
      this.destroyElements();
      return;
    }

    this.node.children[0].src = val.imgSrc;
    this.node.children[1].children[0].innerText = val.name;
    displayGunStats(this.stats, val.stats);
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
        ${GUN_STATS_HTML}
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

    this.node.children[3].children[2].innerText = val.deployed ? `Recallable in 0:30` : "Not Deployed";

    displayGunStats(this.stats, val.gun.stats);
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