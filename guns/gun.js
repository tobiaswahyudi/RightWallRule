import { CONFIG } from "../config.js";
import { Bullet } from "../entities/bullet.js";
import { ImageSrc } from "../utils/image.js";

const MULTISHOT_SPREAD = 2;

export class GunStats {
  constructor(bulletCount, fireRate, bulletSpeed, damage, spread) {
    this.bulletCount = bulletCount;
    this.fireRate = fireRate;
    this.bulletSpeed = bulletSpeed;
    this.damage = damage;
    this.spread = spread;
  }

  get fireDelay() {
    return CONFIG.FPS/this.fireRate;
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
        bullets.push(new Bullet(position.x, position.y, this.color, direction.rotate(baseAngle + deltaAngle), this.stats.bulletSpeed));
      }
      return bullets;
    }
    return [];
  }
}