import { GunStatsDisplay } from "./gunStats.js";

const TURRET_STATUS_LABELS = {
  rooting: 'Taking root for ${TIME}s',
  notDeployed: 'Not Deployed',
  recallDelay: 'Recallable in ${TIME}s',
  recallable: 'Press ${IDX} to recall!',
};

const TURRET_STATUS_LABEL_TIME_REPLACE = '${TIME}';
const TURRET_STATUS_LABEL_IDX_REPLACE = '${IDX}';
export class GunSlotDisplay {
  constructor(container, gun, extended) {
    this._gun = null;
    this.node = document.createElement('div');
    this.node.classList.add('gun-slot');
    this.node.classList.add('h-flex');
    this.stats = null;
    this.extended = extended;

    container.appendChild(this.node);
    if(gun) this.val = gun;
  }

  createElements() {
    const slotDoc = new DOMParser().parseFromString(`
      <img class="gun-img">
      <div class="v-flex gun-info">
        <h5 class="gun-stat"></h5>
      </div>
    `, "text/html");
    const nodes = [...slotDoc.body.children];

    this.img = slotDoc.getElementsByTagName('img')[0];
    this.name = slotDoc.getElementsByTagName('h5')[0];
    this.stats = new GunStatsDisplay(slotDoc.getElementsByClassName('gun-info')[0], this._gun.stats, this.extended);
    
    nodes.forEach(node => this.node.appendChild(node));
  }

  destroyElements() {
    [...this.node.children].forEach(e => e.remove());
    this.stats = null;
  }

  set val(val) {
    if(!this._gun && val) {
      this._gun = val;
      this.createElements();
    }
    this._gun = val;
    if(!val) {
      this.destroyElements();
      return;
    }

    this.node.children[0].src = val.imgSrc;
    this.node.children[1].children[0].innerText = val.name;
    this.stats.gunStats = val.stats;
  }
}
export class TurretSlotDisplay {
  constructor(container, turret, extended, idx = -1) {
    this._turret = null;
    this.node = document.createElement('div');
    this.node.classList.add('turret-slot');
    this.node.classList.add('h-flex');
    this.stats = null;
    this.deploymentStatusNode = null;
    this.extended = extended;

    const keyTag = document.createElement('div');
    keyTag.classList.add('key-tag');
    keyTag.innerText = idx + 1;
    this.idx = idx;
    this.node.appendChild(keyTag);
    // Still append the keyTag, otherwise indexing node.children gets finicky
    if(idx == -1) keyTag.style.display = "none";

    container.appendChild(this.node);
    if(turret) this.val = turret;
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
      </div>
    `, "text/html");
    const nodes = [...slotDoc.body.children];

    this.img = slotDoc.getElementsByTagName('img')[0];
    this.name = slotDoc.getElementsByTagName('h5')[0];
    this.stats = new GunStatsDisplay(slotDoc.getElementsByClassName('gun-info')[0], this._turret.gun.stats, this.extended);
    nodes.forEach(node => this.node.appendChild(node));

    this.deploymentStatusNode = this.node.children[3].children[2];
  }

  set val(val) {
    if(!this._turret) {
      this._turret = val;
      this.createElements();
    }
    this._turret = val;
    this._turret.notifyTurretStatusChange = this.notifyTurretStatusChange.bind(this);
    this.node.children[1].src = "./img/guns/turret_base.png";
    this.node.children[2].src = val.gun.imgSrc;
    this.node.children[3].children[0].innerText = val.gun.name + '\nTurret';
    this.stats.gunStats = val.gun.stats;

    this.notifyTurretStatusChange();
  }

  notifyTurretStatusChange() {
    const statusTime = this._turret._lastStatusTime;
    this.deploymentStatusNode.innerText = TURRET_STATUS_LABELS[this._turret.status]
      .replace(TURRET_STATUS_LABEL_TIME_REPLACE, statusTime)
      .replace(TURRET_STATUS_LABEL_IDX_REPLACE, this.idx + 1);
  }
}