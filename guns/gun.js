import { CONFIG } from "../config.js";
import { Bullet } from "../entities/bullet.js";
import { ImageSrc } from "../utils/image.js";
import { coinFlip, normalSample } from "../utils/random.js";

const MULTISHOT_SPREAD = 2;


function bulletCountToGoodness(count) {
  return count;
}
function goodnessToBulletCount(goodness) {
  return Math.round(goodness);
}

function fireRateToGoodness(rate) {
  return (rate - 0.5) / 9.5 * 5;
}
function goodnessToFireRate(goodness) {
  return ((goodness / 5 * 9.5) + 0.5);
}

function damageToGoodness(dmg) {
  return (dmg - 0.2) / 2 * 5;
}
function goodnessToDamage(goodness) {
  return ((goodness / 5 * 2) + 0.2);
}

function randomGunStatsFromGoodness(targetGoodness) {
  const randomRatios = Array(3).fill(0).map(x => 1/Math.random() - 1); 
  const ratioSum = randomRatios.reduce((a,b) => a+b);
  const goodnesses = randomRatios.map(r => Math.exp((r / ratioSum) * Math.log(targetGoodness)));
  return new GunStats(
    goodnessToBulletCount(goodnesses[0]),
    goodnessToFireRate(goodnesses[1]),
    Math.random() * 12 + 4,
    goodnessToDamage(goodnesses[2]),
    Math.random() * 25
  );
}
export class GunStats {
  constructor(bulletCount, fireRate, bulletSpeed, damage, spread) {
    this.bulletCount = bulletCount;
    this.fireRate = fireRate;
    this.bulletSpeed = bulletSpeed;
    this.damage = damage;
    this.spread = spread;
    this.kills = 0;
  }

  get fireDelay() {
    return CONFIG.FPS/this.fireRate;
  }

  get goodness() {
    return (bulletCountToGoodness(this.bulletCount) + 1) * (fireRateToGoodness(this.fireRate) + 1) * (damageToGoodness(this.damage) + 1);
  }

  get copy() {
    const cpy = new GunStats();
    cpy.bulletCount = this.bulletCount;
    cpy.fireRate = this.fireRate;
    cpy.bulletSpeed = this.bulletSpeed;
    cpy.damage = this.damage;
    cpy.spread = this.spread;
    cpy.kills = this.kills;
    return cpy;
  }

  upgrade(additiveFactor, multiplicativeFactor = 10) {
    const targetGoodness = Math.min(this.goodness + additiveFactor, this.goodness * multiplicativeFactor);
    const goodnessRatio = targetGoodness / this.goodness;
    const randomRatios = Array(3).fill(0).map(x => 1/Math.random() - 1);
    const randomRatioSum = randomRatios.reduce((a,b) => a+b);
    const goodnesses = randomRatios.map(randomRatio => Math.exp((randomRatio / randomRatioSum) * Math.log(goodnessRatio)));
    this.bulletCount = goodnessToBulletCount(bulletCountToGoodness(this.bulletCount) * goodnesses[0]);
    this.fireRate = goodnessToFireRate(fireRateToGoodness(this.fireRate) * goodnesses[1]);
    this.damage = goodnessToDamage(damageToGoodness(this.damage) * goodnesses[2]);
  }
}
export class Gun {
  constructor(name, imgSrc, bulletColor, gunStats) {
    this.name = name;
    this.imgSrc = imgSrc;
    this.image = ImageSrc(imgSrc);
    this.color = bulletColor;
    this.stats = gunStats;

    this.nextShoot = 0;
  }

  shoot(ticks, position, direction) {
    if(ticks >= this.nextShoot) {
      this.nextShoot = ticks + this.stats.fireDelay;
      const bullets = [];
      for(let i = 0; i < this.stats.bulletCount; i++) {
        const baseAngle = (i - (this.stats.bulletCount - 1) / 2) * MULTISHOT_SPREAD;
        const deltaAngle = (Math.random() * 2 - 1) * this.stats.spread;
        bullets.push(new Bullet(position.x, position.y, this.color, direction.rotate(baseAngle + deltaAngle), this.stats));
      }
      return bullets;
    }
    return [];
  }

  get copy() {
    return new Gun(this.name, this.imgSrc, this.color, this.stats.copy);
  }
};

export function createRandomGun() {
  const targetGoodness = Math.max(5, normalSample() * 12 + 20);
  
  return new Gun(
    crypto.randomUUID().slice(0, 13),
    "./img/guns/placeholder.png",
    "#55FF00",
    randomGunStatsFromGoodness(targetGoodness)
  );
}

export function crossbreedGuns(gun1, gun2) {
  const name = "Bred Sub";
  const imgSrc = coinFlip() ? gun1.imgSrc : gun2.imgSrc;
  const color = coinFlip() ? gun1.color : gun2.color;

  const stats = new GunStats(
    coinFlip() ? gun1.stats.bulletCount : gun2.stats.bulletCount,
    coinFlip() ? gun1.stats.fireRate : gun2.stats.fireRate,
    coinFlip() ? gun1.stats.bulletSpeed : gun2.stats.bulletSpeed,
    coinFlip() ? gun1.stats.damage : gun2.stats.damage,
    coinFlip() ? gun1.stats.spread : gun2.stats.spread
  );
  stats.upgrade(50, 1.2);
  
  return new Gun(
    name,
    imgSrc,
    color,
    stats
  );
}