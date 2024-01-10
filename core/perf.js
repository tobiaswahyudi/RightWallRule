import { CONFIG } from "../config.js";
import { CircularBuffer } from "../utils/circularBuffer.js";

/**************************************
 * Performance Counter
 * 
 * Logs frames per second.
 **************************************/
export class PerfCounter {
  constructor() {
    this.ticksPerSecond = new CircularBuffer(10);
    this.lastSecondLogged = 0;
    this.ticksThisSecond = 0;

    this.tickDurations = new CircularBuffer(CONFIG.FPS * 2);
  }

  firstTick() {
    this.lastSecondLogged = new Date().getTime();
  }

  logTickStart() {
    const timeNow = new Date().getTime();
    if(timeNow - this.lastSecondLogged >= 1000) {
      this.ticksPerSecond.push(this.ticksThisSecond);
      this.ticksThisSecond = -1;
      this.lastSecondLogged = timeNow;
    }
    this.ticksThisSecond++;

    this.lastTickStart = timeNow;
  }

  logTickEnd() {
    const timeNow = new Date().getTime();
    this.tickDurations.push(timeNow - this.lastTickStart);
  }

  get fps() {
    if(this.ticksPerSecond.length == 0) return 0;
    const total = this.ticksPerSecond.reduce((a,b) => a+b);
    return total/this.ticksPerSecond.length;
  }

  get tickAvg() {
    if(this.tickDurations.length == 0) return 0;
    const total = this.tickDurations.reduce((a,b) => a+b);
    return total/this.tickDurations.length;
  }

  get maxTps() {
    if(this.tickDurations.length == 0) return 0;
    const total = this.tickDurations.reduce((a,b) => a+b);
    return 1000 * this.tickDurations.length/total;
  }
}