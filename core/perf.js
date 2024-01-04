/**************************************
 * Performance Counter
 * 
 * Logs frames per second.
 **************************************/
class PerfCounter {
  constructor() {
    this.ticksPerSecond = [];
    this.secondIndex = 0;
    this.lastTickSecond = 0;
    this.ticksThisSecond = 0;

    // The window width, in seconds.
    this.windowWidth = 10;
  }

  firstTick() {
    this.lastTickSecond = new Date().getSeconds();
  }

  logTick() {
    const thisSecond = new Date().getSeconds();
    if(this.lastTickSecond != thisSecond) {
      if(this.ticksPerSecond.length == this.windowWidth) {
        this.secondIndex %= this.windowWidth;
        this.ticksPerSecond[this.secondIndex] = this.ticksThisSecond;
      } else {
        this.ticksPerSecond.push(this.ticksThisSecond);
      }
      this.ticksThisSecond = 0;
      this.secondIndex++;
    }
    this.ticksThisSecond++;
    this.lastTickSecond = thisSecond;
  }

  get fps() {
    if(this.ticksPerSecond.length == 0) return 0;
    const total = this.ticksPerSecond.reduce((a,b) => a+b);
    return total/this.ticksPerSecond.length;
  }
}