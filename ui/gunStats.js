export class GunStatsDisplay {
  constructor(container, gunStats, extended = false) {
    const doc = new DOMParser().parseFromString(`
    <div class="gun-stats${extended ? " extended" : ""}">
      <img class="stat-img" src="./img/stats/quantity.png">
      <img class="stat-img stat-img-col2" src="./img/stats/firerate.png">
      <span class="gun-stat">abc</span>
      <br/>
      <img class="stat-img" src="./img/stats/accuracy.png">
      <img class="stat-img stat-img-col2" src="./img/stats/power.png">
      <span class="gun-stat">abc</span>
      ${!extended ? "" : `
      <br/>
      <img class="stat-img" src="./img/stats/speed.png">
      <span class="gun-stat">abc</span>
      <br/>
      <br/>
      <img class="stat-img" src="./img/stats/goodness.png">
      <span class="gun-stat">abc</span>
      <br/>
      <img class="stat-img" src="./img/stats/kills.png">
      <span class="gun-stat">abc</span>
      <br/>
      <br/>
      <span class="gun-stat">No special effects</span>
      `}
    </div>
    `, "text/html");

    this.node = doc.body.children[0];
    this.statLines = [...doc.getElementsByTagName('span')];
    this.extended = extended;
    this.gunStats = gunStats;

    container.appendChild(this.node);
  }

  update() {
    const quantity = `x${this._gunStats.bulletCount}`;
    const fireRate = `${this._gunStats.fireRate.toFixed(1)}/s`;
    const damage = `${this._gunStats.damage.toFixed(1)}dmg`;
    const accuracy = `${this._gunStats.spread.toFixed(1)}°`;
    this.statLines[0].innerText = `${quantity}${"\xA0".repeat(9 - quantity.length)}${fireRate}`;
    this.statLines[1].innerText = `${accuracy}${"\xA0".repeat(9 - accuracy.length)}${damage}`;
    if(this.extended) {
      const speed = `${this._gunStats.bulletSpeed.toFixed(1)}px/s`;
      const goodness = `${this._gunStats.goodness.toFixed(1)} goodness`;
      const kills = `${this._gunStats.kills} kills`;
      this.statLines[2].innerText = speed;
      this.statLines[3].innerText = goodness;
      this.statLines[4].innerText = kills;
    }
  }

  set gunStats(val) {
    this._gunStats = val;
    this.update();
  }
}